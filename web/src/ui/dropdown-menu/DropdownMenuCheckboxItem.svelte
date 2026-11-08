<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { dropdownMenuItemVariants } from './variants';

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		class: className,
		children: label,
		...rest
	}: Omit<DropdownMenuPrimitive.CheckboxItemProps, 'children'> & { children?: Snippet } = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
	bind:ref
	bind:checked
	class={cn(dropdownMenuItemVariants(), 'pl-8', className)}
	{...rest}
>
	{#snippet children({ checked: isChecked })}
		<span class="absolute left-2 inline-flex size-4 items-center justify-center">
			{#if isChecked}
				<svg
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="m5 12 5 5L20 7" />
				</svg>
			{/if}
		</span>
		{@render label?.()}
	{/snippet}
</DropdownMenuPrimitive.CheckboxItem>
