package httpx

import (
	"fmt"
	"net/http"
	"strconv"
)

// maxPage keeps (page-1)*perPage far below int64 range, so callers can compute an OFFSET safely.
const maxPage = 100000

// PageParams reads the `page` (default 1, 1 to maxPage) and `per_page` (default defPerPage, 1 to
// maxPerPage) query parameters. The error text is safe to send in a 400 response.
func PageParams(r *http.Request, defPerPage, maxPerPage int) (page, perPage int, err error) {
	q := r.URL.Query()
	page, perPage = 1, defPerPage
	if v := q.Get("page"); v != "" {
		if page, err = strconv.Atoi(v); err != nil || page < 1 || page > maxPage {
			return 0, 0, fmt.Errorf("page must be between 1 and %d", maxPage)
		}
	}
	if v := q.Get("per_page"); v != "" {
		if perPage, err = strconv.Atoi(v); err != nil || perPage < 1 || perPage > maxPerPage {
			return 0, 0, fmt.Errorf("per_page must be between 1 and %d", maxPerPage)
		}
	}
	return page, perPage, nil
}
