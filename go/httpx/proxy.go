package httpx

import (
	"net"
	"net/http"
	"net/netip"
	"slices"
	"strings"
)

// TrustedProxies makes the connection address of a request the real client's address when, and only
// when, the request came from one of the trusted proxies.
//
// Behind a reverse proxy every connection comes from the proxy, so per-address rate limits would
// throttle all clients together. The proxy reports the client in X-Forwarded-For, but any client can
// send that header, so it is believed only from a peer in trusted, and then only the right-most entry
// that is not itself a trusted hop: entries a client prepended sit to its left and are never read.
// Without trusted proxies the middleware does nothing, and the connection address is used as is.
func TrustedProxies(trusted []netip.Prefix) func(http.Handler) http.Handler {
	if len(trusted) == 0 {
		return func(next http.Handler) http.Handler { return next }
	}
	contains := func(addr netip.Addr) bool {
		addr = addr.Unmap()
		for _, p := range trusted {
			if p.Contains(addr) {
				return true
			}
		}
		return false
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if client, ok := forwardedClient(r, contains); ok {
				r.RemoteAddr = net.JoinHostPort(client.String(), "0")
			}
			next.ServeHTTP(w, r)
		})
	}
}

// forwardedClient returns the real client address named by a trusted peer, if there is one to believe.
func forwardedClient(r *http.Request, trusted func(netip.Addr) bool) (netip.Addr, bool) {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return netip.Addr{}, false
	}
	peer, err := netip.ParseAddr(host)
	if err != nil || !trusted(peer) {
		return netip.Addr{}, false
	}
	hops := strings.Split(strings.Join(r.Header.Values("X-Forwarded-For"), ","), ",")
	for _, raw := range slices.Backward(hops) {
		hop, err := netip.ParseAddr(strings.TrimSpace(raw))
		if err != nil {
			return netip.Addr{}, false // a hop that is not an address cannot be believed or skipped
		}
		if !trusted(hop) {
			return hop.Unmap(), true
		}
	}
	return netip.Addr{}, false
}
