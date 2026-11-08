<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import { buttonVariants, type ButtonVariant } from './variants';

	type Props = Omit<HTMLButtonAttributes, 'class'> & {
		variant?: ButtonVariant['variant'];
		size?: ButtonVariant['size'];
		/** Shows a spinner, sets aria-busy and blocks interaction. */
		loading?: boolean;
		/** Renders an anchor instead of a button. */
		href?: string;
		class?: string;
		ref?: HTMLElement | null;
		children?: Snippet;
	};

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		disabled = false,
		href,
		type = 'button',
		class: className,
		ref = $bindable(null),
		children,
		onclick,
		...rest
	}: Props = $props();

	const classes = $derived(cn(buttonVariants({ variant, size }), className));
	const inactive = $derived(disabled || loading);
</script>

{#snippet content()}
	{#if loading}
		<svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true" data-testid="button-spinner">
			<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
			<path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
		</svg>
	{/if}
	{@render children?.()}
{/snippet}

{#if href !== undefined}
	<a
		bind:this={ref}
		{...rest as HTMLAnchorAttributes}
		onclick={inactive ? (e: MouseEvent) => e.preventDefault() : (onclick as HTMLAnchorAttributes['onclick'])}
		href={inactive ? undefined : href}
		role={inactive ? 'link' : undefined}
		aria-disabled={inactive ? 'true' : undefined}
		aria-busy={loading ? 'true' : undefined}
		tabindex={inactive ? -1 : undefined}
		class={classes}
	>
		{@render content()}
	</a>
{:else}
	<button
		bind:this={ref}
		{...rest}
		{onclick}
		{type}
		disabled={inactive}
		aria-busy={loading ? 'true' : undefined}
		class={classes}
	>
		{@render content()}
	</button>
{/if}
