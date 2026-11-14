<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '../utils/cn';
	import { toast, type ToastItem } from './store.svelte';
	import { toastDotVariants, toastVariants } from './variants';

	let { item, class: className }: { item: ToastItem; class?: string } = $props();

	let hovered = false;
	let focused = false;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let remaining = 0;
	let startedAt = 0;

	function start() {
		if (remaining <= 0 || timer) return;
		startedAt = Date.now();
		timer = setTimeout(() => toast.dismiss(item.id), remaining);
	}

	function pause() {
		if (!timer) return;
		clearTimeout(timer);
		timer = undefined;
		remaining -= Date.now() - startedAt;
	}

	const resumeIfIdle = () => {
		if (!hovered && !focused) start();
	};

	onMount(() => {
		remaining = item.duration;
		start();
		return () => clearTimeout(timer);
	});
</script>

<!-- Hover only pauses the timer; focusin/focusout give keyboard users the same pause. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={cn(toastVariants({ tone: item.tone }), className)}
	data-tone={item.tone}
	onmouseenter={() => {
		hovered = true;
		pause();
	}}
	onmouseleave={() => {
		hovered = false;
		resumeIfIdle();
	}}
	onfocusin={() => {
		focused = true;
		pause();
	}}
	onfocusout={(e) => {
		if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
		focused = false;
		resumeIfIdle();
	}}
>
	<span class={toastDotVariants({ tone: item.tone })} aria-hidden="true"></span>
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<p class="text-sm font-semibold text-foreground">{item.title}</p>
		{#if item.description}
			<p class="text-sm text-muted-foreground">{item.description}</p>
		{/if}
	</div>
	<button
		type="button"
		aria-label="Dismiss notification"
		class="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		onclick={() => toast.dismiss(item.id)}
	>
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
	</button>
</div>
