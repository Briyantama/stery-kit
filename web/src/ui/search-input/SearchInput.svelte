<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import { inputVariants, type InputVariant } from '../input/variants';

	/** `class` styles the wrapper; `inputClass` and rest attributes go to the <input>. */
	type Props = Omit<HTMLInputAttributes, 'class' | 'size' | 'type' | 'value'> & {
		value?: string;
		size?: InputVariant['size'];
		invalid?: boolean;
		/** Called with the current value on Enter and after the clear button is used. */
		onsearch?: (value: string) => void;
		clearLabel?: string;
		class?: string;
		inputClass?: string;
		ref?: HTMLInputElement | null;
	};

	let {
		value = $bindable(''),
		ref = $bindable(null),
		size = 'md',
		invalid = false,
		onsearch,
		onkeydown,
		clearLabel = 'Clear search',
		class: className,
		inputClass,
		...rest
	}: Props = $props();

	const showClear = $derived(value !== '' && !rest.disabled && !rest.readonly);

	function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		onkeydown?.(event);
		if (event.key === 'Enter' && !event.defaultPrevented) onsearch?.(value);
	}

	function clear() {
		value = '';
		ref?.focus();
		onsearch?.('');
	}
</script>

<div class={cn('relative w-full', className)}>
	<svg
		class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<circle cx="11" cy="11" r="7" />
		<path d="m20 20-3.5-3.5" />
	</svg>
	<input
		bind:this={ref}
		bind:value
		type="search"
		aria-invalid={invalid ? 'true' : undefined}
		{...rest}
		onkeydown={handleKeydown}
		class={cn(
			inputVariants({ size, invalid }),
			'pl-9 [&::-webkit-search-cancel-button]:appearance-none',
			showClear && 'pr-9',
			inputClass
		)}
	/>
	{#if showClear}
		<button
			type="button"
			aria-label={clearLabel}
			onclick={clear}
			class="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<svg
				class="size-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				aria-hidden="true"
			>
				<path d="M18 6 6 18M6 6l12 12" />
			</svg>
		</button>
	{/if}
</div>
