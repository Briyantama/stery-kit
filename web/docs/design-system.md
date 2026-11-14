# Stery design system

Source of truth: `src/styles/tokens.css` (values), `src/styles/theme.css` (Tailwind mapping), `src/ui/*` (components).

## CSS architecture

```
tokens.css   plain CSS variables on :root, overrides on [data-theme='dark']
   |
base.css     @layer base: html font/background, border color, focus ring, selection, [hidden]
   |
theme.css    Tailwind v4 entry: imports tokens + base, @source '../ui',
             @custom-variant dark, @theme inline mapping, keyframes
   |
utilities    bg-primary, text-muted-foreground, border-border, rounded-lg, shadow-md, z-modal, animate-fade-in
   |
components   Svelte files compose utilities through tv() variants; callers extend with `class` (merged by cn)
```

- `tokens.css` works alone, without Tailwind (POS, SELA).
- `@theme inline` keeps utilities pointing at the live variables, so overriding `--primary` after the import re-brands every component and the dark theme with no rebuild.
- `base.css` is in `@layer base`, so any utility wins without `!important`. It holds no component classes.
- `theme.css` also exports the utility `sr-only-focusable` (visually hidden until focused, used by skip links).

## Tokens

### Color roles

Each role has a `-foreground` partner for text on top of it (Tailwind: `bg-primary text-primary-foreground`). Dark values live under `[data-theme='dark']`.

| Variable | Utility | Intent |
| --- | --- | --- |
| `--background` | `bg-background` | Page background |
| `--foreground` | `text-foreground` | Default text |
| `--surface`, `--surface-foreground` | `bg-surface` | Cards, dialogs, navbar, inputs' parent surfaces |
| `--muted`, `--muted-foreground` | `bg-muted`, `text-muted-foreground` | Subtle fills, secondary text, skeletons |
| `--border` | `border-border` | Default borders and dividers (set on every element by base.css) |
| `--input` | `border-input` | Form control borders |
| `--ring` | `ring-ring` | Focus ring color |
| `--overlay` | `bg-overlay` | Dialog and sheet backdrop |
| `--primary`, `--primary-foreground` | `bg-primary` | Brand, main actions, selected states |
| `--secondary`, `--secondary-foreground` | `bg-secondary` | Quiet actions |
| `--accent`, `--accent-foreground` | `bg-accent` | Explicit highlight role (amber). Kit hover fills use `bg-muted` and selected nav uses `bg-primary/10`, not accent |
| `--destructive`, `--destructive-foreground` | `bg-destructive` | Errors, delete actions |
| `--success`, `--success-foreground` | `bg-success` | Positive state |
| `--warning`, `--warning-foreground` | `bg-warning` | Caution |
| `--info`, `--info-foreground` | `bg-info` | Neutral information |

Colors are `oklch()`. Alpha shades use the Tailwind slash syntax (`bg-info/10`).

### Typography

| Variable | Utility | Default |
| --- | --- | --- |
| `--font-sans` | `font-sans` | System UI stack |
| `--font-display` | `font-display` | Same as sans; override for headings |
| `--font-mono` | `font-mono` | System monospace stack |

Sizes and weights use Tailwind defaults (`text-sm`, `font-medium`).

### Radius

`--radius` (0.5rem) is the base; `--border-width` is 1px.

| Utility | Value |
| --- | --- |
| `rounded-sm` | `--radius - 4px` |
| `rounded-md` | `--radius - 2px` |
| `rounded-lg` | `--radius` |
| `rounded-xl` | `--radius + 4px` |

### Shadows and elevation

| Variable | Utility | Use |
| --- | --- | --- |
| `--elevation-1` | `shadow-sm` | Cards, resting controls |
| `--elevation-2` | `shadow-md` | Popovers, menus |
| `--elevation-3` | `shadow-lg` | Dialogs, sheets |

`--shadow-color` tints all three and is darker in the dark theme.

### Z-index layers

| Variable | Utility | Value | Used by |
| --- | --- | --- | --- |
| `--z-sticky` | `z-sticky` | 40 | Sticky Navbar |
| `--z-dropdown` | `z-dropdown` | 50 | Select, dropdown menu, popover |
| `--z-overlay` | `z-overlay` | 60 | Dialog and sheet backdrop |
| `--z-modal` | `z-modal` | 70 | Dialog, alert dialog, sheet |
| `--z-toast` | `z-toast` | 80 | Toaster |
| `--z-tooltip` | `z-tooltip` | 90 | Tooltip |

### Motion

| Variable | Value |
| --- | --- |
| `--duration-fast` | 120ms |
| `--duration-normal` | 200ms |
| `--duration-slow` | 320ms |
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |

All durations become 0ms under `prefers-reduced-motion: reduce`. Animation utilities: `animate-fade-in`, `animate-scale-in`, `animate-slide-in-right`, `animate-slide-in-up`.

### Sizing and breakpoints

`--tap-target` (2.75rem) is the minimum touch target. Breakpoints are the Tailwind defaults (`sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem); the kit does not change them.

## Components

All imports come from `@stery/kit/ui`. Every component accepts `class` (merged with `cn`) and most bindable `ref`. Sizes are `sm | md | lg` unless noted.

### Actions

| Component | Purpose |
| --- | --- |
| `Button` | Action or link. `variant` primary, secondary, outline, ghost, destructive, link; `size` sm, md, lg, icon; `loading`, `disabled`, `href` (renders an anchor) |
| `ButtonGroup` | Groups related buttons |

```svelte
<Button variant="outline" size="sm" loading={saving} onclick={save}>Save</Button>
<Button href="/docs" variant="link">Docs</Button>
```

### Forms

| Component | Purpose |
| --- | --- |
| `Input` | Text input. Bindable `value`, `size`, `invalid` |
| `Textarea` | Multi-line input. Same props as Input |
| `Label` | Label with `required` marker |
| `FormField` | Wires label, description and error to one control; children receive `{ id, describedBy, invalid }` |
| `NativeSelect` | Styled native `<select>`; bindable `value`, `size`, `invalid`, children are options |
| `Select` | Custom listbox (bits-ui). `items` `{ value, label, disabled? }[]`, bindable `value` and `open`, `placeholder`, `invalid`, `name`, `required`, `size`, `onValueChange` |
| `Checkbox` | Bindable `checked` and `indeterminate`, `size`, `invalid`; children make it a labelled control |
| `RadioGroup`, `RadioGroupItem` | Single choice; bindable `value`; items take `value` and children as label |
| `Switch` | Toggle; bindable `checked`, `size`; children become the label |
| `SearchInput` | Input with clear button; bindable `value`, `onsearch` (Enter or clear), `clearLabel` |

```svelte
<FormField label="Email" error={errors.email} required>
	{#snippet children({ id, describedBy, invalid })}
		<Input {id} type="email" bind:value={email} {invalid} aria-describedby={describedBy} />
	{/snippet}
</FormField>

<Select items={[{ value: 'a', label: 'Option A' }]} bind:value={choice} name="choice" />
```

### Data display

| Component | Purpose |
| --- | --- |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | Semantic table in a scroll wrapper (`wrapperClass`); `TableHead` takes `sort` asc, desc, none (sets aria-sort); `TableRow` takes `selected` |
| `TableEmpty`, `TableLoading` | Empty row (`colspan`) and skeleton rows (`columns`, `rows`, `label`) |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Surface; `Card` variant default, outline, muted; `CardTitle` takes heading `level` |
| `Badge` | Status label. `tone` neutral, info, success, warning, destructive; `outline` |
| `Avatar`, `AvatarGroup` | Image with initials fallback (`src`, `name`, `alt`, `fallback`); group takes `items`, `max` |
| `StatCard` | KPI tile: `label`, `value`, `delta`, `trend` up, down, flat, `tone`, `hint`, `icon` |
| `DescriptionList` | Term and description pairs: `items`, `layout` vertical or horizontal |
| `Progress` | Bar: `value`, `max`, `indeterminate`, `tone` primary, info, success, warning, destructive |
| `Separator` | Divider: `orientation`, `decorative` |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | Collapsible sections (bits-ui props: `type`, `value`) |

```svelte
<Table>
	<TableHeader><TableRow><TableHead sort="asc">Name</TableHead></TableRow></TableHeader>
	<TableBody>
		{#each rows as row}<TableRow><TableCell>{row.name}</TableCell></TableRow>{/each}
	</TableBody>
</Table>
<StatCard label="Revenue" value={formatCurrency(1200000)} delta="+12%" trend="up" />
```

### Feedback

| Component | Purpose |
| --- | --- |
| `Alert` | Inline message: `tone`, `title`, `description`, `icon`, `dismissible`, `ondismiss`. Role is alert for warning and destructive, otherwise status |
| `Toaster`, `toast` | Mount `<Toaster position="bottom-right" />` once; call `toast.success(title, opts)`, `.error`, `.info`, `.warning`, `.show({ title, tone, duration })`, `.dismiss(id)`, `.clear()`. Default duration 5000ms; error (destructive) toasts default to `0` (stay until dismissed) |
| `Spinner` | Busy indicator: `size`, `label` |
| `Skeleton` | Placeholder block; size it with classes |
| `EmptyState` | Nothing-here panel: `title`, `description`, `icon`, `action` snippets |

```svelte
<Alert tone="warning" title="Heads up" description="Stock is low." dismissible />
<script>toast.success('Saved');</script>
```

### Overlays

| Component | Purpose |
| --- | --- |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | Modal; bindable `open`; content takes `size` sm, md, lg, xl, `showClose`, `closeLabel` |
| `AlertDialog` family, `ConfirmDialog` | Interruptive confirm. `ConfirmDialog` props: `open`, `title`, `description`, `confirmLabel`, `cancelLabel`, `tone` primary or destructive, `onconfirm` (async, shows busy state; a rejection keeps the dialog open and shows the message inline), `error` (bindable inline message), `errorLabel` (fallback text), `oncancel`, `trigger` |
| `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`, `SheetClose` | Edge panel, a Dialog with `SheetContent side` right, left, top, bottom |
| `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverClose` | Anchored floating panel |
| `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuSeparator`, `DropdownMenuLabel` | Action menu; item `variant` default or destructive |
| `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` | Hover and focus hint; wrap the app (or a subtree) in one `TooltipProvider` |

```svelte
<ConfirmDialog bind:open title="Delete item?" tone="destructive" confirmLabel="Delete" onconfirm={remove} />

<Dialog bind:open>
	<DialogContent size="md">
		<DialogHeader><DialogTitle>Edit</DialogTitle><DialogDescription>Update the record.</DialogDescription></DialogHeader>
		<DialogFooter><Button onclick={() => (open = false)}>Done</Button></DialogFooter>
	</DialogContent>
</Dialog>
```

### Navigation

| Component | Purpose |
| --- | --- |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Tab set; bindable `value` on `Tabs`; triggers and content take `value` |
| `Breadcrumbs` | `items` `{ label, href? }[]`, `size` sm, md, lg (last item is the current page) |
| `Pagination` | Bindable `page`; give `pageCount` or `total` + `perPage`; `siblings`, `size`, `onchange` |
| `Navbar` | Top bar with `brand`, `nav`, `actions` snippets; `size`, `sticky`, `navLabel` |
| `SidebarNav` | Links: flat `items` or `groups` of `{ label?, items }`; item is `{ label, href, icon?, active?, badge? }` |
| `AppShell` | Page frame with `sidebar`, `header` snippets, children as main; bindable `open` for the mobile menu; skip link and Escape handling built in |
| `PageHeader` | Title block: `title`, `description`, `breadcrumbs` and `actions` snippets |
| `FilterBar` | Toolbar layout with `search`, `filters`, `actions` snippets |

### Layout

| Component | Purpose |
| --- | --- |
| `Stack` | Flex layout: `as`, `direction`, `gap` none to xl, `align`, `justify`, `wrap` |
| `Container` | Centered max-width wrapper: `size` sm, md, lg, xl, full |

```svelte
<Stack direction="row" gap="sm" align="center"><Badge tone="success">Active</Badge><span>Ayu</span></Stack>
```

Variant objects (`buttonVariants`, `badgeVariants`, `cardVariants`, `inputVariants`, ...) are exported too, so you can style your own element like a kit component: `<a class={buttonVariants({ variant: 'outline' })}>`.

## Accessibility conventions

- Focus: `base.css` draws a 2px `--ring` outline on `:focus-visible`; controls add a ring with offset (`focus-visible:ring-2 ring-ring ring-offset-background`). Never remove it without a replacement.
- Form wiring: `FormField` generates ids and passes `describedBy` (description and error ids) and `invalid` to the control. `invalid` sets `aria-invalid`.
- Status roles: `Alert` uses `role="alert"` for warning and destructive and `role="status"` otherwise. `Toaster` has a polite region and an assertive region (destructive toasts). Toasts pause their timer on hover and focus.
- Dialogs, popovers, menus, tabs, select, accordion, tooltip are bits-ui primitives: focus trap and restore, Escape, arrow-key navigation, correct ARIA.
- Icon-only controls need a label: dialog and sheet close use `closeLabel`, `SearchInput` uses `clearLabel`, `Spinner` uses `label`, `AppShell` uses `menuLabel`.
- `AppShell` renders a skip link (`skipLabel`) and closes the mobile menu on Escape or link click. `Navbar` takes `navLabel` for its landmark.
- `TableHead sort` sets `aria-sort`; `Progress` exposes progressbar values (none when indeterminate).
- Motion respects `prefers-reduced-motion` through the duration tokens.
- Touch: keep targets at least `--tap-target`.

## Utilities

| Export | Purpose |
| --- | --- |
| `cn(...classes)` | `clsx` + `tailwind-merge`; last Tailwind utility wins |
| `tv`, `VariantProps` | `tailwind-variants` re-export for app-level variants |
| `formatCurrency(amount, { currency = 'IDR', locale = 'id-ID' })` | Money |
| `formatNumber(value, { locale, ...Intl options })` | Numbers |
| `formatDate(date, { locale, dateStyle = 'medium', timeZone })` | Date |
| `formatDateTime(date, { locale, dateStyle, timeStyle = 'short', timeZone })` | Date and time |
| `formatRelativeTime(date, now?, locale?)` | "3 hours ago" |
| `initials(name)` | "ayu lestari dewi" gives "AD" |
| `use:clickOutside={handler}` | Calls handler on clicks outside the node (capture phase) |
| `use:autofocus={enabled}` | Focuses the node on mount and when enabled flips true |
| `theme` | `value`, `resolved`, `init()` (call in `onMount`), `setTheme('light' \| 'dark' \| 'system')`; persists under `stery.theme` |

## Adoption status per app

| App | Status |
| --- | --- |
| HRIS | Full: Tailwind v4 with `theme.css` and kit components |
| POS | Tokens bridged into `@pos-stery/ui` scoped CSS; own components keep their look |
| SELA | Alias tokens only (own variables map to kit tokens); own components |

Apps adopt incrementally: tokens first (no visual change required), components where they replace local duplicates.
