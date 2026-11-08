<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** Drawer state under the md breakpoint. Bindable. */
		open?: boolean;
		/** Accessible label for the drawer toggle button. */
		menuLabel?: string;
		/** Label for the skip link. */
		skipLabel?: string;
		ref?: HTMLDivElement | null;
		sidebar?: Snippet;
		header?: Snippet;
		/** Main content. */
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		menuLabel = 'Toggle navigation',
		skipLabel = 'Skip to main content',
		ref = $bindable(null),
		class: className,
		sidebar,
		header,
		children,
		...rest
	}: Props = $props();

	const uid = $props.id();
	const sidebarId = `${uid}-sidebar`;

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) open = false;
	}

	// Close the drawer after following a link inside it.
	function onSidebarClick(event: MouseEvent) {
		if ((event.target as Element).closest('a')) open = false;
	}

	let sidebarEl = $state<HTMLElement | null>(null);
	let toggleEl = $state<HTMLButtonElement | null>(null);
	let wasOpen = false;

	// Move focus into the drawer when it opens and back to the toggle when it closes.
	$effect(() => {
		if (open) sidebarEl?.querySelector<HTMLElement>('a[href], button')?.focus();
		else if (wasOpen && sidebarEl?.contains(document.activeElement)) toggleEl?.focus();
		wasOpen = open;
	});

	// The drawer only exists below md; a stale `open` would leave the page inert after a resize.
	$effect(() => {
		if (typeof window.matchMedia !== 'function') return;
		const mq = window.matchMedia('(min-width: 768px)');
		const onChange = () => mq.matches && (open = false);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div bind:this={ref} class={cn('flex min-h-screen bg-background text-foreground', className)} {...rest}>
	<a
		href="#main"
		class="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-toast focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
	>
		{skipLabel}
	</a>

	{#if sidebar}
		{#if open}
			<!-- Pointer-only backdrop; keyboard users close with Escape or the toggle. -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div class="fixed inset-0 z-overlay bg-overlay md:hidden" data-testid="shell-backdrop" onclick={() => (open = false)}></div>
		{/if}
		<!-- Delegated link clicks close the drawer; keyboard activation of a link fires click too. -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<aside
			bind:this={sidebarEl}
			id={sidebarId}
			data-open={open}
			onclick={onSidebarClick}
			class={cn(
				'fixed inset-y-0 left-0 z-modal flex w-64 flex-col overflow-y-auto border-r border-border bg-surface p-3 text-surface-foreground transition-[transform,visibility] duration-200',
				'md:static md:z-auto md:visible md:translate-x-0',
				open ? 'translate-x-0' : 'invisible -translate-x-full'
			)}
		>
			{@render sidebar()}
		</aside>
	{/if}

	<!-- Inert while the drawer is open so focus and assistive tech cannot reach the page behind it. -->
	<div class="flex min-w-0 flex-1 flex-col" inert={open}>
		{#if header || sidebar}
			<div class="sticky top-0 z-sticky flex min-h-14 items-center gap-2 border-b border-border bg-surface px-4 text-surface-foreground">
				{#if sidebar}
					<button
						bind:this={toggleEl}
						type="button"
						class="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
						aria-label={menuLabel}
						aria-expanded={open}
						aria-controls={sidebarId}
						onclick={() => (open = !open)}
					>
						<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
							<path d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
				{/if}
				<div class="flex min-w-0 flex-1 items-center">{@render header?.()}</div>
			</div>
		{/if}
		<main id="main" tabindex="-1" class="min-w-0 flex-1 p-4 focus:outline-none sm:p-6">
			{@render children?.()}
		</main>
	</div>
</div>
