<script lang="ts" module>
	import { tv, type VariantProps } from '../utils/variants';

	export const containerVariants = tv({
		base: 'mx-auto w-full px-4 sm:px-6 lg:px-8',
		variants: {
			size: {
				sm: 'max-w-screen-sm',
				md: 'max-w-screen-md',
				lg: 'max-w-screen-lg',
				xl: 'max-w-screen-xl',
				full: 'max-w-none'
			}
		},
		defaultVariants: { size: 'xl' }
	});

	export type ContainerVariant = VariantProps<typeof containerVariants>;
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: ContainerVariant['size'];
		ref?: HTMLDivElement | null;
		children?: Snippet;
	}

	let { size, ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<div bind:this={ref} class={cn(containerVariants({ size }), className)} {...rest}>
	{@render children?.()}
</div>
