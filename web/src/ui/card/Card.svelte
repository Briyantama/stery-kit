<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const cardVariants = tv({
		base: 'rounded-lg border text-surface-foreground',
		variants: {
			variant: {
				default: 'border-border bg-surface shadow-sm',
				outline: 'border-border bg-transparent',
				muted: 'border-transparent bg-muted'
			}
		},
		defaultVariants: { variant: 'default' }
	});

	export type CardVariant = NonNullable<VariantProps<typeof cardVariants>['variant']>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: CardVariant;
		ref?: HTMLDivElement | null;
		children?: Snippet;
	}

	let { variant = 'default', ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<div bind:this={ref} class={cn(cardVariants({ variant }), className)} {...rest}>
	{@render children?.()}
</div>
