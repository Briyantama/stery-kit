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
	class={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
	{...rest}
>
	{@render children?.()}
</div>
