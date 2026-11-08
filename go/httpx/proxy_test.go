package httpx_test

import (
	"net/http"
	"net/http/httptest"
	"net/netip"
	"testing"

	"github.com/Briyantama/stery-kit/go/httpx"
)

func prefixes(t *testing.T, cidrs ...string) []netip.Prefix {
	t.Helper()
	out := make([]netip.Prefix, 0, len(cidrs))
	for _, c := range cidrs {
		p, err := netip.ParsePrefix(c)
		if err != nil {
			t.Fatalf("ParsePrefix(%q): %v", c, err)
		}
		out = append(out, p)
	}
	return out
}

// seenAddr runs one request through the middleware and returns the RemoteAddr the next handler saw.
func seenAddr(t *testing.T, trusted []netip.Prefix, remote string, headers map[string]string) string {
	t.Helper()
	var seen string
	next := http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) { seen = r.RemoteAddr })
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.RemoteAddr = remote
	for name, value := range headers {
		req.Header.Set(name, value)
	}
	httpx.TrustedProxies(trusted)(next).ServeHTTP(httptest.NewRecorder(), req)
	return seen
}

func TestTrustedProxies_aTrustedProxyHandsOverTheRealClientAddress(t *testing.T) {
	// Arrange
	trusted := prefixes(t, "10.0.0.0/8")

	// Act
	got := seenAddr(t, trusted, "10.0.0.7:51234", map[string]string{"X-Forwarded-For": "203.0.113.9"})

	// Assert
	if got != "203.0.113.9:0" {
		t.Fatalf("RemoteAddr = %q, want 203.0.113.9:0", got)
	}
}

func TestTrustedProxies_anUntrustedPeerCannotSpoofItsAddress(t *testing.T) {
	// Arrange
	trusted := prefixes(t, "10.0.0.0/8")

	// Act
	got := seenAddr(t, trusted, "198.51.100.20:4000", map[string]string{"X-Forwarded-For": "203.0.113.9"})

	// Assert
	if got != "198.51.100.20:4000" {
		t.Fatalf("RemoteAddr = %q, want the connection address untouched", got)
	}
}

func TestTrustedProxies_aClientCannotPrependAFakeAddressToTheChain(t *testing.T) {
	tests := []struct {
		name, header, want string
	}{
		{"fake first, real behind it", "1.2.3.4, 203.0.113.9", "203.0.113.9:0"},
		{"an inner trusted hop is skipped", "203.0.113.9, 10.0.0.5", "203.0.113.9:0"},
		{"spoof, real client, two trusted hops", "1.2.3.4, 203.0.113.9, 10.0.0.5, 10.0.0.6", "203.0.113.9:0"},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Arrange
			trusted := prefixes(t, "10.0.0.0/8")

			// Act
			got := seenAddr(t, trusted, "10.0.0.1:1", map[string]string{"X-Forwarded-For": tc.header})

			// Assert
			if got != tc.want {
				t.Fatalf("RemoteAddr = %q, want %q", got, tc.want)
			}
		})
	}
}

func TestTrustedProxies_leavesTheAddressAloneWhenTheHeaderIsMissingOrBroken(t *testing.T) {
	trusted := prefixes(t, "10.0.0.0/8")
	tests := []struct {
		name    string
		headers map[string]string
	}{
		{"no header", nil},
		{"empty", map[string]string{"X-Forwarded-For": ""}},
		{"not an address", map[string]string{"X-Forwarded-For": "unknown"}},
		{"only trusted hops", map[string]string{"X-Forwarded-For": "10.0.0.2, 10.0.0.3"}},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Act
			got := seenAddr(t, trusted, "10.0.0.1:777", tc.headers)

			// Assert
			if got != "10.0.0.1:777" {
				t.Fatalf("RemoteAddr = %q, want the proxy's own address", got)
			}
		})
	}
}

func TestTrustedProxies_withoutAnyTrustedProxyForwardedHeadersAreIgnored(t *testing.T) {
	// Act
	got := seenAddr(t, nil, "10.0.0.1:777", map[string]string{"X-Forwarded-For": "203.0.113.9"})

	// Assert
	if got != "10.0.0.1:777" {
		t.Fatalf("RemoteAddr = %q, want the connection address", got)
	}
}

func TestTrustedProxies_handlesIPv6Peers(t *testing.T) {
	// Arrange
	trusted := prefixes(t, "fd00::/8")

	// Act
	got := seenAddr(t, trusted, "[fd00::1]:443", map[string]string{"X-Forwarded-For": "2001:db8::7"})

	// Assert
	if got != "[2001:db8::7]:0" {
		t.Fatalf("RemoteAddr = %q, want [2001:db8::7]:0", got)
	}
}
