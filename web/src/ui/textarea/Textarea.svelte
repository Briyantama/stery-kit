<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import { textareaVariants, type TextareaVariant } from './variants';

	type Props = Omit<HTMLTextareaAttributes, 'class'> & {
		size?: TextareaVariant['size'];
		/** Marks the field invalid: sets aria-invalid and the destructive border. */
		invalid?: boolean;
		class?: string;
		ref?: HTMLTextAreaElement | null;
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

<textarea
	bind:this={ref}
	bind:value
	aria-invalid={invalid ? 'true' : undefined}
	{...rest}
	class={cn(textareaVariants({ size, invalid }), className)}
></textarea>
