package objstore

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
)

// S3Config locates an S3-compatible bucket.
type S3Config struct {
	Endpoint string
	// PublicEndpoint is the origin signed URLs are signed for, because browsers use them. It defaults
	// to Endpoint; set it when the server reaches the bucket by a name only the private network knows.
	PublicEndpoint  string
	Region          string
	Bucket          string
	AccessKeyID     string
	SecretAccessKey string
	PathStyle       bool
}

// S3 is a Store backed by an S3-compatible service (AWS S3, RustFS, ...).
type S3 struct {
	client  *s3.Client
	presign *s3.PresignClient
	bucket  string
}

// NewS3 builds the client. It does not contact the service.
func NewS3(cfg S3Config) (*S3, error) {
	var missing []string
	for _, field := range []struct{ name, value string }{
		{"endpoint", cfg.Endpoint}, {"region", cfg.Region}, {"bucket", cfg.Bucket},
		{"access key id", cfg.AccessKeyID}, {"secret access key", cfg.SecretAccessKey},
	} {
		if field.value == "" {
			missing = append(missing, field.name)
		}
	}
	if len(missing) > 0 {
		return nil, fmt.Errorf("objstore: missing S3 %s", strings.Join(missing, ", "))
	}
	client := s3.New(s3.Options{
		Region:       cfg.Region,
		BaseEndpoint: aws.String(cfg.Endpoint),
		UsePathStyle: cfg.PathStyle,
		Credentials:  credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		// Only add checksums when an operation requires them: pre-signed uploads come from browsers
		// that cannot compute them, and S3-compatible services differ in checksum support.
		RequestChecksumCalculation: aws.RequestChecksumCalculationWhenRequired,
		ResponseChecksumValidation: aws.ResponseChecksumValidationWhenRequired,
	})
	// Signed URLs are signed for the host browsers use, so they come from a client built on the public
	// endpoint. Everything the server does itself goes through the client on the storage endpoint.
	signer := client
	if cfg.PublicEndpoint != "" && cfg.PublicEndpoint != cfg.Endpoint {
		signer = s3.New(s3.Options{
			Region:       cfg.Region,
			BaseEndpoint: aws.String(cfg.PublicEndpoint),
			UsePathStyle: cfg.PathStyle,
			Credentials:  credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),

			RequestChecksumCalculation: aws.RequestChecksumCalculationWhenRequired,
			ResponseChecksumValidation: aws.ResponseChecksumValidationWhenRequired,
		})
	}
	return &S3{client: client, presign: s3.NewPresignClient(signer), bucket: cfg.Bucket}, nil
}

func (s *S3) PresignPut(ctx context.Context, key, contentType string, size int64, ttl time.Duration) (PresignedRequest, error) {
	req, err := s.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(size),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return PresignedRequest{}, fmt.Errorf("presign put: %w", err)
	}
	headers := map[string]string{
		"Content-Type":   contentType,
		"Content-Length": strconv.FormatInt(size, 10),
	}
	for name, values := range req.SignedHeader {
		canonical := http.CanonicalHeaderKey(name)
		if canonical == "Host" || len(values) == 0 {
			continue
		}
		if _, set := headers[canonical]; !set {
			headers[canonical] = values[0]
		}
	}
	return PresignedRequest{Method: req.Method, URL: req.URL, Headers: headers, ExpiresAt: time.Now().Add(ttl)}, nil
}

func (s *S3) PresignGet(ctx context.Context, key string, ttl time.Duration) (string, error) {
	req, err := s.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", fmt.Errorf("presign get: %w", err)
	}
	return req.URL, nil
}

func (s *S3) Head(ctx context.Context, key string) (ObjectInfo, error) {
	out, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{Bucket: aws.String(s.bucket), Key: aws.String(key)})
	if err != nil {
		return ObjectInfo{}, classify("head", err)
	}
	return ObjectInfo{Size: aws.ToInt64(out.ContentLength), ContentType: aws.ToString(out.ContentType)}, nil
}

func (s *S3) Get(ctx context.Context, key string, maxBytes int64) ([]byte, error) {
	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{Bucket: aws.String(s.bucket), Key: aws.String(key)})
	if err != nil {
		return nil, classify("get", err)
	}
	defer func() { _ = out.Body.Close() }()
	if aws.ToInt64(out.ContentLength) > maxBytes {
		return nil, ErrTooLarge
	}
	body, err := io.ReadAll(io.LimitReader(out.Body, maxBytes+1))
	if err != nil {
		return nil, fmt.Errorf("read object: %w", err)
	}
	if int64(len(body)) > maxBytes {
		return nil, ErrTooLarge
	}
	return body, nil
}

// Open returns the object's body as it arrives from S3. An object larger than maxBytes is refused from
// its declared length, and a body that turns out longer than it declared is cut off with ErrTooLarge.
func (s *S3) Open(ctx context.Context, key string, maxBytes int64) (io.ReadCloser, error) {
	out, err := s.client.GetObject(ctx, &s3.GetObjectInput{Bucket: aws.String(s.bucket), Key: aws.String(key)})
	if err != nil {
		return nil, classify("get", err)
	}
	if aws.ToInt64(out.ContentLength) > maxBytes {
		_ = out.Body.Close()
		return nil, ErrTooLarge
	}
	return &limitedBody{rc: out.Body, left: maxBytes}, nil
}

// limitedBody fails with ErrTooLarge instead of delivering more than the allowed number of bytes.
type limitedBody struct {
	rc   io.ReadCloser
	left int64
}

func (l *limitedBody) Read(p []byte) (int, error) {
	if l.left < 0 {
		return 0, ErrTooLarge
	}
	if int64(len(p)) > l.left+1 {
		p = p[:l.left+1]
	}
	n, err := l.rc.Read(p)
	l.left -= int64(n)
	if l.left < 0 {
		return n - 1, ErrTooLarge
	}
	return n, err
}

func (l *limitedBody) Close() error { return l.rc.Close() }

func (s *S3) Put(ctx context.Context, key, contentType string, body []byte) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(int64(len(body))),
		Body:          bytes.NewReader(body),
	})
	if err != nil {
		return fmt.Errorf("put object: %w", err)
	}
	return nil
}

// multipartPartSize is S3's smallest allowed part. A body that fits in one part is stored with a
// plain PUT, so small streams cost no extra round trips.
const multipartPartSize = 5 << 20

// PutStream uploads body in parts of multipartPartSize, so memory use is one part however large the
// object is. A failure while reading or uploading aborts the multipart upload, leaving no object.
func (s *S3) PutStream(ctx context.Context, key, contentType string, body io.Reader) (int64, error) {
	buf := make([]byte, multipartPartSize)
	n, err := io.ReadFull(body, buf)
	switch {
	case errors.Is(err, io.EOF), errors.Is(err, io.ErrUnexpectedEOF):
		if err := s.Put(ctx, key, contentType, buf[:n]); err != nil {
			return 0, err
		}
		return int64(n), nil
	case err != nil:
		return 0, fmt.Errorf("read stream: %w", err)
	}

	created, err := s.client.CreateMultipartUpload(ctx, &s3.CreateMultipartUploadInput{
		Bucket: aws.String(s.bucket), Key: aws.String(key), ContentType: aws.String(contentType),
	})
	if err != nil {
		return 0, fmt.Errorf("start multipart upload: %w", err)
	}
	uploadID := created.UploadId
	abort := func(cause error) (int64, error) {
		// The request context may be the reason for the failure, so the abort must outlive it.
		_, _ = s.client.AbortMultipartUpload(context.WithoutCancel(ctx), &s3.AbortMultipartUploadInput{
			Bucket: aws.String(s.bucket), Key: aws.String(key), UploadId: uploadID,
		})
		return 0, cause
	}

	var parts []types.CompletedPart
	var total int64
	chunk := buf[:n]
	for number := int32(1); ; number++ {
		uploaded, err := s.client.UploadPart(ctx, &s3.UploadPartInput{
			Bucket: aws.String(s.bucket), Key: aws.String(key), UploadId: uploadID,
			PartNumber: aws.Int32(number), Body: bytes.NewReader(chunk), ContentLength: aws.Int64(int64(len(chunk))),
		})
		if err != nil {
			return abort(fmt.Errorf("upload part %d: %w", number, err))
		}
		parts = append(parts, types.CompletedPart{ETag: uploaded.ETag, PartNumber: aws.Int32(number)})
		total += int64(len(chunk))

		m, readErr := io.ReadFull(body, buf)
		switch {
		case readErr == nil:
			chunk = buf[:m] // a full part: loop to upload it
		case errors.Is(readErr, io.EOF):
			return s.completeStream(ctx, key, uploadID, parts, total, abort)
		case errors.Is(readErr, io.ErrUnexpectedEOF):
			// The last, short part: upload it, then finish.
			number++
			last, err := s.client.UploadPart(ctx, &s3.UploadPartInput{
				Bucket: aws.String(s.bucket), Key: aws.String(key), UploadId: uploadID,
				PartNumber: aws.Int32(number), Body: bytes.NewReader(buf[:m]), ContentLength: aws.Int64(int64(m)),
			})
			if err != nil {
				return abort(fmt.Errorf("upload part %d: %w", number, err))
			}
			parts = append(parts, types.CompletedPart{ETag: last.ETag, PartNumber: aws.Int32(number)})
			return s.completeStream(ctx, key, uploadID, parts, total+int64(m), abort)
		default:
			return abort(fmt.Errorf("read stream: %w", readErr))
		}
	}
}

func (s *S3) completeStream(
	ctx context.Context, key string, uploadID *string, parts []types.CompletedPart, total int64,
	abort func(error) (int64, error),
) (int64, error) {
	if _, err := s.client.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
		Bucket: aws.String(s.bucket), Key: aws.String(key), UploadId: uploadID,
		MultipartUpload: &types.CompletedMultipartUpload{Parts: parts},
	}); err != nil {
		return abort(fmt.Errorf("complete multipart upload: %w", err))
	}
	return total, nil
}

func (s *S3) Delete(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{Bucket: aws.String(s.bucket), Key: aws.String(key)})
	if err != nil {
		return fmt.Errorf("delete object: %w", err)
	}
	return nil
}

// classify maps the service's "no such object" answers to ErrNotFound.
func classify(op string, err error) error {
	var apiErr smithy.APIError
	if errors.As(err, &apiErr) {
		switch apiErr.ErrorCode() {
		case "NotFound", "NoSuchKey":
			return ErrNotFound
		}
	}
	return fmt.Errorf("%s object: %w", op, err)
}
