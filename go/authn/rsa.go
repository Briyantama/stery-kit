package authn

import (
	"context"
	"crypto/rsa"
	"crypto/sha256"
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
)

// RSAVerifier verifies RS256 tokens signed by the auth service.
type RSAVerifier struct {
	pub     *rsa.PublicKey
	revoked func(ctx context.Context, jti string) (bool, error)
	extra   []jwt.ParserOption
}

// VerifierOption tightens what NewRSAVerifier accepts.
type VerifierOption func(*RSAVerifier)

// WithIssuer requires the token's iss claim to equal iss, so a token minted for another product
// that shares the signing key is rejected.
func WithIssuer(iss string) VerifierOption {
	return func(v *RSAVerifier) { v.extra = append(v.extra, jwt.WithIssuer(iss)) }
}

// WithAudience requires the token's aud claim to contain aud.
func WithAudience(aud string) VerifierOption {
	return func(v *RSAVerifier) { v.extra = append(v.extra, jwt.WithAudience(aud)) }
}

// NewRSAVerifier returns a Verifier for tokens signed with the private half of pub. When revoked is
// not nil every token must carry a jti, and a revoked jti or a failed lookup rejects it (fail closed).
// Without opts iss and aud are not checked.
func NewRSAVerifier(pub *rsa.PublicKey, revoked func(ctx context.Context, jti string) (bool, error), opts ...VerifierOption) Verifier {
	v := &RSAVerifier{pub: pub, revoked: revoked}
	for _, o := range opts {
		o(v)
	}
	return v
}

// Verify checks signature, algorithm (RS256 only), exp (required) and nbf, then reads the identity from
// sub|user_id, tid|tenant_id, sid|store_id, email, jti and roles|role. A token without a user or
// tenant is rejected.
func (v *RSAVerifier) Verify(ctx context.Context, token string) (Claims, error) {
	mc := jwt.MapClaims{}
	if _, err := jwt.ParseWithClaims(token, mc, func(*jwt.Token) (any, error) { return v.pub, nil },
		append([]jwt.ParserOption{jwt.WithValidMethods([]string{"RS256"}), jwt.WithExpirationRequired()}, v.extra...)...); err != nil {
		return Claims{}, fmt.Errorf("parse token: %w", err)
	}
	// Refresh tokens share the key and carry user_id/tenant_id, so they must never authenticate a request.
	if mc["typ"] == "refresh" {
		return Claims{}, errors.New("refresh token not accepted")
	}
	c := Claims{
		UserID:   firstString(mc, "sub", "user_id"),
		TenantID: firstString(mc, "tid", "tenant_id"),
		StoreID:  firstString(mc, "sid", "store_id"),
		Email:    firstString(mc, "email"),
		JTI:      firstString(mc, "jti"),
	}
	if raw, ok := mc["roles"].([]any); ok {
		for _, r := range raw {
			if s, ok := r.(string); ok {
				c.Roles = append(c.Roles, s)
			}
		}
	} else if role := firstString(mc, "role"); role != "" {
		c.Roles = []string{role}
	}
	if c.UserID == "" || c.TenantID == "" {
		return Claims{}, errors.New("token has no user or tenant")
	}
	if v.revoked != nil {
		if c.JTI == "" {
			return Claims{}, errors.New("token missing jti claim")
		}
		gone, err := v.revoked(ctx, c.JTI)
		if err != nil {
			return Claims{}, fmt.Errorf("check token revocation: %w", err)
		}
		if gone {
			return Claims{}, errors.New("token revoked")
		}
	}
	return c, nil
}

func firstString(m jwt.MapClaims, keys ...string) string {
	for _, k := range keys {
		if s, ok := m[k].(string); ok && s != "" {
			return s
		}
	}
	return ""
}

// RedisRevocation reports whether jti is blacklisted under the key <keyPrefix><hex sha256(jti)>.
// Any Redis error other than a missing key is returned, so the verifier fails closed.
func RedisRevocation(rdb *redis.Client, keyPrefix string) func(ctx context.Context, jti string) (bool, error) {
	return func(ctx context.Context, jti string) (bool, error) {
		sum := sha256.Sum256([]byte(jti))
		switch err := rdb.Get(ctx, fmt.Sprintf("%s%x", keyPrefix, sum)).Err(); {
		case err == nil:
			return true, nil
		case errors.Is(err, redis.Nil):
			return false, nil
		default:
			return false, err
		}
	}
}
