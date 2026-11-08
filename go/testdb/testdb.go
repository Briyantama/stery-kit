// Package testdb gives integration tests an isolated PostgreSQL database.
//
// It connects to the server in TEST_DATABASE_URL, creates a uniquely named
// database for the test, and drops it on cleanup. Tests are skipped when the
// variable is unset; scripts/check.sh requires it so the official validation
// never skips silently. prefix (e.g. "hris") names the databases: <prefix>_tpl_* and <prefix>_test_*.
package testdb

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"io/fs"
	"net/url"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/Briyantama/stery-kit/go/migrate"

	// Registers the "pgx" database/sql driver.
	_ "github.com/jackc/pgx/v5/stdlib"
)

const envVar = "TEST_DATABASE_URL"

// New returns a connection to a fresh, empty database that is dropped when the test ends.
func New(t *testing.T, prefix string) *sql.DB {
	t.Helper()
	return open(t, NewURL(t, prefix))
}

// NewMigrated returns a connection to a fresh database with every migration in fsys applied. Running
// the migrations costs about a second, so they run once into a template database named after the
// migration set (migrate.Fingerprint) and each test copies it: a copy is a file-level clone, a few
// tens of milliseconds.
func NewMigrated(t *testing.T, prefix string, fsys fs.FS) *sql.DB {
	t.Helper()
	return open(t, NewMigratedURL(t, prefix, fsys))
}

// NewURL creates a fresh, empty database, returns its connection URL, and drops it when the test ends.
func NewURL(t *testing.T, prefix string) string { return newURL(t, prefix, "") }

// NewMigratedURL is NewMigrated returning the connection URL of the clone.
func NewMigratedURL(t *testing.T, prefix string, fsys fs.FS) string {
	t.Helper()
	adminURL := os.Getenv(envVar)
	if adminURL == "" {
		skip(t)
	}
	return newURL(t, prefix, ensureTemplate(t, adminURL, prefix, fsys))
}

func skip(t *testing.T) {
	t.Helper()
	t.Skipf("%s not set; start Postgres (deploy/docker-compose.yml) and export it to run DB tests", envVar)
}

func open(t *testing.T, dbURL string) *sql.DB {
	t.Helper()
	testDB, err := sql.Open("pgx", dbURL)
	if err != nil {
		t.Fatalf("open test database: %v", err)
	}
	// Registered after the URL's drop cleanup, so it runs first and the database is free to drop.
	t.Cleanup(func() { _ = testDB.Close() })
	return testDB
}

var (
	templateMu    sync.Mutex
	templateReady = map[string]bool{}
)

// templateLock serializes template building across the test processes `go test ./...` runs in parallel.
const templateLock = 7270001

// ensureTemplate builds the template for fsys unless it exists. The database is built under another
// name and renamed when complete, so a half-built template is never copied.
func ensureTemplate(t *testing.T, adminURL, prefix string, fsys fs.FS) string {
	t.Helper()
	name := prefix + "_tpl_" + migrate.Fingerprint(fsys)

	templateMu.Lock()
	defer templateMu.Unlock()
	if templateReady[adminURL+name] {
		return name
	}

	ctx := context.Background()
	admin, err := sql.Open("pgx", adminURL)
	if err != nil {
		t.Fatalf("open admin connection: %v", err)
	}
	defer func() { _ = admin.Close() }()
	conn, err := admin.Conn(ctx) // one session: the advisory lock belongs to it
	if err != nil {
		t.Fatalf("admin session: %v", err)
	}
	defer func() { _ = conn.Close() }()
	if _, err := conn.ExecContext(ctx, `SELECT pg_advisory_lock($1)`, templateLock); err != nil {
		t.Fatalf("lock template build: %v", err)
	}
	defer func() { _, _ = conn.ExecContext(ctx, `SELECT pg_advisory_unlock($1)`, templateLock) }()

	var exists bool
	if err := conn.QueryRowContext(ctx, `SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1)`, name).Scan(&exists); err != nil {
		t.Fatalf("look for template: %v", err)
	}
	if !exists {
		build := name + "_build"
		for _, q := range []string{"DROP DATABASE IF EXISTS " + build + " WITH (FORCE)", "CREATE DATABASE " + build} {
			if _, err := conn.ExecContext(ctx, q); err != nil {
				t.Fatalf("%s: %v", q, err)
			}
		}
		u, err := url.Parse(adminURL)
		if err != nil {
			t.Fatalf("parse %s: %v", envVar, err)
		}
		u.Path = "/" + build
		fresh, err := sql.Open("pgx", u.String())
		if err != nil {
			t.Fatalf("open template build: %v", err)
		}
		upErr := migrate.Up(ctx, fresh, fsys)
		_ = fresh.Close()
		if upErr != nil {
			t.Fatalf("migrate template: %v", upErr)
		}
		if _, err := conn.ExecContext(ctx, "ALTER DATABASE "+build+" RENAME TO "+name); err != nil {
			t.Fatalf("publish template: %v", err)
		}
		dropStaleTemplates(ctx, conn, prefix, name)
	}
	templateReady[adminURL+name] = true
	return name
}

// dropStaleTemplates removes templates of earlier migration sets. A failure is harmless (one is still in
// use by a run on another checkout), so it is ignored.
func dropStaleTemplates(ctx context.Context, conn *sql.Conn, prefix, keep string) {
	like := strings.NewReplacer(`\`, `\\`, `_`, `\_`, `%`, `\%`).Replace(prefix) + `\_tpl\_%`
	rows, err := conn.QueryContext(ctx, `SELECT datname FROM pg_database WHERE datname LIKE $1 AND datname <> $2`, like, keep)
	if err != nil {
		return
	}
	var stale []string
	for rows.Next() {
		var n string
		if rows.Scan(&n) == nil {
			stale = append(stale, n)
		}
	}
	_ = rows.Close()
	for _, n := range stale {
		_, _ = conn.ExecContext(ctx, "DROP DATABASE IF EXISTS "+n)
	}
}

// newURL is NewURL, optionally cloned from a template database.
func newURL(t *testing.T, prefix, template string) string {
	t.Helper()

	adminURL := os.Getenv(envVar)
	if adminURL == "" {
		skip(t)
	}

	admin, err := sql.Open("pgx", adminURL)
	if err != nil {
		t.Fatalf("open admin connection: %v", err)
	}

	name := prefix + "_test_" + randomSuffix(t)
	create := "CREATE DATABASE " + name
	if template != "" {
		create += " TEMPLATE " + template
	}
	if _, err := admin.Exec(create); err != nil {
		_ = admin.Close()
		t.Fatalf("create test database: %v", err)
	}

	u, err := url.Parse(adminURL)
	if err != nil {
		_ = admin.Close()
		t.Fatalf("parse %s: %v", envVar, err)
	}
	u.Path = "/" + name

	t.Cleanup(func() {
		// FORCE now and then fails with "permission denied to terminate process" while a backend of
		// the just-closed pool is still going away; a retry succeeds. A failed drop fails the package,
		// and a failed package is not cached, so the whole suite would run again.
		var err error
		for range 5 {
			if _, err = admin.Exec("DROP DATABASE IF EXISTS " + name + " WITH (FORCE)"); err == nil {
				break
			}
			time.Sleep(200 * time.Millisecond)
		}
		if err != nil {
			t.Errorf("drop test database %s: %v", name, err)
		}
		_ = admin.Close()
	})

	return u.String()
}

func randomSuffix(t *testing.T) string {
	t.Helper()
	buf := make([]byte, 6)
	if _, err := rand.Read(buf); err != nil {
		t.Fatalf("generate database suffix: %v", err)
	}
	return hex.EncodeToString(buf)
}
