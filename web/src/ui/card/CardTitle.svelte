<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLHeadingElement> {
		/** Heading level, 1 to 6. Pick the one that fits the page outline. */
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		ref?: HTMLHeadingElement | null;
		children?: Snippet;
	}

	let { level = 3, ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<svelte:element
	this={`h${level}`}
	bind:this={ref}
	class={cn('font-display text-lg font-semibold leading-none tracking-tight', className)}
	{...rest}
>
	{@render children?.()}
</svelte:element>
