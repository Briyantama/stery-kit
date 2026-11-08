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

// hit counts one request and returns the new count and the key's remaining ttl in ms. It runs as
// one script so the counter can never be left without an expiry (it also re-arms a key that lost it).
var hit = redis.NewScript(`
local n = redis.call('INCR', KEYS[1])
if n == 1 or redis.call('PTTL', KEYS[1]) < 0 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return {n, redis.call('PTTL', KEYS[1])}`)

// Middleware allows limit requests per window for each key(r), counted under prefix+key(r).
// On a Redis error it fails open: a cache outage must not take the point of sale offline, and the
// error is logged so it stays visible.
func Middleware(rdb *redis.Client, prefix string, limit int, window time.Duration, key func(*http.Request) string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			res, err := hit.Run(r.Context(), rdb, []string{prefix + key(r)}, window.Milliseconds()).Int64Slice()
			if err != nil || len(res) != 2 {
				slog.ErrorContext(r.Context(), "rate limit check failed; allowing request", "prefix", prefix, "error", err)
				next.ServeHTTP(w, r)
				return
			}
			if res[0] > int64(limit) {
				retry := (res[1] + 999) / 1000
				w.Header().Set("Retry-After", strconv.FormatInt(max(retry, 1), 10))
				httpx.WriteError(w, http.StatusTooManyRequests, "too many requests")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
