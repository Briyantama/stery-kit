<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		...rest
	}: AccordionPrimitive.ItemProps = $props();
</script>

<AccordionPrimitive.Item bind:ref class={cn('border-b border-border', className)} {...rest} />
