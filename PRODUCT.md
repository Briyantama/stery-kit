# Product

<!-- impeccable:product-schema 1 -->

> Source: `README.md`, `web/README.md`, `web/docs/design-system.md`. No interview ran (subagent, no answer mechanism); everything below is taken from repo docs. Items marked [open] are undecided.

## Platform

web

## Users

Developers of the Stery products (SELA, HRIS-Stery, POS-Stery and future ones) who build internal-facing web apps and consume `@stery/kit`. End users of those apps are operators doing tasks (HR staff, cashiers, admins, hosts); the kit itself has no end-user surface beyond the showcase gallery.

## Product Purpose

Shared infrastructure for Stery products with no product-specific code. The web package (`@stery/kit`, TypeScript shipped as source) provides an API envelope client, SvelteKit BFF helpers, and the Stery design system: CSS tokens, a Tailwind v4 theme, and 41 Svelte 5 components (bits-ui primitives). Success: products adopt tokens and components incrementally with no per-app restyling and no duplicated local widgets.

## Positioning

One token set (`tokens.css`, plain CSS variables, light and dark) that works with or without Tailwind, so Tailwind apps (HRIS), scoped-CSS apps (POS) and alias-only apps (SELA) share one visual source of truth.

## Operating Context

Products consume the kit as a sibling directory: `"@stery/kit": "file:../../../stery-kit/web"`. Apps brand by overriding CSS variables after the kit import. Dark theme via `data-theme="dark"`. Money and dates default to `id-ID` / IDR formatting helpers.

## Capabilities and Constraints

- Tokens: color roles with `-foreground` partners, typography, radius, elevation, z-index layers, motion, `--tap-target`.
- Components grouped as Actions, Forms, Data display, Feedback, Overlays, Navigation, Layout. Every component accepts `class`; variant objects are exported.
- Constraint: HRIS, POS and SELA alias kit CSS variables. Variable names must never be renamed or removed; values may change.
- Constraint: the kit holds no product-specific code (no product claim names, schemas, routes).
- Adoption: HRIS full (Tailwind v4 + components); POS tokens bridged into scoped CSS; SELA alias tokens only.
- [open] Brand font: `--font-display` currently equals the system sans stack; apps may override.

## Evidence on Hand

`web/showcase/Showcase.svelte` (light/dark gallery), `web/docs/design-system.md`, component unit tests under `web/src/ui/*/*.test.ts`. No customer, benchmark, or usage evidence exists in the repo; none should be invented.

## Product Principles

1. Tokens first: an app can adopt colors, radius and motion with no visual rework.
2. Semantic roles over raw values; overriding one variable re-brands components and dark theme.
3. Accessibility is built in (focus rings, form wiring, reduced motion, labelled icon controls), not left to callers.
4. Composition over configuration: small components, `class` extension, exported variants.
5. No product-specific code in the kit.

## Accessibility & Inclusion

Documented conventions in `web/docs/design-system.md`: visible `:focus-visible` ring, `aria-invalid`/described-by wiring in `FormField`, alert vs status roles, toasts pause on hover and focus, `prefers-reduced-motion` via duration tokens, 44px `--tap-target` guidance.
