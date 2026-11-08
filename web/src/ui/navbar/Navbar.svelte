<script lang="ts" module>
	import { tv, type VariantProps } from '../utils/variants';

	export const navbarVariants = tv({
		base: 'flex w-full items-center gap-4 border-b border-border bg-surface px-4 text-surface-foreground',
		variants: {
			size: { sm: 'h-12', md: 'h-14', lg: 'h-16' },
			sticky: { true: 'sticky top-0 z-sticky', false: '' }
		},
		defaultVariants: { size: 'md', sticky: false }
	});

	export type NavbarVariant = VariantProps<typeof navbarVariants>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		size?: NavbarVariant['size'];
		sticky?: boolean;
		/** Accessible name for the primary navigation landmark. */
		navLabel?: string;
		ref?: HTMLElement | null;
		brand?: Snippet;
		nav?: Snippet;
		actions?: Snippet;
	}

	let {
		size,
		sticky,
		navLabel = 'Primary',
		ref = $bindable(null),
		class: className,
		brand,
		nav,
		actions,
		...rest
	}: Props = $props();
</script>

<header bind:this={ref} class={cn(navbarVariants({ size, sticky }), className)} {...rest}>
	{#if brand}
		<div class="flex shrink-0 items-center font-display font-semibold">{@render brand()}</div>
	{/if}
	{#if nav}
		<nav aria-label={navLabel} class="flex min-w-0 flex-1 items-center gap-1">{@render nav()}</nav>
	{:else}
		<div class="flex-1"></div>
	{/if}
	{#if actions}
		<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
	{/if}
</header>
