<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const alertVariants = tv({
		base: 'relative flex w-full items-start gap-3 rounded-lg border p-4 text-sm text-foreground',
		variants: {
			tone: {
				neutral: 'border-border bg-muted',
				info: 'border-info/40 bg-info/10',
				success: 'border-success/40 bg-success/10',
				warning: 'border-warning/40 bg-warning/10',
				destructive: 'border-destructive/40 bg-destructive/10'
			}
		},
		defaultVariants: { tone: 'neutral' }
	});

	export type AlertTone = NonNullable<VariantProps<typeof alertVariants>['tone']>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		tone?: AlertTone;
		title?: string;
		description?: string;
		/** Optional leading icon. */
		icon?: Snippet;
		/** Shows a close button. The alert hides itself and calls `ondismiss`. */
		dismissible?: boolean;
		dismissLabel?: string;
		ondismiss?: () => void;
		/** Whether the alert is shown. Bindable: set it back to `true` to show a dismissed alert again. */
		open?: boolean;
		ref?: HTMLDivElement | null;
		children?: Snippet;
	}

	let {
		tone = 'neutral',
		title,
		description,
		icon,
		dismissible = false,
		dismissLabel = 'Dismiss',
		open = $bindable(true),
		ondismiss,
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();

	const role = $derived(tone === 'destructive' || tone === 'warning' ? 'alert' : 'status');

	function dismiss() {
		open = false;
		ondismiss?.();
	}
</script>

{#if open}
	<div bind:this={ref} {role} class={cn(alertVariants({ tone }), className)} {...rest}>
		{#if icon}
			<span class="mt-0.5 shrink-0" aria-hidden="true">{@render icon()}</span>
		{/if}
		<div class="min-w-0 flex-1 space-y-1">
			{#if title}
				<p class="font-medium leading-none">{title}</p>
			{/if}
			{#if description}
				<p class="text-muted-foreground">{description}</p>
			{/if}
			{@render children?.()}
		</div>
		{#if dismissible}
			<button
				type="button"
				aria-label={dismissLabel}
				class="-m-1 shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				onclick={dismiss}
			>
				<svg
					viewBox="0 0 24 24"
					class="size-4"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<path d="M6 6l12 12M18 6L6 18" />
				</svg>
			</button>
		{/if}
	</div>
{/if}
