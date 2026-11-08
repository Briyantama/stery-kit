<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 6,
		...rest
	}: TooltipPrimitive.ContentProps = $props();
</script>

<TooltipPrimitive.Portal>
	<TooltipPrimitive.Content
		bind:ref
		{sideOffset}
		class={cn(
			'z-tooltip max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md animate-fade-in',
			className
		)}
		{...rest}
	/>
</TooltipPrimitive.Portal>
