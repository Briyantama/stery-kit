package httpx_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Briyantama/stery-kit/go/httpx"
)

func TestRequestID(t *testing.T) {
	tests := []struct {
		name, in string
		reused   bool
	}{
		{"reuses valid", "abc-123_x.y", true},
		{"max length", strings.Repeat("a", 128), true},
		{"too long", strings.Repeat("a", 129), false},
		{"bad chars", "a b\"c", false},
		{"empty", "", false},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			var inCtx string
			h := httpx.RequestID(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) { inCtx = httpx.RequestIDFrom(r.Context()) }))
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			if tc.in != "" {
				req.Header.Set("X-Request-ID", tc.in)
			}
			rec := httptest.NewRecorder()
			h.ServeHTTP(rec, req)

			got := rec.Header().Get("X-Request-ID")
			if got == "" || got != inCtx {
				t.Fatalf("header %q, ctx %q: want equal and non-empty", got, inCtx)
			}
			if tc.reused != (got == tc.in) {
				t.Errorf("id = %q, reused = %v, want reused = %v", got, got == tc.in, tc.reused)
			}
			if !tc.reused && len(got) != 32 {
				t.Errorf("generated id %q is not 32 hex chars", got)
			}
		})
	}
	if httpx.RequestIDFrom(httptest.NewRequest(http.MethodGet, "/", nil).Context()) != "" {
		t.Error("want empty id without middleware")
	}
}
