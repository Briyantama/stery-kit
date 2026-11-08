<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTableAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends HTMLTableAttributes {
		/** Classes for the scroll wrapper. `class` and other attributes go on the `<table>`. */
		wrapperClass?: string;
		ref?: HTMLTableElement | null;
		children?: Snippet;
	}

	let { wrapperClass, ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

<div class={cn('relative w-full overflow-x-auto', wrapperClass)} data-slot="table-wrapper">
	<table bind:this={ref} class={cn('w-full caption-bottom border-collapse text-sm', className)} {...rest}>
		{@render children?.()}
	</table>
</div>
