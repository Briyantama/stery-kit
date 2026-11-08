package testdb_test

import (
	"context"
	"testing"
	"testing/fstest"

	"github.com/Briyantama/stery-kit/go/migrate"
	"github.com/Briyantama/stery-kit/go/testdb"
)

var fsys = fstest.MapFS{
	"0001_things.sql": {Data: []byte("-- +goose Up\nCREATE TABLE things (name text);\n-- +goose Down\nDROP TABLE things;\n")},
}

func TestNewMigrated_returnsIndependentMigratedDatabases(t *testing.T) {
	first := testdb.NewMigrated(t, "kit", fsys)
	second := testdb.NewMigrated(t, "kit", fsys)

	if _, err := first.Exec(`INSERT INTO things (name) VALUES ('only-in-first')`); err != nil {
		t.Fatalf("insert into the first database (not migrated?): %v", err)
	}
	var inFirst, inSecond int
	_ = first.QueryRow(`SELECT count(*) FROM things`).Scan(&inFirst)
	_ = second.QueryRow(`SELECT count(*) FROM things`).Scan(&inSecond)

	if inFirst != 1 || inSecond != 0 {
		t.Errorf("things in first=%d second=%d, want 1 and 0: the copies must not share rows", inFirst, inSecond)
	}
}

func TestMigrate_upDownUp(t *testing.T) {
	ctx := context.Background()
	conn := testdb.New(t, "kit")

	for _, step := range []func() error{
		func() error { return migrate.Up(ctx, conn, fsys) },
		func() error { return migrate.Down(ctx, conn, fsys) },
		func() error { return migrate.Up(ctx, conn, fsys) },
	} {
		if err := step(); err != nil {
			t.Fatal(err)
		}
	}
}
