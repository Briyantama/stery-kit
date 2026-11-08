<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import { getPageItems } from './pages';
	import { paginationVariants, type PaginationVariant } from './variants';

	type Props = Omit<HTMLAttributes<HTMLElement>, 'onchange'> &
		Pick<PaginationVariant, 'size'> & {
			ref?: HTMLElement | null;
			/** Current page, 1-based. */
			page?: number;
			/** Total number of pages. Alternatively pass `total` and `perPage`. */
			pageCount?: number;
			total?: number;
			perPage?: number;
			/** Pages shown on each side of the current page. */
			siblings?: number;
			onchange?: (page: number) => void;
		};

	let {
		ref = $bindable(null),
		page = $bindable(1),
		pageCount,
		total,
		perPage = 10,
		siblings = 1,
		size = 'md',
		onchange,
		class: className,
		...rest
	}: Props = $props();

	const count = $derived(
		Math.max(1, pageCount ?? Math.ceil((total ?? 0) / Math.max(1, perPage)))
	);
	const current = $derived(Math.min(Math.max(page, 1), count));
	const items = $derived(getPageItems(current, count, siblings));

	function go(next: number) {
		if (next < 1 || next > count || next === current) return;
		page = next;
		onchange?.(next);
	}
</script>

<nav bind:this={ref} aria-label="Pagination" class={cn('flex', className)} {...rest}>
	<ul class="flex flex-wrap items-center gap-1">
		<li>
			<button
				type="button"
				class={paginationVariants({ size })}
				aria-label="Previous page"
				disabled={current <= 1}
				onclick={() => go(current - 1)}
			>
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m15 6-6 6 6 6" />
				</svg>
			</button>
		</li>
		{#each items as item (item)}
			<li>
				{#if typeof item === 'number'}
					<button
						type="button"
						class={paginationVariants({ size, current: item === current })}
						aria-label={`Page ${item}`}
						aria-current={item === current ? 'page' : undefined}
						onclick={() => go(item)}
					>
						{item}
					</button>
				{:else}
					<span
						class={cn(paginationVariants({ size }), 'pointer-events-none text-muted-foreground hover:bg-transparent')}
						aria-hidden="true"
					>
						...
					</span>
				{/if}
			</li>
		{/each}
		<li>
			<button
				type="button"
				class={paginationVariants({ size })}
				aria-label="Next page"
				disabled={current >= count}
				onclick={() => go(current + 1)}
			>
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="m9 6 6 6-6 6" />
				</svg>
			</button>
		</li>
	</ul>
</nav>
