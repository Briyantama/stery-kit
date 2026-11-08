<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';

	let { ref = $bindable(null), ...rest }: TooltipPrimitive.TriggerProps = $props();
</script>

<TooltipPrimitive.Trigger bind:ref {...rest} />
