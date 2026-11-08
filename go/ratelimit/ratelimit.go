// Package ratelimit limits request rates with a fixed window counter in Redis.
package ratelimit

import (
	"log/slog"
	"net"
	"net/http"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/Briyantama/stery-kit/go/httpx"
)

// ClientIP returns the host part of r.RemoteAddr (httpx.TrustedProxies has already rewritten it
// when the request came through a trusted proxy).
func ClientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

// Middleware allows limit requests per window for each key(r), counted under prefix+key(r).
// On a Redis error it fails open: a cache outage must not take the point of sale offline, and the
// error is logged so it stays visible.
func Middleware(rdb *redis.Client, prefix string, limit int, window time.Duration, key func(*http.Request) string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			k := prefix + key(r)
			n, err := rdb.Incr(r.Context(), k).Result()
			if err == nil && n == 1 {
				err = rdb.Expire(r.Context(), k, window).Err()
			}
			if err != nil {
				slog.ErrorContext(r.Context(), "rate limit check failed; allowing request", "prefix", prefix, "error", err)
				next.ServeHTTP(w, r)
				return
			}
			if n > int64(limit) {
				retry := int64(window / time.Second)
				if ttl, err := rdb.TTL(r.Context(), k).Result(); err == nil && ttl > 0 {
					retry = int64((ttl + time.Second - 1) / time.Second)
				}
				w.Header().Set("Retry-After", strconv.FormatInt(max(retry, 1), 10))
				httpx.WriteError(w, http.StatusTooManyRequests, "too many requests")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
