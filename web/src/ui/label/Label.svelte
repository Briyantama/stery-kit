<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	type Props = Omit<HTMLLabelAttributes, 'class'> & {
		/** Appends a visual required marker (hidden from assistive tech; set `required` on the control). */
		required?: boolean;
		class?: string;
		ref?: HTMLLabelElement | null;
		children?: Snippet;
	};

	let {
		for: htmlFor,
		required = false,
		class: className,
		ref = $bindable(null),
		children,
		...rest
	}: Props = $props();
</script>

<label
	bind:this={ref}
	for={htmlFor}
	{...rest}
	class={cn('text-sm font-medium leading-none text-foreground', className)}
>
	{@render children?.()}
	{#if required}<span class="ml-0.5 text-destructive" aria-hidden="true" data-testid="label-required">*</span>{/if}
</label>
