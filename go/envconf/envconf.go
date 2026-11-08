// Package envconf holds the helpers every product's config.Load repeats: collect all problems
// (names only, never values) and report them as one error.
package envconf

import (
	"errors"
	"net/netip"
	"strconv"
	"strings"
)

// Reader reads environment values through getenv and collects every problem it finds.
type Reader struct {
	getenv   func(string) string
	problems []string
}

func New(getenv func(string) string) *Reader { return &Reader{getenv: getenv} }

// Problem records a validation problem; use it for checks Reader does not cover.
func (r *Reader) Problem(msg string) { r.problems = append(r.problems, msg) }

// Get returns the raw value.
func (r *Reader) Get(name string) string { return r.getenv(name) }

// Required returns the value of name, recording a problem when it is empty.
func (r *Reader) Required(name string) string {
	v := r.getenv(name)
	if v == "" {
		r.Problem(name + " is required")
	}
	return v
}

// Fallback returns the value of name, or def when it is empty.
func (r *Reader) Fallback(name, def string) string {
	if v := r.getenv(name); v != "" {
		return v
	}
	return def
}

// Port returns name (default def) after checking it is a port number.
func (r *Reader) Port(name, def string) string {
	v := r.Fallback(name, def)
	if n, err := strconv.Atoi(v); err != nil || n < 1 || n > 65535 {
		r.Problem(name + " must be a port number between 1 and 65535")
	}
	return v
}

// Bool returns name as a bool; unset is false, a malformed value records a problem.
func (r *Reader) Bool(name string) bool {
	raw := r.getenv(name)
	if raw == "" {
		return false
	}
	b, err := strconv.ParseBool(raw)
	if err != nil {
		r.Problem(name + " must be true or false")
	}
	return b
}

// Proxies parses name as a comma-separated list of CIDR ranges or addresses (see ParseProxies).
func (r *Reader) Proxies(name string) []netip.Prefix {
	raw := r.getenv(name)
	if raw == "" {
		return nil
	}
	out, ok := ParseProxies(raw)
	if !ok {
		r.Problem(name + " must be a comma-separated list of CIDR ranges or addresses")
	}
	return out
}

// Err is nil without problems, else "invalid configuration: a; b".
func (r *Reader) Err() error {
	if len(r.problems) == 0 {
		return nil
	}
	return errors.New("invalid configuration: " + strings.Join(r.problems, "; "))
}

// ParseProxies reads a comma-separated list of CIDR ranges; a bare address is a single-host range.
func ParseProxies(raw string) ([]netip.Prefix, bool) {
	var out []netip.Prefix
	for part := range strings.SplitSeq(raw, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		if prefix, err := netip.ParsePrefix(part); err == nil {
			out = append(out, prefix.Masked())
			continue
		}
		addr, err := netip.ParseAddr(part)
		if err != nil {
			return nil, false
		}
		out = append(out, netip.PrefixFrom(addr, addr.BitLen()))
	}
	return out, true
}
