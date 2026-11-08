package envconf_test

import (
	"testing"

	"github.com/Briyantama/stery-kit/go/envconf"
)

func TestReader_collectsProblemsWithoutValues(t *testing.T) {
	env := map[string]string{"PORT": "99999", "FLAG": "maybe", "PROXIES": "10.0.0.0/8, 1.2.3.4", "BAD": "nope", "SECRET": "s3cret"}
	r := envconf.New(func(k string) string { return env[k] })

	r.Required("MISSING")
	r.Port("PORT", "8000")
	r.Bool("FLAG")
	if got := r.Proxies("PROXIES"); len(got) != 2 || got[1].Bits() != 32 {
		t.Errorf("proxies = %v", got)
	}
	r.Proxies("BAD")

	const want = "invalid configuration: MISSING is required; PORT must be a port number between 1 and 65535; " +
		"FLAG must be true or false; BAD must be a comma-separated list of CIDR ranges or addresses"
	if err := r.Err(); err == nil || err.Error() != want {
		t.Errorf("err = %v, want %q", err, want)
	}
}

func TestReader_defaultsAreValid(t *testing.T) {
	r := envconf.New(func(string) string { return "" })
	if r.Port("PORT", "8000") != "8000" || r.Bool("X") || r.Err() != nil {
		t.Errorf("unexpected: %v", r.Err())
	}
}
