<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { selectVariants, type SelectVariant } from './variants';
	import type { SelectItem } from './types';

	type Props = Omit<SelectPrimitive.TriggerProps, 'children' | 'child' | 'value'> &
		Pick<SelectVariant, 'size'> & {
			items: SelectItem[];
			value?: string;
			placeholder?: string;
			invalid?: boolean;
			disabled?: boolean;
			required?: boolean;
			/** Form field name; renders a hidden input so the select takes part in form submission. */
			name?: string;
			open?: boolean;
			onValueChange?: (value: string) => void;
			/** Classes for the dropdown panel. */
			contentClass?: string;
		};

	let {
		ref = $bindable(null),
		value = $bindable(''),
		open = $bindable(false),
		items,
		placeholder = 'Select an option',
		invalid = false,
		disabled = false,
		required = false,
		name,
		size = 'md',
		onValueChange,
		class: className,
		contentClass,
		...rest
	}: Props = $props();

	const selected = $derived(items.find((item) => item.value === value));
</script>

<SelectPrimitive.Root type="single" bind:value bind:open {items} {disabled} {required} {name} {onValueChange}>
	<SelectPrimitive.Trigger
		bind:ref
		aria-invalid={invalid ? 'true' : undefined}
		class={cn(selectVariants({ size, invalid }), className)}
		{...rest}
	>
		<span class={cn('truncate', !selected && 'text-muted-foreground')}>
			{selected?.label ?? placeholder}
		</span>
		<svg
			class="size-4 shrink-0 text-muted-foreground"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	</SelectPrimitive.Trigger>
	<SelectPrimitive.Portal>
		<SelectPrimitive.Content
			sideOffset={4}
			class={cn(
				'z-dropdown max-h-72 min-w-(--bits-floating-anchor-width) overflow-hidden rounded-md border border-border bg-surface text-surface-foreground shadow-md animate-scale-in focus-visible:outline-none',
				contentClass
			)}
		>
			<SelectPrimitive.Viewport class="p-1">
				{#each items as item (item.value)}
					<SelectPrimitive.Item
						value={item.value}
						label={item.label}
						disabled={item.disabled}
						class="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted"
					>
						{#snippet children({ selected: isSelected })}
							<span class="absolute left-2 inline-flex size-4 items-center justify-center">
								{#if isSelected}
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
							{item.label}
						{/snippet}
					</SelectPrimitive.Item>
				{/each}
			</SelectPrimitive.Viewport>
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
</SelectPrimitive.Root>
