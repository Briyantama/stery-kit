// Package migrate applies goose SQL migrations from a caller-supplied filesystem.
// fsys must hold the *.sql files at its root; callers embed them and pass fs.Sub(embedded, "migrations").
package migrate

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"io/fs"
	"path"
	"strconv"
	"strings"

	"github.com/pressly/goose/v3"
)

func newProvider(conn *sql.DB, fsys fs.FS) (*goose.Provider, error) {
	provider, err := goose.NewProvider(goose.DialectPostgres, conn, fsys)
	if err != nil {
		return nil, fmt.Errorf("create migration provider: %w", err)
	}
	return provider, nil
}

// Fingerprint identifies a migration set: it changes whenever a migration is added or edited.
// Tests use it to name a ready-made template database.
func Fingerprint(fsys fs.FS) string {
	h := sha256.New()
	_ = fs.WalkDir(fsys, ".", func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		body, err := fs.ReadFile(fsys, p)
		if err != nil {
			return err
		}
		h.Write([]byte(p))
		h.Write(body)
		return nil
	})
	return hex.EncodeToString(h.Sum(nil))[:12]
}

// Up applies every pending migration. It is safe to call repeatedly.
func Up(ctx context.Context, conn *sql.DB, fsys fs.FS) error {
	provider, err := newProvider(conn, fsys)
	if err != nil {
		return err
	}
	if _, err := provider.Up(ctx); err != nil {
		return fmt.Errorf("apply migrations: %w", err)
	}
	return nil
}

// Down reverts every applied migration. Intended for tests and local resets.
func Down(ctx context.Context, conn *sql.DB, fsys fs.FS) error {
	provider, err := newProvider(conn, fsys)
	if err != nil {
		return err
	}
	if _, err := provider.DownTo(ctx, 0); err != nil {
		return fmt.Errorf("revert migrations: %w", err)
	}
	return nil
}

// CheckUniqueVersions fails when two *.sql files share a goose version prefix (goose rejects that)
// or a file has no numeric prefix. Products call it from a test.
func CheckUniqueVersions(fsys fs.FS) error {
	entries, err := fs.ReadDir(fsys, ".")
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}
	versions := map[int][]string{}
	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || path.Ext(name) != ".sql" {
			continue
		}
		prefix, _, found := strings.Cut(name, "_")
		if !found {
			return fmt.Errorf("migration %q has no version prefix", name)
		}
		version, err := strconv.Atoi(prefix)
		if err != nil {
			return fmt.Errorf("migration %q: version prefix %q is not a number: %w", name, prefix, err)
		}
		versions[version] = append(versions[version], name)
	}
	for version, files := range versions {
		if len(files) > 1 {
			return fmt.Errorf("version %d is used by %d migrations: %v (goose rejects duplicate versions)", version, len(files), files)
		}
	}
	return nil
}
