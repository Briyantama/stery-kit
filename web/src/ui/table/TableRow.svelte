<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		/** Highlights the row via data-state=selected. */
		selected?: boolean;
		ref?: HTMLTableRowElement | null;
		children?: Snippet;
	}

	let { selected, ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<tr
	bind:this={ref}
	data-state={selected ? 'selected' : undefined}
	class={cn('border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}
	{...rest}
>
	{@render children?.()}
</tr>
