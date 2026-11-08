<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { closeButtonClass, dialogVariants, overlayClass, type DialogVariant } from './variants';

	type Props = DialogPrimitive.ContentProps &
		DialogVariant & {
			/** Render the corner close button. */
			showClose?: boolean;
			/** Accessible name of the close button. */
			closeLabel?: string;
		};

	let {
		ref = $bindable(null),
		class: className,
		size = 'md',
		showClose = true,
		closeLabel = 'Close',
		children,
		...rest
	}: Props = $props();
</script>

<DialogPrimitive.Portal>
	<DialogPrimitive.Overlay class={overlayClass} />
	<DialogPrimitive.Content bind:ref class={cn(dialogVariants({ size }), className)} {...rest}>
		{@render children?.()}
		{#if showClose}
			<DialogPrimitive.Close aria-label={closeLabel} class={closeButtonClass}>
				<svg
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					aria-hidden="true"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPrimitive.Portal>
