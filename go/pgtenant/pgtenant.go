// Package pgtenant runs work in a Postgres transaction scoped to a tenant for row-level security.
package pgtenant

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// WithTenantTx runs fn in a transaction with app.tenant_id and app.store_id set via
// set_config(..., true), which the RLS policies read. app.store_id is always set (empty when
// storeID is empty) because POS policies reference it.
func WithTenantTx(ctx context.Context, pool *pgxpool.Pool, tenantID, storeID string, fn func(pgx.Tx) error) (err error) {
	if tenantID == "" {
		return errors.New("tenantID must not be empty")
	}
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback(ctx)
			panic(p)
		}
	}()
	if _, err := tx.Exec(ctx, `SELECT set_config('app.tenant_id', $1, true), set_config('app.store_id', $2, true)`, tenantID, storeID); err != nil {
		_ = tx.Rollback(ctx)
		return fmt.Errorf("set tenant context: %w", err)
	}
	if err := fn(tx); err != nil {
		_ = tx.Rollback(ctx)
		return err
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit tx: %w", err)
	}
	return nil
}
