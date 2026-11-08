<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { dialogVariants, overlayClass, type DialogVariant } from '../dialog/variants';

	let {
		ref = $bindable(null),
		class: className,
		size = 'sm',
		...rest
	}: AlertDialogPrimitive.ContentProps & DialogVariant = $props();
</script>

<AlertDialogPrimitive.Portal>
	<AlertDialogPrimitive.Overlay class={overlayClass} />
	<AlertDialogPrimitive.Content
		bind:ref
		class={cn(dialogVariants({ size }), className)}
		{...rest}
	/>
</AlertDialogPrimitive.Portal>
