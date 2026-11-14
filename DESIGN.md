---
name: Stery design system
description: Quiet, neutral-blue operator UI tokens and Svelte components shared across Stery products.
colors:
  background: "oklch(0.985 0.002 250)"
  foreground: "oklch(0.21 0.02 260)"
  surface: "oklch(1 0 0)"
  muted: "oklch(0.955 0.005 250)"
  muted-foreground: "oklch(0.5 0.02 260)"
  border: "oklch(0.9 0.008 250)"
  input: "oklch(0.86 0.01 250)"
  ring: "oklch(0.55 0.18 260)"
  primary: "oklch(0.5 0.19 262)"
  primary-foreground: "oklch(0.99 0 0)"
  secondary: "oklch(0.94 0.01 250)"
  secondary-foreground: "oklch(0.25 0.02 260)"
  accent: "oklch(0.75 0.15 70)"
  accent-foreground: "oklch(0.22 0.03 60)"
  destructive: "oklch(0.55 0.21 27)"
  success: "oklch(0.55 0.14 150)"
  warning: "oklch(0.72 0.16 75)"
  info: "oklch(0.56 0.14 235)"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.025em"
  mono:
    fontFamily: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"
rounded:
  sm: "calc(0.5rem - 4px)"
  md: "calc(0.5rem - 2px)"
  lg: "0.5rem"
  xl: "calc(0.5rem + 4px)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 16px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "40px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: Stery design system

Source of truth: `web/src/styles/tokens.css` (values), `theme.css` (Tailwind v4 mapping), `base.css` (element defaults). Variable names are a public contract: HRIS, POS and SELA alias them. Change values, never names.

## Overview

**Creative North Star: "The Quiet Workbench"**

A calm, neutral-blue frame for people doing tasks all day. Surfaces are near-white (or deep blue-grey in dark), borders do the structural work, and color appears only where it means something: the primary blue for the main action and selection, semantic hues for state. System fonts keep it fast and native; brand lives in the token values each app can override.

Density is moderate (default control height 40px, `sm` 32px, `lg` 48px) with generous 12-24px padding in containers. Motion is short and functional (120/200/320ms, ease-out) and collapses to 0ms under reduced motion.

**Key Characteristics:**
- Semantic role tokens with `-foreground` partners; light and dark from one variable set.
- Tinted neutrals (hue 250-260) instead of pure gray.
- Border-first structure, shadows reserved for floating layers.
- Focus ring always visible: 2px `--ring`, with offset on controls.
- System font stack; `--font-display` defaults to sans and is meant to be overridden.

## Colors

Cool blue-tinted neutrals, one confident blue, one amber highlight, three state hues. All values `oklch()`; alpha via slash (`bg-info/10`).

### Primary
- **Workbench Blue** (`oklch(0.5 0.19 262)`; dark `oklch(0.66 0.16 262)`): primary actions, selected states, links, selection tint (25% mix).

### Secondary
- **Quiet Slate** (`--secondary`, `oklch(0.94 0.01 250)`): secondary buttons, quiet fills.
- **Signal Amber** (`--accent`, `oklch(0.75 0.15 70)`): hover and highlight fill for ghost buttons, menu items, pagination hover. Bright; see audit note.

### Tertiary (state)
- **Success** `oklch(0.55 0.14 150)`, **Warning** `oklch(0.72 0.16 75)`, **Info** `oklch(0.56 0.14 235)`, **Destructive** `oklch(0.55 0.21 27)`. Used as solid badges/buttons and as `/10` fills with `/40` borders in Alert.

### Neutral
- **Paper** (`--background` `oklch(0.985 0.002 250)`), **Surface** (`oklch(1 0 0)`), **Muted** (`oklch(0.955 0.005 250)`), **Border** (`oklch(0.9 0.008 250)`), **Input border** (`oklch(0.86 0.01 250)`), **Ink** (`oklch(0.21 0.02 260)`), **Muted ink** (`oklch(0.5 0.02 260)`).

### Named Rules
**The Role Rule.** Components reference roles (`bg-primary`, `text-muted-foreground`), never literal colors. Re-branding is overriding variables.
**The Foreground Pair Rule.** Text on a role color uses that role's `-foreground` and must hold 4.5:1 in both themes.

## Typography

**Display Font:** `--font-display` = `--font-sans`
**Body Font:** system UI stack (ui-sans-serif, system-ui, Segoe UI, Roboto)
**Label/Mono Font:** `--font-mono` for code and data

**Character:** Platform-native and neutral; hierarchy comes from size and weight, not typeface.

### Hierarchy
- **Stat value** (600, 1.5rem `text-2xl`, tight tracking, tabular figures): KPI numbers.
- **Title** (600, `text-sm`/`text-base`): card, dialog, toast titles.
- **Body** (400, 0.875rem): controls, tables, descriptions.
- **Label** (500-600, 0.75rem, 0.025em, uppercase in TableHead and nav groups): table headers, group labels, badges.

Sizes use Tailwind defaults. Numerals in tables and stat values are tabular.

## Layout

Tailwind default breakpoints (sm 40rem, md 48rem, lg 64rem). `AppShell`: 16rem sidebar, sticky 3.5rem header, main padded 1rem (1.5rem from `sm`); sidebar becomes an inert-backed drawer below `md`. `Container` sizes sm-xl-full; `Stack` gap none-xl. Minimum touch target token `--tap-target` 2.75rem.

## Elevation & Depth

Hybrid, border-first. Resting surfaces get a 1px border and at most `--elevation-1`; only floating layers lift.

- **Elevation 1** (`0 1px 2px hsl(var(--shadow-color) / 0.08)`): cards, resting controls, active tab.
- **Elevation 2** (`0 2px 6px ... / 0.1, 0 1px 2px ... / 0.06`): popovers, menus, tooltips.
- **Elevation 3** (`0 12px 32px ... / 0.16, 0 2px 6px ... / 0.08`): dialogs, sheets, toasts.

**The Float-Only Rule.** Shadows above elevation-1 belong to layers that overlap content. Z layers: sticky 40, dropdown 50, overlay 60, modal 70, toast 80, tooltip 90.

## Shapes

Single base radius `--radius` 0.5rem; controls use `rounded-md` (6px), cards/dialogs `rounded-lg` (8px), checkbox/menu items `rounded-sm` (4px), switch/radio/spinner full. 1px borders (`--border-width`). No clipping or decorative geometry.

## Components

### Buttons
- **Shape:** rounded-md; heights 32/40/48px, icon 40px.
- **Primary:** Workbench Blue fill, near-white text, hover 90% opacity.
- **Outline / Ghost:** hover fill is Signal Amber with its foreground.
- **Focus:** 2px ring with 2px offset against background. Disabled 50% opacity, no pointer events.

### Inputs / Fields
- **Style:** 1px `--input` border, background fill, 40px default height, placeholder muted-foreground.
- **Focus:** ring with offset. **Invalid:** destructive border and ring. **Disabled:** 50% opacity, not-allowed cursor.

### Cards / Containers
- rounded-lg, surface fill, 1px border, `shadow-sm`, 20-24px padding (StatCard 20px).

### Feedback
- **Alert:** tone `/10` fill with `/40` border. **Toast:** surface, tone-tinted border and a leading tone dot, elevation 3, slide-up entrance. **Badge:** soft or solid tone, `text-xs`.

### Navigation
- **SidebarNav / Tabs / Breadcrumbs / Pagination:** quiet text, active state carried by primary fill or surface lift; AppShell has a skip link.

## Do's and Don'ts

### Do:
- **Do** reference role tokens and `-foreground` partners; keep 4.5:1 in light and dark.
- **Do** take durations from `--duration-*` (via `duration-(--duration-normal)`) so reduced motion works.
- **Do** keep the 2px focus ring on every interactive element.
- **Do** use tabular numerals for figures in tables and KPIs.

### Don't:
- **Don't** rename or delete any CSS variable; downstream apps alias them.
- **Don't** use a colored side border (>1px) on cards, alerts or toasts; use tinted full border, fill or an icon/dot.
- **Don't** hard-code colors or millisecond durations in components.
- **Don't** put product-specific names, routes or schemas in the kit.
