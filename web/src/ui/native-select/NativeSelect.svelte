<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import { inputVariants, type InputVariant } from '../input/variants';

	type Props = Omit<HTMLSelectAttributes, 'class' | 'size'> & {
		size?: InputVariant['size'];
		/** Marks the field invalid: sets aria-invalid and the destructive border. */
		invalid?: boolean;
		class?: string;
		ref?: HTMLSelectElement | null;
		/** `<option>` / `<optgroup>` elements. */
		children?: Snippet;
	};

	let {
		value = $bindable(),
		ref = $bindable(null),
		size = 'md',
		invalid = false,
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<select
	bind:this={ref}
	bind:value
	aria-invalid={invalid ? 'true' : undefined}
	{...rest}
	class={cn(inputVariants({ size, invalid }), className)}
>
	{@render children?.()}
</select>
