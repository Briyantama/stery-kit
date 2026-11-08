<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: HTMLAttributes<HTMLDivElement> & { ref?: HTMLElement | null; children?: Snippet } = $props();
</script>

<div bind:this={ref} class={cn('flex flex-col gap-1.5 pr-8 text-left', className)} {...rest}>
	{@render children?.()}
</div>
