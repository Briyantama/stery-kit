<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLThAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLThAttributes {
		/** Sets aria-sort and shows a direction marker for asc and desc. */
		sort?: 'asc' | 'desc' | 'none';
		ref?: HTMLTableCellElement | null;
		children?: Snippet;
	}

	let { sort, ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const ariaSort = $derived(
		sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : sort === 'none' ? 'none' : undefined
	);
</script>

<th
	bind:this={ref}
	scope="col"
	aria-sort={ariaSort}
	class={cn('h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground', className)}
	{...rest}
>
	{@render children?.()}
	{#if sort === 'asc' || sort === 'desc'}
		<span aria-hidden="true" class="ml-1 text-foreground">{sort === 'asc' ? '▲' : '▼'}</span>
	{/if}
</th>
