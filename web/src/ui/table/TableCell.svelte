<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTdAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLTdAttributes {
		ref?: HTMLTableCellElement | null;
		children?: Snippet;
	}

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<td bind:this={ref} class={cn('p-3 align-middle tabular-nums', className)} {...rest}>
	{@render children?.()}
</td>
