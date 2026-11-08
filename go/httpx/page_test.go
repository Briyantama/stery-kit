package httpx_test

import (
	"net/http/httptest"
	"testing"

	"github.com/Briyantama/stery-kit/go/httpx"
)

func TestPageParams(t *testing.T) {
	cases := []struct {
		query         string
		page, perPage int
		bad           bool
	}{
		{"", 1, 20, false},
		{"page=3&per_page=50", 3, 50, false},
		{"page=0", 0, 0, true},
		{"page=x", 0, 0, true},
		{"page=100000", 100000, 20, false},
		{"page=100001", 0, 0, true},
		{"page=9223372036854775807", 0, 0, true},
		{"per_page=0", 0, 0, true},
		{"per_page=101", 0, 0, true},
	}
	for _, c := range cases {
		page, perPage, err := httpx.PageParams(httptest.NewRequest("GET", "/?"+c.query, nil), 20, 100)
		if (err != nil) != c.bad || page != c.page || perPage != c.perPage {
			t.Errorf("%q: got %d %d %v", c.query, page, perPage, err)
		}
	}
}
