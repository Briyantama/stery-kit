<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';
	import { dropdownMenuContentClass } from './variants';

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		...rest
	}: DropdownMenuPrimitive.ContentProps = $props();
</script>

<DropdownMenuPrimitive.Portal>
	<DropdownMenuPrimitive.Content
		bind:ref
		{sideOffset}
		class={cn(dropdownMenuContentClass, className)}
		{...rest}
	/>
</DropdownMenuPrimitive.Portal>
