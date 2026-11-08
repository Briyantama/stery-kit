<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import Avatar, { type AvatarSize } from './Avatar.svelte';

	interface AvatarItem {
		src?: string | null;
		alt?: string;
		name?: string;
	}

	interface Props extends HTMLAttributes<HTMLDivElement> {
		items: AvatarItem[];
		/** Maximum avatars shown before collapsing the rest into a "+N" avatar. */
		max?: number;
		size?: AvatarSize;
		ref?: HTMLDivElement | null;
	}

	let { items, max = 4, size = 'md', ref = $bindable(null), class: className, ...rest }: Props = $props();

	const visible = $derived(items.slice(0, Math.max(max, 0)));
	const overflow = $derived(items.length - visible.length);
</script>

<div bind:this={ref} role="group" class={cn('flex items-center -space-x-2', className)} {...rest}>
	{#each visible as item, i (i)}
		<Avatar {...item} {size} class="ring-2 ring-background" />
	{/each}
	{#if overflow > 0}
		<Avatar fallback={`+${overflow}`} alt={`${overflow} more`} {size} class="ring-2 ring-background" />
	{/if}
</div>
