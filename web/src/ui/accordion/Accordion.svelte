<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	// `type` ("single" | "multiple") decides whether `value` is a string or a string[].
	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...rest
	}: AccordionPrimitive.RootProps = $props();
</script>

<AccordionPrimitive.Root
	bind:ref
	bind:value={value as never}
	class={cn('w-full', className)}
	{...rest}
/>
