<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { confirmButtonVariants, type ConfirmDialogVariant } from './variants';

	let {
		ref = $bindable(null),
		class: className,
		tone = 'primary',
		...rest
	}: AlertDialogPrimitive.ActionProps & ConfirmDialogVariant = $props();
</script>

<AlertDialogPrimitive.Action
	bind:ref
	class={cn(confirmButtonVariants({ tone }), className)}
	{...rest}
/>
