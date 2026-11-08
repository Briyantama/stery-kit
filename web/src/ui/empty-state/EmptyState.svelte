<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		title: string;
		description?: string;
		/** Heading level of the title, 1 to 6. */
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		icon?: Snippet;
		action?: Snippet;
		ref?: HTMLDivElement | null;
		children?: Snippet;
	}

	let {
		title,
		description,
		level = 3,
		icon,
		action,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<div
	bind:this={ref}
	class={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}
	{...rest}
>
	{#if icon}
		<div class="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground" aria-hidden="true">
			{@render icon()}
		</div>
	{/if}
	<div class="space-y-1">
		<svelte:element this={`h${level}`} class="font-display text-base font-semibold text-foreground">
			{title}
		</svelte:element>
		{#if description}
			<p class="max-w-sm text-sm text-muted-foreground">{description}</p>
		{/if}
	</div>
	{@render children?.()}
	{#if action}
		<div class="mt-1 flex flex-wrap items-center justify-center gap-2">
			{@render action()}
		</div>
	{/if}
</div>
