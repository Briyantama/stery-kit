<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		/** Number of columns the message spans. */
		colspan?: number;
		ref?: HTMLTableRowElement | null;
		children?: Snippet;
	}

	let { colspan = 1, ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<tr bind:this={ref} class={className} {...rest}>
	<td {colspan} class="h-24 p-3 text-center text-sm text-muted-foreground">
		{#if children}
			{@render children()}
		{:else}
			No results
		{/if}
	</td>
</tr>
