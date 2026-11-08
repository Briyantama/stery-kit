<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		...rest
	}: TabsPrimitive.ListProps = $props();
</script>

<TabsPrimitive.List
	bind:ref
	class={cn(
		'inline-flex items-center gap-1 rounded-md bg-muted p-1 text-muted-foreground data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
		className
	)}
	{...rest}
/>
