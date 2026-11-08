<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		ref?: HTMLDivElement | null;
		search?: Snippet;
		filters?: Snippet;
		actions?: Snippet;
	}

	let { ref = $bindable(null), class: className, search, filters, actions, ...rest }: Props = $props();
</script>

<div
	bind:this={ref}
	role="search"
	class={cn('flex flex-wrap items-center gap-2 sm:gap-3', className)}
	{...rest}
>
	{#if search}
		<div class="w-full min-w-0 sm:w-auto sm:min-w-64 sm:flex-1">{@render search()}</div>
	{/if}
	{#if filters}
		<div class="flex flex-wrap items-center gap-2">{@render filters()}</div>
	{/if}
	{#if actions}
		<div class="flex flex-wrap items-center gap-2 sm:ml-auto">{@render actions()}</div>
	{/if}
</div>
