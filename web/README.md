# @stery/kit (web)

Shared web package for the Stery products (HRIS, POS, SELA). It ships TypeScript and Svelte as source (no build step) and has three parts:

- an API envelope client (`unwrap`, `ApiError`, `createClient`),
- SvelteKit BFF helpers (API proxy, session cookie handlers),
- the Stery design system: CSS tokens, a Tailwind v4 theme and Svelte 5 components.

See [docs/design-system.md](docs/design-system.md) for tokens, the component catalog and per-app adoption status.

## Install

The kit is a sibling directory of each product, linked by path (not published):

```json
"@stery/kit": "file:../../../stery-kit/web"
```

Then run `npm install` in the app. Peer dependencies: `svelte` ^5.56.1 and `@sveltejs/kit` ^2.63.0. The kit brings its own `bits-ui`, `clsx`, `tailwind-merge` and `tailwind-variants`.

## Entry points

| Import | What it is |
| --- | --- |
| `@stery/kit` | API client: `unwrap`, `unwrapEnvelope`, `ApiError`, `createClient`, `Envelope` |
| `@stery/kit/sveltekit/proxy` | `createApiProxy`: `/api/[...path]` BFF proxy that injects the bearer token |
| `@stery/kit/sveltekit/session` | `createSessionStore`, `createSessionHandlers`, `parseSession`: HttpOnly session cookie |
| `@stery/kit/ui` | Svelte components, `cn`, `tv`, formatters, `theme`, actions |
| `@stery/kit/styles/tokens.css` | Design tokens as plain CSS variables (no Tailwind needed) |
| `@stery/kit/styles/theme.css` | Tailwind v4 entry: tokens + base layer + `@theme` mapping + `dark:` variant |

## Tailwind v4 setup

In the app stylesheet (for example `src/app.css`):

```css
@import 'tailwindcss';
@import '@stery/kit/styles/theme.css';
```

`theme.css` already contains `@source '../ui'`, so the classes used inside kit components are generated even though the kit lives outside the app root. No extra `@source` line is needed. Use the kit with the `@tailwindcss/vite` plugin.

Then import components:

```svelte
<script lang="ts">
	import { Button, Card, CardContent } from '@stery/kit/ui';
</script>

<Card><CardContent><Button>Save</Button></CardContent></Card>
```

## Without Tailwind

Apps that do not use Tailwind (POS and SELA today) import only the tokens and read the variables in their own CSS:

```css
@import '@stery/kit/styles/tokens.css';

.panel {
	background: var(--surface);
	color: var(--surface-foreground);
	border: var(--border-width) solid var(--border);
	border-radius: var(--radius);
	box-shadow: var(--elevation-1);
}
```

The Svelte components need Tailwind utilities, so they are only usable in apps with the Tailwind setup above.

## Theming and branding

Override variables after the kit import. Nothing else is needed:

```css
@import '@stery/kit/styles/tokens.css';

:root {
	--primary: oklch(0.52 0.17 160);
	--ring: oklch(0.52 0.17 160);
	--radius: 0.375rem;
	--font-display: 'Fraunces', serif;
}

[data-theme='dark'] {
	--primary: oklch(0.7 0.14 160);
}
```

Dark mode is driven by `data-theme="dark"` on `<html>` (or any ancestor). The `theme` helper from `@stery/kit/ui` stores the choice (`light`, `dark` or `system`) in `localStorage` under `stery.theme` and sets the attribute. Call `theme.init()` once on the client:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '@stery/kit/ui';

	onMount(() => theme.init()); // returns a cleanup function
</script>

<button onclick={() => theme.setTheme(theme.resolved === 'dark' ? 'light' : 'dark')}>Toggle theme</button>
```

`theme.value` is the user's choice, `theme.resolved` is the applied `light` or `dark`.

## Showcase

`showcase/Showcase.svelte` renders every component in its main variants, light and dark side by side. It is not part of the package exports and the kit has no routes of its own. Mount it from any consuming app route (the app must have the Tailwind setup above):

```svelte
<!-- src/routes/dev/kit/+page.svelte -->
<script lang="ts">
	// The package exports do not expose showcase/, so import it by relative path to the kit checkout.
	import Showcase from '../../../../../../stery-kit/web/showcase/Showcase.svelte';
</script>

<Showcase />
```

Adjust the number of `../` for your route depth. Vite may need `server.fs.allow` to include the kit directory. Keep this route behind a dev-only check so it is not shipped to users.

## Scripts

```
npm run check       # svelte-check
npm run test:unit   # vitest
```
