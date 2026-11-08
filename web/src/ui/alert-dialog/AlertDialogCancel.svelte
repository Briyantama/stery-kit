<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { cancelButtonClass } from './variants';

	let {
		ref = $bindable(null),
		class: className,
		...rest
	}: AlertDialogPrimitive.CancelProps = $props();
</script>

<AlertDialogPrimitive.Cancel bind:ref class={cn(cancelButtonClass, className)} {...rest} />
