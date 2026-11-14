<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { dialogVariants, overlayClass } from '../dialog/variants';
	import DialogTitle from '../dialog/DialogTitle.svelte';
	import DialogDescription from '../dialog/DialogDescription.svelte';
	import DialogHeader from '../dialog/DialogHeader.svelte';
	import DialogFooter from '../dialog/DialogFooter.svelte';
	import { cancelButtonClass, confirmButtonVariants, type ConfirmDialogVariant } from './variants';

	type Props = ConfirmDialogVariant & {
		open?: boolean;
		title: string;
		description?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		/** Runs on confirm. While a returned promise is pending the dialog stays open in a loading state; it closes once it resolves. If it rejects the dialog stays open and shows the error message inline (see `error`, `errorLabel`). */
		onconfirm?: () => void | Promise<void>;
		oncancel?: () => void;
		/** Inline failure message (role="alert"). Set by the dialog when `onconfirm` rejects; clear or set it yourself too. */
		error?: string;
		/** Message used when `onconfirm` rejects without an Error message. */
		errorLabel?: string;
		/** Optional trigger element(s), rendered outside the dialog. */
		trigger?: Snippet;
		class?: string;
	};

	let {
		open = $bindable(false),
		title,
		description,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		error = $bindable(''),
		errorLabel = 'Something went wrong. Try again.',
		tone = 'primary',
		onconfirm,
		oncancel,
		trigger,
		class: className
	}: Props = $props();

	let loading = $state(false);

	$effect(() => {
		if (!open) error = '';
	});

	async function confirm() {
		if (loading) return;
		loading = true;
		error = '';
		try {
			await onconfirm?.();
			open = false;
		} catch (e) {
			error = (e instanceof Error && e.message) || errorLabel;
		} finally {
			loading = false;
		}
	}
</script>

<AlertDialogPrimitive.Root bind:open>
	{@render trigger?.()}
	<AlertDialogPrimitive.Portal>
		<AlertDialogPrimitive.Overlay class={overlayClass} />
		<AlertDialogPrimitive.Content
			class={cn(dialogVariants({ size: 'sm' }), className)}
			onEscapeKeydown={(e) => {
				if (loading) e.preventDefault();
			}}
		>
			<DialogHeader class="pr-0">
				<DialogTitle>{title}</DialogTitle>
				{#if description}
					<DialogDescription>{description}</DialogDescription>
				{/if}
			</DialogHeader>
			{#if error}
				<p role="alert" class="text-sm text-destructive">{error}</p>
			{/if}
			<DialogFooter>
				<AlertDialogPrimitive.Cancel
					class={cancelButtonClass}
					disabled={loading}
					onclick={() => oncancel?.()}
				>
					{cancelLabel}
				</AlertDialogPrimitive.Cancel>
				<button
					type="button"
					class={confirmButtonVariants({ tone })}
					disabled={loading}
					aria-busy={loading}
					onclick={confirm}
				>
					{#if loading}
						<svg
							class="size-4 animate-spin motion-reduce:[animation-duration:2s]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							aria-hidden="true"
						>
							<path d="M12 3a9 9 0 1 0 9 9" />
						</svg>
					{/if}
					{confirmLabel}
				</button>
			</DialogFooter>
		</AlertDialogPrimitive.Content>
	</AlertDialogPrimitive.Portal>
</AlertDialogPrimitive.Root>
