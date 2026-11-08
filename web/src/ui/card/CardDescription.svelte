<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		ref?: HTMLParagraphElement | null;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<p bind:this={ref} class={cn('text-sm text-muted-foreground', className)} {...rest}>
	{@render children?.()}
</p>
