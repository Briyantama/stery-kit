package objstore_test

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/Briyantama/stery-kit/go/objstore"
)

func publicConfig(public string) objstore.S3Config {
	return objstore.S3Config{
		Endpoint:        "http://rustfs:9000",
		PublicEndpoint:  public,
		Region:          "us-east-1",
		Bucket:          "kit-media",
		AccessKeyID:     "key",
		SecretAccessKey: "secret",
		PathStyle:       true,
	}
}

// Signed URLs go to browsers, which cannot reach a service name such as rustfs inside the private
// network, so they are signed for the public endpoint while the server keeps using the internal one.
func TestS3_signedUrlsPointAtThePublicEndpoint(t *testing.T) {
	// Arrange
	store, err := objstore.NewS3(publicConfig("https://files.kit.example.test"))
	if err != nil {
		t.Fatalf("NewS3: %v", err)
	}
	ctx := context.Background()

	// Act
	get, getErr := store.PresignGet(ctx, "media/e/1", time.Minute)
	put, putErr := store.PresignPut(ctx, "incoming/e/1", "image/jpeg", 10, time.Minute)

	// Assert
	if getErr != nil || !strings.HasPrefix(get, "https://files.kit.example.test/kit-media/media/e/1?") {
		t.Fatalf("download url = %q, %v; want the public endpoint", get, getErr)
	}
	if putErr != nil || !strings.HasPrefix(put.URL, "https://files.kit.example.test/kit-media/incoming/e/1?") {
		t.Fatalf("upload url = %q, %v; want the public endpoint", put.URL, putErr)
	}
}

func TestS3_signedUrlsUseTheStorageEndpointWhenNoPublicOneIsSet(t *testing.T) {
	// Arrange
	store, err := objstore.NewS3(publicConfig(""))
	if err != nil {
		t.Fatalf("NewS3: %v", err)
	}

	// Act
	get, getErr := store.PresignGet(context.Background(), "media/e/1", time.Minute)

	// Assert
	if getErr != nil || !strings.HasPrefix(get, "http://rustfs:9000/kit-media/media/e/1?") {
		t.Fatalf("download url = %q, %v; want the storage endpoint", get, getErr)
	}
}
