<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const descriptionListVariants = tv({
		slots: {
			root: 'text-sm',
			row: 'py-2',
			term: 'font-medium text-muted-foreground',
			description: 'text-foreground'
		},
		variants: {
			layout: {
				vertical: { root: 'space-y-3', row: 'flex flex-col gap-1', description: '' },
				horizontal: {
					root: 'divide-y divide-border',
					row: 'flex flex-col gap-1 sm:grid sm:grid-cols-3 sm:gap-4',
					description: 'sm:col-span-2'
				}
			}
		},
		defaultVariants: { layout: 'vertical' }
	});

	export type DescriptionListLayout = NonNullable<VariantProps<typeof descriptionListVariants>['layout']>;
	export interface DescriptionItem {
		term: string;
		description: string | number;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLDListElement> {
		/** Term and description pairs. Use `children` instead for custom markup. */
		items?: DescriptionItem[];
		layout?: DescriptionListLayout;
		ref?: HTMLDListElement | null;
		children?: Snippet;
	}

	let { items, layout = 'vertical', ref = $bindable(null), class: className, children, ...rest }: Props = $props();

	const slots = $derived(descriptionListVariants({ layout }));
</script>

<dl bind:this={ref} data-layout={layout} class={cn(slots.root(), className)} {...rest}>
	{#if items}
		{#each items as item, i (i)}
			<div class={slots.row()}>
				<dt class={slots.term()}>{item.term}</dt>
				<dd class={slots.description()}>{item.description}</dd>
			</div>
		{/each}
	{/if}
	{@render children?.()}
</dl>
