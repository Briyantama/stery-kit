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

<div
	bind:this={ref}
	class={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}
	{...rest}
>
	{@render children?.()}
</div>
