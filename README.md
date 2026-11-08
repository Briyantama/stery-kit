# stery-kit

Shared infrastructure code for SELA, HRIS-Stery, POS-Stery and future products. It holds no product-specific code (no claim names of one product, schema names, routes or UI components).

## Contents

Go module `github.com/Briyantama/stery-kit/go` (`go/`):

- `httpx`: `{success,data,error}` envelope, JSON decoding, trusted-proxy handling, request id middleware
- `health`: `/healthz` handler
- `objstore`: object storage interface with S3 and in-memory implementations
- `migrate`: goose runner over a caller-supplied `fs.FS`, `Fingerprint`, `CheckUniqueVersions`
- `testdb`: per-test Postgres databases cloned from a migrated template (skips without `TEST_DATABASE_URL`)
- `pgtenant`: `WithTenantTx`, a transaction with the tenant and store RLS settings
- `events`: event envelope, publisher and consumer groups over Redis-protocol streams
- `authn`: RS256 bearer verification (optional `WithIssuer`/`WithAudience` checks), role checks, optional Redis token revocation
- `ratelimit`: fixed-window Redis rate limit middleware

npm package `@stery/kit` (`web/`), TypeScript shipped as source:

- `@stery/kit`: API envelope client (`unwrap`, `ApiError`, `createClient`)
- `@stery/kit/sveltekit/proxy`: `/api/[...path]` BFF proxy factory
- `@stery/kit/sveltekit/session`: login and logout session handler factory

## Using it from a product

Products live at `<product>/apps/...`, so the kit is a sibling of the product directory.

Go, in `<product>/apps/api/go.mod`:

    require github.com/Briyantama/stery-kit/go v0.0.0
    replace github.com/Briyantama/stery-kit/go => ../../../stery-kit/go

npm, in `<product>/apps/<web|admin|cashier>/package.json`:

    "@stery/kit": "file:../../../stery-kit/web"

CI checks the kit out as a sibling directory of the product repository before building, so the same relative paths resolve there.

## Checks

    cd go && go build ./... && go vet ./... && go test ./...
    cd web && npm run check && npm run test:unit

## Design system

The web package also ships the Stery design system (tokens, Tailwind v4 theme, Svelte 5 components). See [web/README.md](web/README.md) for setup and theming, [web/docs/design-system.md](web/docs/design-system.md) for the token and component reference, and `web/showcase/Showcase.svelte` for a light/dark component gallery.
