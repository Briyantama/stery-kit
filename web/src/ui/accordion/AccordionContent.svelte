<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: AccordionPrimitive.ContentProps = $props();
</script>

<AccordionPrimitive.Content bind:ref class="overflow-hidden text-sm text-muted-foreground" {...rest}>
	<div class={cn('pb-4', className)}>
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
