// Package objstore is the S3-compatible object storage behind event media (FSD 2.1). The bucket is
// private: browsers only ever reach it through short-lived pre-signed URLs (FR-SEC.1, FSD 8.5).
package objstore

import (
	"context"
	"errors"
	"io"
	"time"
)

var (
	// ErrNotFound means the object does not exist.
	ErrNotFound = errors.New("object not found")
	// ErrTooLarge means the object is larger than the caller allowed.
	ErrTooLarge = errors.New("object too large")
)

// PresignedRequest is an upload the browser performs directly against the bucket. Every header in
// Headers is part of the signature and must be sent exactly as given.
type PresignedRequest struct {
	Method    string
	URL       string
	Headers   map[string]string
	ExpiresAt time.Time
}

// ObjectInfo describes a stored object.
type ObjectInfo struct {
	Size        int64
	ContentType string
}

// Store is the subset of object storage the API uses.
type Store interface {
	// PresignPut signs a PUT for exactly size bytes of contentType; any other size or type is rejected.
	PresignPut(ctx context.Context, key, contentType string, size int64, ttl time.Duration) (PresignedRequest, error)
	// PresignGet signs a short-lived download URL.
	PresignGet(ctx context.Context, key string, ttl time.Duration) (string, error)
	Head(ctx context.Context, key string) (ObjectInfo, error)
	// Get reads the whole object, refusing one larger than maxBytes with ErrTooLarge.
	Get(ctx context.Context, key string, maxBytes int64) ([]byte, error)
	// Open streams the object so a large one never sits in memory, refusing one larger than maxBytes
	// with ErrTooLarge before any byte is read. The caller closes the reader.
	Open(ctx context.Context, key string, maxBytes int64) (io.ReadCloser, error)
	Put(ctx context.Context, key, contentType string, body []byte) error
	// PutStream stores everything body yields, whatever its length, without holding it all in memory,
	// and returns the number of bytes stored. If body fails, no object is left under key.
	PutStream(ctx context.Context, key, contentType string, body io.Reader) (int64, error)
	// Delete removes the object; deleting a missing object is not an error.
	Delete(ctx context.Context, key string) error
}
