<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const separatorVariants = tv({
		base: 'shrink-0 bg-border',
		variants: {
			orientation: {
				horizontal: 'h-px w-full',
				vertical: 'h-full min-h-4 w-px self-stretch'
			}
		},
		defaultVariants: { orientation: 'horizontal' }
	});

	export type SeparatorOrientation = NonNullable<VariantProps<typeof separatorVariants>['orientation']>;
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: SeparatorOrientation;
		/** Purely visual: removes the separator from the accessibility tree. */
		decorative?: boolean;
		ref?: HTMLDivElement | null;
	}

	let {
		orientation = 'horizontal',
		decorative = false,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();
</script>

<div
	bind:this={ref}
	role={decorative ? 'none' : 'separator'}
	aria-orientation={decorative ? undefined : orientation}
	data-orientation={orientation}
	class={cn(separatorVariants({ orientation }), className)}
	{...rest}
></div>
