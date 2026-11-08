<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		...rest
	}: TabsPrimitive.RootProps = $props();
</script>

<TabsPrimitive.Root bind:ref bind:value class={cn('flex flex-col gap-2', className)} {...rest} />
