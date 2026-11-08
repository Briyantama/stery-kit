<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ref?: HTMLDivElement | null;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<div bind:this={ref} class={cn('flex items-center gap-2 p-6 pt-0', className)} {...rest}>
	{@render children?.()}
</div>
