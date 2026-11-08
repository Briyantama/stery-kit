<script lang="ts" module>
	import { tv, type VariantProps } from '../utils/variants';

	export const stackVariants = tv({
		base: 'flex',
		variants: {
			direction: { column: 'flex-col', row: 'flex-row' },
			gap: {
				none: 'gap-0',
				xs: 'gap-1',
				sm: 'gap-2',
				md: 'gap-4',
				lg: 'gap-6',
				xl: 'gap-8'
			},
			align: {
				start: 'items-start',
				center: 'items-center',
				end: 'items-end',
				stretch: 'items-stretch',
				baseline: 'items-baseline'
			},
			justify: {
				start: 'justify-start',
				center: 'justify-center',
				end: 'justify-end',
				between: 'justify-between',
				around: 'justify-around'
			},
			wrap: { true: 'flex-wrap', false: 'flex-nowrap' }
		},
		defaultVariants: { direction: 'column', gap: 'md', wrap: false }
	});

	export type StackVariant = VariantProps<typeof stackVariants>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLElement> {
		/** Element tag to render, e.g. `ul`, `section`. */
		as?: string;
		direction?: StackVariant['direction'];
		gap?: StackVariant['gap'];
		align?: StackVariant['align'];
		justify?: StackVariant['justify'];
		wrap?: boolean;
		ref?: HTMLElement | null;
		children?: Snippet;
	}

	let {
		as = 'div',
		direction,
		gap,
		align,
		justify,
		wrap,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	this={as}
	bind:this={ref}
	class={cn(stackVariants({ direction, gap, align, justify, wrap }), className)}
	{...rest}
>
	{@render children?.()}
</svelte:element>
