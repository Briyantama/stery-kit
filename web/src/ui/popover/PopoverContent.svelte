<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 6,
		...rest
	}: PopoverPrimitive.ContentProps = $props();
</script>

<PopoverPrimitive.Portal>
	<PopoverPrimitive.Content
		bind:ref
		{sideOffset}
		class={cn(
			'z-dropdown w-72 rounded-md border border-border bg-surface p-4 text-surface-foreground shadow-md animate-scale-in focus-visible:outline-none',
			className
		)}
		{...rest}
	/>
</PopoverPrimitive.Portal>
