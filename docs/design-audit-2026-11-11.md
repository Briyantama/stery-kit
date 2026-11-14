# Design audit: stery-kit/web (2026-11-11)

Scope: `web/src/styles/*`, `web/src/ui/*` (41 components), `web/showcase`. Mode: Operate. Method: code-level audit plus `impeccable detect` (baseline: 1 finding, after polish: 0). Critique ran single-context.

⚠️ DEGRADED: single-context (worker agent; dual sub-agent critique not run, no browser render, so contrast was computed from OKLCH lightness, not sampled).

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Dark destructive text contrast ~3.4:1 (fixed); small icon targets |
| 2 | Performance | 4 | Transform/opacity animations only |
| 3 | Theming | 3 | Hard-coded ms durations bypassed tokens (fixed) |
| 4 | Responsive | 3 | AppShell drawer, Tailwind breakpoints; some 24-32px icon buttons |
| 5 | Implementation integrity | 3 | One detector hit (side-tab toast, fixed) |
| **Total** | | **16/20** | Good |

Integrity verdict: pass. Tokens are semantic, components compose through `tv()` variants, focus handling is uniform.

## Findings

### Fixed in polish
- **[P1] Dark `--destructive-foreground` white on `oklch(0.64 0.19 27)` ≈ 3.4:1** (Accessibility). Used by Button, Badge, ConfirmDialog, menu item highlight. Added dark override `oklch(0.15 0.02 27)` (~5.8:1). `web/src/styles/tokens.css`. Variable name unchanged.
- **[P2] Light `--info` white-on-info ≈ 4.3:1**. Nudged `0.58 → 0.56` lightness (~4.6:1). `tokens.css`.
- **[P2] Toast `border-l-4` colored side stripe** (detector `side-tab`; craft-floor ban). Replaced with tone-tinted full border plus a leading 8px tone dot (`toastDotVariants`, exported). `ui/toast/variants.ts`, `Toast.svelte`, `index.ts`. Copy and behavior unchanged. Neutral tone keeps `--border`.
- **[P2] Hard-coded `duration-200/300` ignore the motion tokens**, so reduced-motion did not shorten them (AccordionTrigger chevron, AppShell drawer, Sheet left/top). Now `duration-(--duration-normal|slow)`.
- **[P3] ConfirmDialog spinner lacked reduced-motion slowdown** (Spinner has it). Added `motion-reduce:[animation-duration:2s]`.
- **[P3] Figures not tabular**: added `tabular-nums` to `StatCard` value and `TableCell` (digits only; no copy change).

### Skipped (with reason)
- **[P2] `--accent` (bright amber) used as hover/highlight fill** for ghost buttons, outline buttons, menu items, pagination, toast close. Reads loud for a neutral operator UI. Skipped: changing it alters every downstream app's look (redesign, not refinement), and the role name is aliased by HRIS/POS/SELA. Option: introduce a quieter role later via new variable, not rename.
- **[P2] Small icon targets** (SearchInput clear `size-6`, Toast close `size-7`, Dialog close `size-8`, Button `sm` `h-8`, Pagination `sm` `size-8`) are below `--tap-target` 44px but meet WCAG 2.5.8 (24px). Skipped: dense Operate sizing is intentional; padding changes would shift layouts in consuming apps.
- **[P3] `--font-display` equals sans**; no display voice. Skipped: brand font is an open product decision (apps override).
- **[P3] Focus ring double-draw** (`:focus-visible` outline in base.css plus component `ring-2` with `outline-none`). Works; no change needed.
- **[P3] No browser render/contrast sampling or overlay run** (no browser in this worker). Re-check with a rendered showcase in both themes.

## Critique (Nielsen, Operate; 7 and 10 scored as applicable)

| # | Heuristic | Score | Note |
|---|-----------|-------|------|
| 1 | System status | 3 | Spinner, Progress, `loading` on Button, toasts with pause |
| 2 | Match real world | 3 | IDR/id-ID helpers; English default labels via props |
| 3 | User control | 3 | Dismissible Alert, Escape and focus restore from bits-ui |
| 4 | Consistency | 3 | Shared variants, one ring/radius language; accent hover is the outlier |
| 5 | Error prevention | 3 | `FormField` wiring, `ConfirmDialog` |
| 6 | Recognition | 3 | Labelled controls, breadcrumbs, PageHeader |
| 7 | Flexibility | 3 | Exported variants, `class` merging, sizes |
| 8 | Minimalism | 3 | Border-first, restrained; amber hover adds noise |
| 9 | Error recovery | 2 | Error text only via caller props; no default recovery copy |
| 10 | Documentation | 4 | `design-system.md`, showcase |
| **Total** | | **30/40** | Good |

Design specificity: fairly category-standard (shadcn-like) neutral-blue system; specificity comes from token values and the OKLCH palette. Acceptable for shared infra; character is the apps' job through variable overrides.

Strengths: complete token contract with dark theme; uniform focus and form accessibility; reduced-motion handled at token level.

Priority issues: (1) dark contrast on destructive (fixed), (2) toast side stripe (fixed), (3) amber hover role (skipped), (4) motion tokens bypassed (fixed).

Personas: Keyboard power user: visible focus everywhere, skip link present, good. Low-vision user: contrast fixes above; muted text is 5.3-5.7:1. Touch cashier (POS): 32px `sm` controls and 24px clear button are tight; prefer `md`/`lg` on touch screens.
