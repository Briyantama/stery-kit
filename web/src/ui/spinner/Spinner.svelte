<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const spinnerVariants = tv({
		base: 'inline-flex shrink-0 items-center justify-center',
		variants: {
			size: { sm: 'size-4', md: 'size-6', lg: 'size-8' }
		},
		defaultVariants: { size: 'md' }
	});

	export type SpinnerSize = NonNullable<VariantProps<typeof spinnerVariants>['size']>;
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		size?: SpinnerSize;
		/** Screen reader text. */
		label?: string;
		ref?: HTMLSpanElement | null;
	}

	let { size = 'md', label = 'Loading', ref = $bindable(null), class: className, ...rest }: Props = $props();
</script>

<span bind:this={ref} role="status" class={cn(spinnerVariants({ size }), className)} {...rest}>
	<svg
		viewBox="0 0 24 24"
		class="size-full animate-spin motion-reduce:[animation-duration:2s]"
		fill="none"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" class="opacity-25" />
		<path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
	</svg>
	<span class="sr-only">{label}</span>
</span>
