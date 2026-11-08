package ratelimit_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"

	"github.com/Briyantama/stery-kit/go/ratelimit"
)

func TestMiddleware(t *testing.T) {
	mr := miniredis.RunT(t)
	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	t.Cleanup(func() { _ = rdb.Close() })

	h := ratelimit.Middleware(rdb, "ratelimit:login:", 2, time.Minute, ratelimit.ClientIP)(
		http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) }))
	call := func(addr string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.RemoteAddr = addr
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		return rec
	}

	for i, want := range []int{200, 200, 429} {
		if rec := call("1.2.3.4:5555"); rec.Code != want {
			t.Fatalf("call %d = %d, want %d", i+1, rec.Code, want)
		}
	}
	if rec := call("1.2.3.4:5555"); rec.Header().Get("Retry-After") == "" {
		t.Error("429 without Retry-After")
	}
	if rec := call("5.6.7.8:1"); rec.Code != 200 {
		t.Errorf("other IP = %d, want 200", rec.Code)
	}

	mr.FastForward(2 * time.Minute)
	if rec := call("1.2.3.4:5555"); rec.Code != 200 {
		t.Errorf("after window = %d, want 200", rec.Code)
	}

	mr.Close()
	if rec := call("1.2.3.4:5555"); rec.Code != 200 {
		t.Errorf("redis down = %d, want fail open 200", rec.Code)
	}
}

func TestMiddleware_rearmsKeyWithoutExpiry(t *testing.T) {
	mr := miniredis.RunT(t)
	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	t.Cleanup(func() { _ = rdb.Close() })
	_ = mr.Set("rl:1.2.3.4", "99") // a counter whose EXPIRE was lost
	h := ratelimit.Middleware(rdb, "rl:", 2, time.Minute, ratelimit.ClientIP)(
		http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusOK) }))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = "1.2.3.4:1"
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 429 || rec.Header().Get("Retry-After") != "60" {
		t.Errorf("got %d Retry-After=%q, want 429 and 60", rec.Code, rec.Header().Get("Retry-After"))
	}
	if mr.TTL("rl:1.2.3.4") <= 0 {
		t.Error("key still has no expiry")
	}
}
