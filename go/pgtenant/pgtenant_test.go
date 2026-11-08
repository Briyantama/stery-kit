package pgtenant_test

import (
	"context"
	"errors"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Briyantama/stery-kit/go/pgtenant"
	"github.com/Briyantama/stery-kit/go/testdb"
)

func TestWithTenantTx(t *testing.T) {
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, testdb.NewURL(t, "kit"))
	if err != nil {
		t.Fatalf("pool: %v", err)
	}
	t.Cleanup(pool.Close)

	read := func(tx pgx.Tx) (tenant, store string) {
		t.Helper()
		if err := tx.QueryRow(ctx, `SELECT current_setting('app.tenant_id', true), current_setting('app.store_id', true)`).Scan(&tenant, &store); err != nil {
			t.Fatalf("read GUCs: %v", err)
		}
		return tenant, store
	}

	t.Run("sets both settings inside fn and clears them after", func(t *testing.T) {
		var tenant, store string
		if err := pgtenant.WithTenantTx(ctx, pool, "t-1", "", func(tx pgx.Tx) error { tenant, store = read(tx); return nil }); err != nil {
			t.Fatalf("WithTenantTx: %v", err)
		}
		if tenant != "t-1" || store != "" {
			t.Errorf("inside fn tenant=%q store=%q, want t-1 and empty", tenant, store)
		}
		var after string
		if err := pool.QueryRow(ctx, `SELECT coalesce(current_setting('app.tenant_id', true), '')`).Scan(&after); err != nil || after != "" {
			t.Errorf("after commit tenant=%q err=%v, want empty", after, err)
		}
	})

	t.Run("passes the store id", func(t *testing.T) {
		var store string
		_ = pgtenant.WithTenantTx(ctx, pool, "t-1", "s-9", func(tx pgx.Tx) error { _, store = read(tx); return nil })
		if store != "s-9" {
			t.Errorf("store=%q, want s-9", store)
		}
	})

	t.Run("rejects empty tenant", func(t *testing.T) {
		if err := pgtenant.WithTenantTx(ctx, pool, "", "", func(pgx.Tx) error { return nil }); err == nil {
			t.Error("want error for empty tenant id")
		}
	})

	t.Run("rolls back on error and wraps nothing away", func(t *testing.T) {
		boom := errors.New("boom")
		if _, err := pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS tenant_tx_probe (id int)`); err != nil {
			t.Fatalf("create table: %v", err)
		}
		err := pgtenant.WithTenantTx(ctx, pool, "t-1", "", func(tx pgx.Tx) error {
			_, _ = tx.Exec(ctx, `INSERT INTO tenant_tx_probe VALUES (1)`)
			return boom
		})
		if !errors.Is(err, boom) {
			t.Fatalf("err=%v, want boom", err)
		}
		var n int
		_ = pool.QueryRow(ctx, `SELECT count(*) FROM tenant_tx_probe`).Scan(&n)
		if n != 0 {
			t.Errorf("rows=%d, want rolled back", n)
		}
	})

	t.Run("rolls back and re-panics", func(t *testing.T) {
		defer func() {
			if recover() == nil {
				t.Error("want the panic re-raised")
			}
		}()
		_ = pgtenant.WithTenantTx(ctx, pool, "t-1", "", func(pgx.Tx) error { panic("x") })
	})
}
