<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
		title: string;
		description?: string;
		/** Rendered above the title, typically a breadcrumb nav. */
		breadcrumbs?: Snippet;
		/** Rendered beside the title on wide screens and below it on narrow ones. */
		actions?: Snippet;
		ref?: HTMLElement | null;
	}

	let {
		title,
		description,
		breadcrumbs,
		actions,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();
</script>

<header bind:this={ref} class={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)} {...rest}>
	<div class="min-w-0 space-y-2">
		{#if breadcrumbs}
			{@render breadcrumbs()}
		{/if}
		<h1 class="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
		{#if description}
			<p class="text-sm text-muted-foreground">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 flex-wrap items-center gap-2">
			{@render actions()}
		</div>
	{/if}
</header>
