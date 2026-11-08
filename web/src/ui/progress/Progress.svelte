<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const progressVariants = tv({
		slots: {
			root: 'relative w-full overflow-hidden rounded-full bg-muted',
			bar: 'h-full rounded-full transition-[width] motion-reduce:transition-none'
		},
		variants: {
			tone: {
				primary: { bar: 'bg-primary' },
				info: { bar: 'bg-info' },
				success: { bar: 'bg-success' },
				warning: { bar: 'bg-warning' },
				destructive: { bar: 'bg-destructive' }
			},
			size: {
				sm: { root: 'h-1.5' },
				md: { root: 'h-2.5' },
				lg: { root: 'h-4' }
			}
		},
		defaultVariants: { tone: 'primary', size: 'md' }
	});

	export type ProgressTone = NonNullable<VariantProps<typeof progressVariants>['tone']>;
	export type ProgressSize = NonNullable<VariantProps<typeof progressVariants>['size']>;
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: number;
		max?: number;
		/** Unknown duration: omits aria-valuenow and pulses the bar. */
		indeterminate?: boolean;
		tone?: ProgressTone;
		size?: ProgressSize;
		ref?: HTMLDivElement | null;
	}

	let {
		value = 0,
		max = 100,
		indeterminate = false,
		tone = 'primary',
		size = 'md',
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	// A zero or negative max has no valid ARIA range; fall back to the default.
	const safeMax = $derived(max > 0 ? max : 100);
	const current = $derived(Math.min(Math.max(value, 0), safeMax));
	const percent = $derived((current / safeMax) * 100);
	const slots = $derived(progressVariants({ tone, size }));
</script>

<div
	bind:this={ref}
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={safeMax}
	aria-valuenow={indeterminate ? undefined : current}
	data-state={indeterminate ? 'indeterminate' : current >= safeMax ? 'complete' : 'loading'}
	class={cn(slots.root(), className)}
	{...rest}
>
	<div
		class={cn(slots.bar(), indeterminate && 'animate-pulse motion-reduce:animate-none')}
		style:width={indeterminate ? '100%' : `${percent}%`}
	></div>
</div>
