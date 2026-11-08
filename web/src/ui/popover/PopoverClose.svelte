<script lang="ts">
	import { Popover as PopoverPrimitive } from 'bits-ui';

	let { ref = $bindable(null), ...rest }: PopoverPrimitive.CloseProps = $props();
</script>

<PopoverPrimitive.Close bind:ref {...rest} />
