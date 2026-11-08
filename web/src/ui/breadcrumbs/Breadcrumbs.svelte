<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import type { BreadcrumbItem } from './types';
	import { breadcrumbsVariants, type BreadcrumbsVariant } from './variants';

	type Props = HTMLAttributes<HTMLElement> &
		BreadcrumbsVariant & {
			ref?: HTMLElement | null;
			items: BreadcrumbItem[];
		};

	let { ref = $bindable(null), items, size = 'md', class: className, ...rest }: Props = $props();
</script>

<nav bind:this={ref} aria-label="Breadcrumb" class={cn(className)} {...rest}>
	<ol class={breadcrumbsVariants({ size })}>
		{#each items as item, i (i)}
			{@const last = i === items.length - 1}
			<li class="inline-flex items-center gap-1.5">
				{#if last}
					<span aria-current="page" class="font-medium text-foreground">{item.label}</span>
				{:else if item.href}
					<a
						href={item.href}
						class="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					>
						{item.label}
					</a>
				{:else}
					<span>{item.label}</span>
				{/if}
				{#if !last}
					<svg
						class="size-3.5 shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="m9 6 6 6-6 6" />
					</svg>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
