package migrate_test

import (
	"testing"
	"testing/fstest"

	"github.com/Briyantama/stery-kit/go/migrate"
)

func sql() []byte { return []byte("-- +goose Up\nSELECT 1;\n-- +goose Down\nSELECT 1;\n") }

func TestCheckUniqueVersions(t *testing.T) {
	tests := []struct {
		name    string
		fsys    fstest.MapFS
		wantErr bool
	}{
		{"unique", fstest.MapFS{"0001_a.sql": {Data: sql()}, "0002_b.sql": {Data: sql()}}, false},
		{"duplicate", fstest.MapFS{"0001_a.sql": {Data: sql()}, "0001_b.sql": {Data: sql()}}, true},
		{"no prefix", fstest.MapFS{"a.sql": {Data: sql()}}, true},
		{"non numeric", fstest.MapFS{"x_a.sql": {Data: sql()}}, true},
		{"ignores other files", fstest.MapFS{"0001_a.sql": {Data: sql()}, "README.md": {Data: nil}}, false},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if err := migrate.CheckUniqueVersions(tc.fsys); (err != nil) != tc.wantErr {
				t.Fatalf("err = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}

func TestFingerprint_changesWithContent(t *testing.T) {
	a := fstest.MapFS{"0001_a.sql": {Data: sql()}}
	b := fstest.MapFS{"0001_a.sql": {Data: append(sql(), '\n')}}
	first := migrate.Fingerprint(a)
	if first != migrate.Fingerprint(a) || first == migrate.Fingerprint(b) {
		t.Error("fingerprint must be stable and content-sensitive")
	}
}
