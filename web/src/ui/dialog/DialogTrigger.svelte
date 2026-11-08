<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	let { ref = $bindable(null), ...rest }: DialogPrimitive.TriggerProps = $props();
</script>

<DialogPrimitive.Trigger bind:ref {...rest} />
