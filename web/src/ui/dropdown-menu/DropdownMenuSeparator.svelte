<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		...rest
	}: DropdownMenuPrimitive.SeparatorProps = $props();
</script>

<DropdownMenuPrimitive.Separator bind:ref class={cn('-mx-1 my-1 h-px bg-border', className)} {...rest} />
