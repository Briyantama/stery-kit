<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const statDeltaVariants = tv({
		base: 'inline-flex items-center gap-1 font-medium',
		variants: {
			tone: {
				neutral: 'text-muted-foreground',
				info: 'text-info',
				success: 'text-success',
				warning: 'text-warning',
				destructive: 'text-destructive'
			}
		},
		defaultVariants: { tone: 'neutral' }
	});

	export type StatTone = NonNullable<VariantProps<typeof statDeltaVariants>['tone']>;
	export type StatTrend = 'up' | 'down' | 'flat';

	const trendMarker = { up: '▲', down: '▼', flat: '–' } as const;
	const trendText = { up: 'Increase', down: 'Decrease', flat: 'No change' } as const;
	const trendTone = { up: 'success', down: 'destructive', flat: 'neutral' } as const;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		value: string | number;
		/** Change figure, for example "+12%". */
		delta?: string | number;
		trend?: StatTrend;
		/** Delta colour. Defaults from the trend (up success, down destructive, flat neutral). */
		tone?: StatTone;
		hint?: string;
		icon?: Snippet;
		ref?: HTMLDivElement | null;
	}

	let {
		label,
		value,
		delta,
		trend = 'flat',
		tone,
		hint,
		icon,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();
</script>

<div
	bind:this={ref}
	class={cn('flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-5 text-surface-foreground shadow-sm', className)}
	{...rest}
>
	<div class="min-w-0 space-y-1">
		<p class="text-sm text-muted-foreground">{label}</p>
		<p class="font-display text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
		{#if delta !== undefined || hint}
			<p class="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
				{#if delta !== undefined}
					<span class={statDeltaVariants({ tone: tone ?? trendTone[trend] })} data-trend={trend}>
						<span aria-hidden="true">{trendMarker[trend]}</span>
						<span class="sr-only">{trendText[trend]}:</span>
						{delta}
					</span>
				{/if}
				{#if hint}
					<span>{hint}</span>
				{/if}
			</p>
		{/if}
	</div>
	{#if icon}
		<div class="shrink-0 rounded-md bg-muted p-2 text-muted-foreground" aria-hidden="true">
			{@render icon()}
		</div>
	{/if}
</div>
