// Package authn authenticates requests by their RS256 bearer token and checks roles.
package authn

import (
	"context"
	"net/http"
	"strings"

	"github.com/Briyantama/stery-kit/go/httpx"
)

// Claims is the caller identity taken from a verified token. StoreID and JTI are empty when the token has none.
type Claims struct {
	UserID   string
	TenantID string
	StoreID  string
	Email    string
	JTI      string
	Roles    []string
}

// Verifier turns a bearer token into Claims, or an error when the token is not acceptable.
type Verifier interface {
	Verify(ctx context.Context, token string) (Claims, error)
}

type ctxKey struct{}

// FromContext returns the claims Authenticate (or WithClaims) stored on the context.
func FromContext(ctx context.Context) (Claims, bool) {
	c, ok := ctx.Value(ctxKey{}).(Claims)
	return c, ok
}

// WithClaims returns ctx carrying c; handler tests use it to skip token verification.
func WithClaims(ctx context.Context, c Claims) context.Context {
	return context.WithValue(ctx, ctxKey{}, c)
}

// Authenticate requires "Authorization: Bearer <jwt>" and answers 401 "unauthorized" otherwise.
// The reason is never sent to the client. GET responses get Cache-Control: no-store.
func Authenticate(v Verifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, ok := bearer(r)
			if !ok {
				httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
				return
			}
			claims, err := v.Verify(r.Context(), token)
			if err != nil {
				httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
				return
			}
			if r.Method == http.MethodGet {
				w.Header().Set("Cache-Control", "no-store")
			}
			next.ServeHTTP(w, r.WithContext(WithClaims(r.Context(), claims)))
		})
	}
}

// WithRole lets through callers holding any of roles (case-insensitive) and answers 403 "forbidden"
// otherwise. It must run after Authenticate; without claims it answers 401.
func WithRole(roles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := FromContext(r.Context())
			if !ok {
				httpx.WriteError(w, http.StatusUnauthorized, "unauthorized")
				return
			}
			for _, have := range claims.Roles {
				for _, want := range roles {
					if strings.EqualFold(have, want) {
						next.ServeHTTP(w, r)
						return
					}
				}
			}
			httpx.WriteError(w, http.StatusForbidden, "forbidden")
		})
	}
}

func bearer(r *http.Request) (string, bool) {
	scheme, token, found := strings.Cut(r.Header.Get("Authorization"), " ")
	token = strings.TrimSpace(token)
	if !found || !strings.EqualFold(scheme, "Bearer") || token == "" {
		return "", false
	}
	return token, true
}
