package objstore_test

import (
	"bytes"
	"context"
	"errors"
	"io"
	"testing"
	"time"

	"github.com/Briyantama/stery-kit/go/objstore"
)

// failingReader yields an error where a real upload would lose its source.
type failingReader struct{}

func (failingReader) Read([]byte) (int, error) { return 0, errors.New("source went away") }

// runContract checks the behaviour every Store must share, under a key prefix unique to the caller.
func runContract(t *testing.T, store objstore.Store, prefix string) {
	t.Helper()
	ctx := context.Background()

	t.Run("put then head and get", func(t *testing.T) {
		// Arrange
		key := prefix + "/put-get"
		body := []byte("hello kit")

		// Act
		if err := store.Put(ctx, key, "image/png", body); err != nil {
			t.Fatalf("Put: %v", err)
		}
		info, headErr := store.Head(ctx, key)
		got, getErr := store.Get(ctx, key, 1024)

		// Assert
		if headErr != nil || info.Size != int64(len(body)) || info.ContentType != "image/png" {
			t.Fatalf("Head = %+v, %v; want size %d image/png", info, headErr, len(body))
		}
		if getErr != nil || !bytes.Equal(got, body) {
			t.Fatalf("Get = %q, %v; want %q", got, getErr, body)
		}
	})

	t.Run("missing object is ErrNotFound", func(t *testing.T) {
		// Act
		_, headErr := store.Head(ctx, prefix+"/missing")
		_, getErr := store.Get(ctx, prefix+"/missing", 1024)

		// Assert
		if !errors.Is(headErr, objstore.ErrNotFound) || !errors.Is(getErr, objstore.ErrNotFound) {
			t.Fatalf("Head err = %v, Get err = %v; want ErrNotFound", headErr, getErr)
		}
	})

	t.Run("get refuses an object over the byte limit", func(t *testing.T) {
		// Arrange
		key := prefix + "/too-large"
		if err := store.Put(ctx, key, "image/jpeg", bytes.Repeat([]byte{1}, 64)); err != nil {
			t.Fatalf("Put: %v", err)
		}

		// Act
		_, err := store.Get(ctx, key, 63)

		// Assert
		if !errors.Is(err, objstore.ErrTooLarge) {
			t.Fatalf("Get err = %v, want ErrTooLarge", err)
		}
	})

	t.Run("delete is idempotent", func(t *testing.T) {
		// Arrange
		key := prefix + "/delete"
		if err := store.Put(ctx, key, "image/webp", []byte("x")); err != nil {
			t.Fatalf("Put: %v", err)
		}

		// Act
		first := store.Delete(ctx, key)
		second := store.Delete(ctx, key)
		_, headErr := store.Head(ctx, key)

		// Assert
		if first != nil || second != nil {
			t.Fatalf("Delete = %v then %v, want nil twice", first, second)
		}
		if !errors.Is(headErr, objstore.ErrNotFound) {
			t.Fatalf("Head after delete = %v, want ErrNotFound", headErr)
		}
	})

	t.Run("presigned put names the method, headers and expiry", func(t *testing.T) {
		// Arrange
		before := time.Now()

		// Act
		req, err := store.PresignPut(ctx, prefix+"/presigned", "image/jpeg", 123, 10*time.Minute)

		// Assert
		if err != nil {
			t.Fatalf("PresignPut: %v", err)
		}
		if req.Method != "PUT" || req.URL == "" {
			t.Fatalf("PresignPut = %+v, want a PUT URL", req)
		}
		if req.Headers["Content-Type"] != "image/jpeg" || req.Headers["Content-Length"] != "123" {
			t.Fatalf("headers = %v, want the signed Content-Type and Content-Length", req.Headers)
		}
		if req.ExpiresAt.Before(before.Add(9*time.Minute)) || req.ExpiresAt.After(before.Add(11*time.Minute)) {
			t.Fatalf("ExpiresAt = %v, want about 10 minutes from now", req.ExpiresAt)
		}
	})

	t.Run("put stream stores a body of unknown length, small and multipart sized", func(t *testing.T) {
		// Arrange: 12 MiB + 1 spans three 5 MiB parts on S3; the small one is a single part.
		tests := []struct {
			name string
			size int
		}{{"small", 10}, {"multipart", 12<<20 + 1}}
		for _, tc := range tests {
			key := prefix + "/stream-" + tc.name
			body := bytes.Repeat([]byte{7}, tc.size)

			// Act
			n, err := store.PutStream(ctx, key, "application/zip", bytes.NewReader(body))
			info, headErr := store.Head(ctx, key)

			// Assert
			if err != nil || n != int64(tc.size) {
				t.Fatalf("%s: PutStream = %d, %v; want %d, nil", tc.name, n, err, tc.size)
			}
			if headErr != nil || info.Size != int64(tc.size) || info.ContentType != "application/zip" {
				t.Fatalf("%s: Head = %+v, %v", tc.name, info, headErr)
			}
		}
	})

	t.Run("put stream leaves nothing behind when the reader fails", func(t *testing.T) {
		// Arrange
		key := prefix + "/stream-broken"
		broken := io.MultiReader(bytes.NewReader(bytes.Repeat([]byte{1}, 6<<20)), failingReader{})

		// Act
		_, err := store.PutStream(ctx, key, "application/zip", broken)
		_, headErr := store.Head(ctx, key)

		// Assert
		if err == nil {
			t.Fatal("PutStream err = nil, want the reader's failure")
		}
		if !errors.Is(headErr, objstore.ErrNotFound) {
			t.Fatalf("Head after a failed stream = %v, want ErrNotFound", headErr)
		}
	})

	t.Run("open streams the object and refuses one over the byte limit", func(t *testing.T) {
		// Arrange
		key := prefix + "/open"
		body := bytes.Repeat([]byte{9}, 2048)
		if err := store.Put(ctx, key, "video/mp4", body); err != nil {
			t.Fatalf("Put: %v", err)
		}

		// Act
		rc, openErr := store.Open(ctx, key, 4096)
		var got []byte
		var readErr error
		if openErr == nil {
			got, readErr = io.ReadAll(rc)
			_ = rc.Close()
		}
		_, tooLarge := store.Open(ctx, key, 2047)
		_, missing := store.Open(ctx, prefix+"/open-missing", 4096)

		// Assert
		if openErr != nil || readErr != nil || !bytes.Equal(got, body) {
			t.Fatalf("Open = %d bytes, %v / %v; want the stored body", len(got), openErr, readErr)
		}
		if !errors.Is(tooLarge, objstore.ErrTooLarge) {
			t.Fatalf("Open over the limit = %v, want ErrTooLarge", tooLarge)
		}
		if !errors.Is(missing, objstore.ErrNotFound) {
			t.Fatalf("Open of a missing key = %v, want ErrNotFound", missing)
		}
	})

	t.Run("presigned get returns a url", func(t *testing.T) {
		// Act
		url, err := store.PresignGet(ctx, prefix+"/put-get", time.Minute)

		// Assert
		if err != nil || url == "" {
			t.Fatalf("PresignGet = %q, %v", url, err)
		}
	})
}
