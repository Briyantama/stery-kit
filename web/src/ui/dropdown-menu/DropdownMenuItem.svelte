<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { dropdownMenuItemVariants, type DropdownMenuItemVariant } from './variants';

	let {
		ref = $bindable(null),
		class: className,
		variant = 'default',
		...rest
	}: DropdownMenuPrimitive.ItemProps & DropdownMenuItemVariant = $props();
</script>

<DropdownMenuPrimitive.Item
	bind:ref
	class={cn(dropdownMenuItemVariants({ variant }), className)}
	{...rest}
/>
