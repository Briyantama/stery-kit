<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import { inputVariants, type InputVariant } from './variants';

	type Props = Omit<HTMLInputAttributes, 'class' | 'size'> & {
		size?: InputVariant['size'];
		/** Marks the field invalid: sets aria-invalid and the destructive border. */
		invalid?: boolean;
		class?: string;
		ref?: HTMLInputElement | null;
	};

	let {
		value = $bindable(),
		ref = $bindable(null),
		size = 'md',
		invalid = false,
		class: className,
		...rest
	}: Props = $props();
</script>

<input
	bind:this={ref}
	bind:value
	aria-invalid={invalid ? 'true' : undefined}
	{...rest}
	class={cn(inputVariants({ size, invalid }), className)}
/>
