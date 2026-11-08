<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {
		ref?: HTMLTableSectionElement | null;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<tbody bind:this={ref} class={cn('[&_tr:last-child]:border-0', className)} {...rest}>
	{@render children?.()}
</tbody>
