<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap',
		variants: {
			tone: {
				neutral: 'bg-muted text-muted-foreground',
				info: 'bg-info text-info-foreground',
				success: 'bg-success text-success-foreground',
				warning: 'bg-warning text-warning-foreground',
				destructive: 'bg-destructive text-destructive-foreground'
			},
			outline: { true: 'bg-transparent' }
		},
		// Later classes win in the merge, so outline overrides the solid tone colours.
		compoundVariants: [
			{ tone: 'neutral', outline: true, class: 'border-border text-foreground' },
			{ tone: 'info', outline: true, class: 'border-info text-info' },
			{ tone: 'success', outline: true, class: 'border-success text-success' },
			{ tone: 'warning', outline: true, class: 'border-warning text-warning-foreground' },
			{ tone: 'destructive', outline: true, class: 'border-destructive text-destructive' }
		],
		defaultVariants: { tone: 'neutral' }
	});

	export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		tone?: BadgeTone;
		/** Transparent background with a toned border and text. */
		outline?: boolean;
		ref?: HTMLSpanElement | null;
		children?: Snippet;
	}

	let {
		tone = 'neutral',
		outline = false,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<span bind:this={ref} class={cn(badgeVariants({ tone, outline }), className)} {...rest}>
	{@render children?.()}
</span>
