<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLElement> {
		ref?: HTMLElement | null;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<caption bind:this={ref} class={cn('mt-3 text-sm text-muted-foreground', className)} {...rest}>
	{@render children?.()}
</caption>
