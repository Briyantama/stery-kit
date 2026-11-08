<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const avatarVariants = tv({
		base: 'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground',
		variants: {
			size: {
				sm: 'size-8 text-xs',
				md: 'size-10 text-sm',
				lg: 'size-14 text-base'
			}
		},
		defaultVariants: { size: 'md' }
	});

	export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;

	/** First letter of the first and last word, uppercased. */
	export function getInitials(name: string): string {
		const words = name.trim().split(/\s+/).filter(Boolean);
		if (words.length === 0) return '?';
		const first = words[0]!;
		const last = words.length > 1 ? words[words.length - 1]! : '';
		return (first.charAt(0) + last.charAt(0)).toUpperCase();
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		src?: string | null;
		/** Accessible name. Falls back to `name`. */
		alt?: string;
		/** Used for initials when there is no image. */
		name?: string;
		/** Text shown instead of initials, for example "+3". */
		fallback?: string;
		size?: AvatarSize;
		ref?: HTMLSpanElement | null;
	}

	let {
		src,
		alt,
		name,
		fallback,
		size = 'md',
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	let failedSrc = $state<string | null>(null);
	const showImage = $derived(Boolean(src) && failedSrc !== src);
	const label = $derived(alt ?? name ?? '');
	const text = $derived(fallback ?? (name ? getInitials(name) : '?'));
</script>

<span
	bind:this={ref}
	role={showImage ? undefined : 'img'}
	aria-label={showImage ? undefined : label || undefined}
	class={cn(avatarVariants({ size }), className)}
	{...rest}
>
	{#if showImage}
		<img {src} alt={label} class="size-full object-cover" onerror={() => (failedSrc = src ?? null)} />
	{:else}
		<span aria-hidden="true">{text}</span>
	{/if}
</span>
