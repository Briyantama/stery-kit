<script lang="ts">
	import { Checkbox as BitsCheckbox } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '../utils/cn';
	import { checkboxVariants, type CheckboxVariant } from './variants';

	type Props = Omit<BitsCheckbox.RootProps, 'class' | 'children' | 'child'> & {
		size?: CheckboxVariant['size'];
		invalid?: boolean;
		class?: string;
		/** Label content; when given, the control is wrapped in a <label>. */
		children?: Snippet;
	};

	let {
		checked = $bindable(false),
		indeterminate = $bindable(false),
		ref = $bindable(null),
		size = 'md',
		invalid = false,
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

{#snippet indicator({ checked, indeterminate }: { checked: boolean; indeterminate: boolean })}
	{#if indeterminate}
		<svg class="size-full p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
			<path d="M5 12h14" />
		</svg>
	{:else if checked}
		<svg class="size-full p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="m5 12 5 5L20 7" />
		</svg>
	{/if}
{/snippet}

{#snippet control()}
	<BitsCheckbox.Root
		bind:ref
		bind:checked
		bind:indeterminate
		aria-invalid={invalid ? 'true' : undefined}
		{...rest}
		class={cn(checkboxVariants({ size, invalid }), className)}
		children={indicator}
	/>
{/snippet}

{#if children}
	<label class="inline-flex items-center gap-2 text-sm text-foreground has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70">
		{@render control()}
		{@render children()}
	</label>
{:else}
	{@render control()}
{/if}
