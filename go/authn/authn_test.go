package authn_test

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"

	"github.com/Briyantama/stery-kit/go/authn"
)

func sign(t *testing.T, key *rsa.PrivateKey, claims jwt.MapClaims) string {
	t.Helper()
	s, err := jwt.NewWithClaims(jwt.SigningMethodRS256, claims).SignedString(key)
	if err != nil {
		t.Fatalf("sign: %v", err)
	}
	return s
}

func serve(h http.Handler, method, header string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, "/", nil)
	if header != "" {
		req.Header.Set("Authorization", header)
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestAuthenticateAndWithRole(t *testing.T) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	other, _ := rsa.GenerateKey(rand.Reader, 2048)
	exp := time.Now().Add(time.Hour).Unix()

	var seen authn.Claims
	handler := authn.Authenticate(authn.NewRSAVerifier(&key.PublicKey, nil))(
		authn.WithRole("hr_admin")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			seen, _ = authn.FromContext(r.Context())
			w.WriteHeader(http.StatusNoContent)
		})))

	good := sign(t, key, jwt.MapClaims{"sub": "u1", "user_id": "ignored", "tid": "t1", "sid": "s1", "jti": "j1", "email": "a@x.test", "roles": []string{"HR_Admin"}, "exp": exp})
	legacy := sign(t, key, jwt.MapClaims{"user_id": "u2", "tenant_id": "t2", "store_id": "s2", "roles": []string{"hr_admin"}, "exp": exp})
	single := sign(t, key, jwt.MapClaims{"sub": "u3", "tid": "t3", "role": "HR_ADMIN", "exp": exp})
	employee := sign(t, key, jwt.MapClaims{"sub": "u1", "tid": "t1", "roles": []string{"employee"}, "exp": exp})
	forged := sign(t, other, jwt.MapClaims{"sub": "u1", "tid": "t1", "roles": []string{"hr_admin"}, "exp": exp})
	expired := sign(t, key, jwt.MapClaims{"sub": "u1", "tid": "t1", "roles": []string{"hr_admin"}, "exp": time.Now().Add(-time.Hour).Unix()})
	noExp := sign(t, key, jwt.MapClaims{"sub": "u1", "tid": "t1", "roles": []string{"hr_admin"}})
	noTenant := sign(t, key, jwt.MapClaims{"sub": "u1", "roles": []string{"hr_admin"}, "exp": exp})
	hs256, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"sub": "u1", "tid": "t1", "exp": exp}).SignedString([]byte("k"))

	tests := []struct {
		name, header string
		want         int
	}{
		{"missing header", "", 401},
		{"not bearer", "Basic abc", 401},
		{"garbage token", "Bearer nope", 401},
		{"wrong key", "Bearer " + forged, 401},
		{"wrong algorithm", "Bearer " + hs256, 401},
		{"expired", "Bearer " + expired, 401},
		{"no exp", "Bearer " + noExp, 401},
		{"no tenant", "Bearer " + noTenant, 401},
		{"wrong role", "Bearer " + employee, 403},
		{"roles array, new names", "Bearer " + good, 204},
		{"legacy claim names", "Bearer " + legacy, 204},
		{"single role claim", "Bearer " + single, 204},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			rec := serve(handler, http.MethodGet, tc.header)
			if rec.Code != tc.want {
				t.Fatalf("status = %d, want %d (body %s)", rec.Code, tc.want, rec.Body)
			}
			if tc.want == 401 && rec.Body.String() != `{"success":false,"data":null,"error":"unauthorized"}` {
				t.Errorf("body = %q", rec.Body)
			}
			if tc.want == 204 && rec.Header().Get("Cache-Control") != "no-store" {
				t.Error("GET success without Cache-Control: no-store")
			}
		})
	}

	serve(handler, http.MethodGet, "Bearer "+good)
	if seen.UserID != "u1" || seen.TenantID != "t1" || seen.StoreID != "s1" || seen.JTI != "j1" || seen.Email != "a@x.test" || len(seen.Roles) != 1 {
		t.Errorf("new-style claims = %+v", seen)
	}
	serve(handler, http.MethodGet, "Bearer "+legacy)
	if seen.UserID != "u2" || seen.TenantID != "t2" || seen.StoreID != "s2" {
		t.Errorf("legacy claims = %+v", seen)
	}
	serve(handler, http.MethodGet, "Bearer "+single)
	if len(seen.Roles) != 1 || seen.Roles[0] != "HR_ADMIN" {
		t.Errorf("single-role claims = %+v", seen)
	}
	if rec := serve(handler, http.MethodPost, "Bearer "+good); rec.Header().Get("Cache-Control") != "" {
		t.Error("non-GET must not set Cache-Control")
	}
}

func TestWithRole_withoutClaimsIs401AndWithClaimsWorks(t *testing.T) {
	h := authn.WithRole("a")(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) }))
	if rec := serve(h, http.MethodGet, ""); rec.Code != 401 {
		t.Errorf("no claims = %d, want 401", rec.Code)
	}
	req := httptest.NewRequest(http.MethodGet, "/", nil).WithContext(authn.WithClaims(context.Background(), authn.Claims{Roles: []string{"A"}}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 204 {
		t.Errorf("WithClaims = %d, want 204", rec.Code)
	}
}

func TestRSAVerifier_rejectsRefreshToken(t *testing.T) {
	key, _ := rsa.GenerateKey(rand.Reader, 2048)
	exp := time.Now().Add(time.Hour).Unix()
	v := authn.NewRSAVerifier(&key.PublicKey, nil)
	refresh := sign(t, key, jwt.MapClaims{"user_id": "u", "tenant_id": "t", "typ": "refresh", "exp": exp})
	access := sign(t, key, jwt.MapClaims{"user_id": "u", "tenant_id": "t", "exp": exp})
	if _, err := v.Verify(context.Background(), refresh); err == nil {
		t.Error("refresh token accepted")
	}
	if _, err := v.Verify(context.Background(), access); err != nil {
		t.Errorf("access token rejected: %v", err)
	}
}

func TestRSAVerifier_revocationFailsClosed(t *testing.T) {
	key, _ := rsa.GenerateKey(rand.Reader, 2048)
	exp := time.Now().Add(time.Hour).Unix()
	withJTI := sign(t, key, jwt.MapClaims{"sub": "u", "tid": "t", "jti": "j1", "exp": exp})
	noJTI := sign(t, key, jwt.MapClaims{"sub": "u", "tid": "t", "exp": exp})

	verify := func(revoked func(context.Context, string) (bool, error), tok string) error {
		_, err := authn.NewRSAVerifier(&key.PublicKey, revoked).Verify(context.Background(), tok)
		return err
	}
	if err := verify(func(context.Context, string) (bool, error) { return false, nil }, withJTI); err != nil {
		t.Errorf("not revoked: %v", err)
	}
	if verify(func(context.Context, string) (bool, error) { return true, nil }, withJTI) == nil {
		t.Error("revoked token accepted")
	}
	if verify(func(context.Context, string) (bool, error) { return false, errors.New("down") }, withJTI) == nil {
		t.Error("lookup error must reject")
	}
	if verify(func(context.Context, string) (bool, error) { return false, nil }, noJTI) == nil {
		t.Error("missing jti must reject when revocation is on")
	}
	if verify(nil, noJTI) != nil {
		t.Error("missing jti is fine without revocation")
	}
}

func TestRedisRevocation(t *testing.T) {
	mr := miniredis.RunT(t)
	rdb := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	t.Cleanup(func() { _ = rdb.Close() })
	check := authn.RedisRevocation(rdb, "pos:token:blacklist:")

	if gone, err := check(context.Background(), "j1"); gone || err != nil {
		t.Fatalf("fresh jti: gone=%v err=%v", gone, err)
	}
	mr.Set(fmt.Sprintf("pos:token:blacklist:%x", sha256.Sum256([]byte("j1"))), "1")
	if gone, err := check(context.Background(), "j1"); !gone || err != nil {
		t.Fatalf("blacklisted jti: gone=%v err=%v", gone, err)
	}
	mr.Close()
	if _, err := check(context.Background(), "j1"); err == nil {
		t.Error("redis down must return an error")
	}
}
