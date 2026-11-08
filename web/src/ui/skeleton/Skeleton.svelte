<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ref?: HTMLDivElement | null;
	}

	let { ref = $bindable(null), class: className, ...rest }: Props = $props();
</script>

<div
	bind:this={ref}
	aria-hidden="true"
	class={cn('animate-pulse rounded-md bg-muted motion-reduce:animate-none', className)}
	{...rest}
></div>
