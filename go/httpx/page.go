package httpx

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
)

// PageParams reads the `page` (default 1, at least 1) and `per_page` (default defPerPage, 1 to
// maxPerPage) query parameters. The error text is safe to send in a 400 response.
func PageParams(r *http.Request, defPerPage, maxPerPage int) (page, perPage int, err error) {
	q := r.URL.Query()
	page, perPage = 1, defPerPage
	if v := q.Get("page"); v != "" {
		if page, err = strconv.Atoi(v); err != nil || page < 1 {
			return 0, 0, errors.New("page must be a positive integer")
		}
	}
	if v := q.Get("per_page"); v != "" {
		if perPage, err = strconv.Atoi(v); err != nil || perPage < 1 || perPage > maxPerPage {
			return 0, 0, fmt.Errorf("per_page must be between 1 and %d", maxPerPage)
		}
	}
	return page, perPage, nil
}
