<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		...rest
	}: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
	bind:ref
	class={cn('font-display text-lg font-semibold leading-tight text-foreground', className)}
	{...rest}
/>
