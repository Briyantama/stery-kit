# Design audit re-run: stery-kit/web (2026-11-11, after polish)

Scope: `web/src/styles/*`, `web/src/ui/*` (41 components), `web/showcase`. Mode: Operate. Baseline: `docs/design-audit-2026-11-11.md` (16/20, 30/40), left untouched.

Method: dual-agent. Assessment A (design review, source only): `AuditKit.CritiqueA`. Assessment B (detector, contrast, class-level evidence): `AuditKit.CritiqueB`. Isolated sub-agents; A's output was not shown to B.

Evidence limits: no browser render. `web` has no dev server or showcase entry point (`package.json` has only `check` and `test:unit`), so the overlay and rendered contrast sampling did not run. Contrast below is computed from the OKLCH tokens (OKLab to sRGB to WCAG), and the key ratios were recomputed in the parent and matched. Target sizes come from class strings. Nothing was built, linted or tested.

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | Light `--info`/`--success` on white fail 4.5:1 (4.31/4.43); `--input` border 1.46:1; outline warning badge text ~2.3:1 |
| 2 | Performance | 4 | Transform/opacity motion only; skeleton/progress/spinner have reduced-motion handling |
| 3 | Theming | 3 | No hard-coded colors or ms in components; `shadow-lg` bypasses elevation tokens; `--accent` not overridden in dark |
| 4 | Responsive | 3 | Drawer shell, breakpoints fine; 12/16/24/28/32px controls |
| 5 | Implementation integrity | 3 | Detector clean (0 findings); `ConfirmDialog` re-implements Button classes; hard-coded English defaults |
| **Total** | | **15/20** | **Good (address weak dimensions)** |

Score is 1 lower than baseline because the rerun measured contrast where the baseline estimated it. Two items the baseline marked fixed or fine are not (see delta).

Integrity verdict: pass. Semantic role tokens, `tv()` variants, uniform focus ring, detector reports 0 findings in `web/src` and `web/showcase` (no false positives to report).

## Design Health Score (Nielsen)

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | System status | 3 | Button `loading`/`aria-busy`, aria-current/sort; Pagination shows no totals |
| 2 | Match real world | 2 | id-ID/IDR product, but "No results", "Previous page", "Page N" hard-coded English, partly not overridable |
| 3 | User control | 3 | Esc, dismissible alert, drawer focus return; toasts lack undo/action |
| 4 | Consistency | 2 | Selected state is amber (sidebar), surface lift (tabs), solid blue (pagination); ConfirmDialog duplicates Button styling |
| 5 | Error prevention | 2 | No default focus on Cancel for destructive confirm [inference], no typed confirm |
| 6 | Recognition | 3 | Labelled nav, groups, breadcrumbs |
| 7 | Flexibility | 2 | No density option, sortable header, selection or bulk pattern |
| 8 | Minimalism | 3 | Border-first; amber hover adds noise |
| 9 | Error recovery | 2 | ConfirmDialog swallows reject; error toasts auto-dismiss at 5s; "No results" has no guidance |
| 10 | Help/docs | 2 | design-system.md and showcase exist; no tooltips/help patterns |
| **Total** | | **24/40** | **Acceptable** |

Baseline 30/40 scored the same system more leniently (single-context); 24 is a stricter independent read, not a regression from polish.

Design specificity: mostly category-interchangeable (shadcn-like neutral blue). `--font-display = --font-sans` removes the last brand lever; the amber accent is the only distinctive element and is misused. Fine for shared infra if apps brand by override.

Strengths: accessibility built in (skip link, inert drawer with focus return, split polite/assertive toast regions, FormField wiring); disciplined token architecture with reduced-motion at token level; toast timer pauses on hover/focus and uses a tone dot, not a stripe.

Personas: Alex (power user): no sort/selection/bulk, 40px rows. Sam (a11y): field edges ~1.5:1, warning outline text ~2.3:1, selected nav relies on amber plus aria-current. Riley (stress): ConfirmDialog failure leaves no message; Pagination shows "Page 1" at total=0; "No results" gives no recovery.

## Findings (prioritized)

### P1
1. **Light `--info` and `--success` fail white-on-fill AA.** `web/src/styles/tokens.css:31` (success 0.55 → 4.43:1), `:35` (info 0.56 → 4.31:1). Hits solid Badge, Alert/Toast tones, Button where used. Fix: lower L to ~0.52 (5.0:1 for both). Names unchanged. `/impeccable colorize`.
2. **`--input` border 1.46:1 on background.** `tokens.css:18` (`oklch(0.86 0.01 250)`), used by Input, Select, Checkbox, outline Button. Fails WCAG 1.4.11 (3:1). Fix: light L ~0.65; dark `--input` `:80` is 0.36 on 0.17, check it too. `/impeccable audit` then polish.
3. **Amber `--accent` is the hover and selected fill.** `ui/button/variants.ts:9-10`, `ui/sidebar-nav/SidebarNav.svelte:64` (selected), `ui/pagination/variants.ts:4`, `ui/dialog/variants.ts:23`, `ui/toast/Toast.svelte:72`, `ui/dropdown-menu/variants.ts:7`, `ui/select/Select.svelte:80`, `alert-dialog/variants.ts:18`. Not overridden in dark (`tokens.css:71-96`), so a 0.75-L amber slab on deep blue-grey; collides with `--warning` hue; blurs hover vs selected. Fix without renaming: hover `bg-muted`; selected nav `bg-primary/10 text-primary`; keep `--accent` as an explicit highlight role. Downstream apps alias `--accent`, so ship as a deliberate visual change. `/impeccable quieter`.
4. **Error recovery gaps.** Error toasts auto-dismiss at 5s (`ui/toast/store.svelte.ts:20,36`); `ConfirmDialog.svelte:41-50` rethrows with no inline error. Fix: default error toast `duration: 0`; add `error` prop rendering a `role="alert"` line. `/impeccable harden`.

### P2
5. **Outline warning Badge text ~2.3:1.** `ui/badge/Badge.svelte:21` (`text-warning` on white). Fix: use a darker text token (e.g. `warning-foreground`) for the outline variant.
6. **Hard-coded English defaults.** `ui/pagination/Pagination.svelte:53,68` ("Previous page", "Page N"), `ui/table/TableEmpty.svelte:21`, `ui/toast/Toast.svelte:71` ("Dismiss notification"). Other components take label props. Fix: add `prevLabel`, `pageLabel`, `emptyLabel`, `dismissLabel`. `/impeccable clarify`.
7. **Sub-24px and sub-44px targets.** Under 24px: `ui/checkbox/variants.ts:6` (`sm` size-3.5, `md` size-4), `ui/radio-group/RadioGroupItem.svelte:26` (16px); WCAG 2.5.8 holds only if the wrapping label is the target, unverified. Small: `search-input/SearchInput.svelte:79` (24px), `toast/Toast.svelte:72` (28px), `dialog/variants.ts:23` (32px), `button/variants.ts:15` and `pagination/variants.ts:7` (32px), `AppShell.svelte:106` (36px). Fix: extend hit area (padding or `before:absolute before:-inset-*`) without changing layout. `/impeccable adapt`.
8. **`shadow-lg` bypasses elevation tokens.** `ui/toast/variants.ts:4`, `ui/dialog/variants.ts:4`. Fix: `shadow-(--elevation-3)`.
9. **ConfirmDialog duplicates Button classes.** `ui/alert-dialog/variants.ts:5,18`; drift risk (and the amber hover is copied). Fix: render `<Button>` or share the `tv()`.
10. **No operator-mode density or table interactivity.** `TableHead.svelte:28` (sort display only), fixed 40px rows, no sticky header, Pagination shows no "x-y of N". Fix: `density` token, sortable header button. `/impeccable adapt`.

### P3
11. **`--font-display` equals sans** (`tokens.css:40`); product decision still open.
12. **Focus ring inconsistency.** `Alert.svelte:83` and `SearchInput.svelte:79` have `ring-2` without ring-offset, unlike other controls.
13. **Tabs list contrast.** `TabsList` `bg-muted` vs `surface` lift is 0.955 vs 1.0 L, nearly invisible in light mode.
14. **Rendered verification missing.** Add a showcase entry (vite dev script) so both themes can be sampled and the detector overlay run.

## Delta vs baseline (16/20, 30/40)

Fixed and verified in source:
- Dark `--destructive-foreground` override (`tokens.css:89`): 5.36:1.
- Toast colored side stripe replaced; detector now 0 findings (baseline 1).
- Hard-coded `duration-200/300` gone: grep finds no `duration-<n>` in `src`.
- ConfirmDialog spinner `motion-reduce` (`ConfirmDialog.svelte:86`).
- `tabular-nums` on StatCard value and TableCell.

Claimed fixed, not holding:
- Light `--info`: baseline said ~4.6:1 at L 0.56; computed 4.31:1. Still fails (finding 1).

Still open (baseline skipped, unchanged): amber `--accent` (finding 3, now judged P1 given selected-nav use and no dark override), small icon targets (7), `--font-display` (11), no rendered check (14).

New (not in baseline): success 4.43:1, `--input` 1.46:1, warning outline text, error toast auto-dismiss and ConfirmDialog swallow, hard-coded English strings, `shadow-lg` bypass, ConfirmDialog duplication, 12-16px checkbox/radio targets, no density/table sort/pagination totals, tabs list contrast.

Net: audit 16 → 15, Nielsen 30 → 24. The drop is mostly stricter measurement and independent critique, not regressions from the polish pass; every polish fix that landed still holds, one (info) was incomplete.

## Recommended actions
1. **P1** `/impeccable colorize`: success/info to L ~0.52; `--input` border to meet 3:1 (values only, no renames).
2. **P1** `/impeccable quieter`: retire amber from hover/selected states (muted hover, primary/10 selected nav).
3. **P1** `/impeccable harden`: persistent error toasts, ConfirmDialog inline error.
4. **P2** `/impeccable clarify`: label props for hard-coded English; warning outline badge text.
5. **P2** `/impeccable adapt`: enlarge tiny hit areas; density and sortable table header.
6. `/impeccable polish`: elevation tokens, ConfirmDialog to Button, focus ring offsets.

## Applied (stery-kit/web)

Contrast recomputed from OKLCH (OKLab to linear sRGB, per-channel clamp, WCAG). Not rendered; build/lint/tests not run.

| File | Change |
| --- | --- |
| `src/styles/tokens.css` | Light `--success` L 0.55 to 0.52 and `--info` L 0.56 to 0.52 (5.17:1 / 5.20:1 white on fill; report's stricter method ~5.0). Light `--input` `oklch(0.62 0.01 250)`: 3.48:1 on `--background` (3.64:1 on surface), was 1.46:1. Dark `--input` `oklch(0.52 0.015 260)`: 3.47:1 on background, 3.22:1 on surface, was 1.76:1. Names unchanged. Dark success/info fills unchanged (6.7 / 7.0:1 with their foregrounds). |
| `ui/button/variants.ts`, `ui/pagination/variants.ts`, `ui/dialog/variants.ts`, `ui/alert-dialog/variants.ts`, `ui/toast/Toast.svelte` | Hover fill `bg-accent text-accent-foreground` replaced by `bg-muted` (close buttons: `hover:bg-muted hover:text-foreground`). |
| `ui/dropdown-menu/variants.ts`, `ui/select/Select.svelte` | Highlighted item `bg-accent text-accent-foreground` replaced by `bg-muted`. |
| `ui/sidebar-nav/SidebarNav.svelte` | Selected item `bg-primary/10 text-primary`. `--accent` kept as an explicit highlight role (no component uses it now). |
| `ui/toast/store.svelte.ts` | Destructive (error) toasts default `duration: 0`; explicit `duration` still wins. Test added. |
| `ui/alert-dialog/ConfirmDialog.svelte` | `onconfirm` rejection no longer rethrown: dialog stays open, shows `role="alert"` line (Error message, else new `errorLabel` prop). New bindable `error` prop; cleared on retry and on close. Two tests added. |
| `ui/badge/Badge.svelte` | Outline warning text `text-warning-foreground` (17.4:1 on white). |
| `docs/design-system.md` | Accent role, error toast default, ConfirmDialog props. |

## Skipped (stery-kit/web)

- 6 hard-coded English labels: new label props on Pagination/TableEmpty/Toast; not in the requested set.
- 7 hit areas, 10 density/sortable header/pagination totals: layout or product changes.
- 8 `shadow-lg` bypass: `docs/design-system.md` states `shadow-lg` maps to `--elevation-3` in `theme.css`; not verified as a real bypass, no change.
- 9 ConfirmDialog to `<Button>`: AlertDialog primitives need `child` snippet wiring; not a finding in the requested set.
- 11 `--font-display`: open product decision.
- 12 Alert/SearchInput ring offset, 13 tabs list contrast, 14 showcase dev script: not requested.
