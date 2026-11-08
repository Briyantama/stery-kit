<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	let { ref = $bindable(null), ...rest }: DialogPrimitive.CloseProps = $props();
</script>

<DialogPrimitive.Close bind:ref {...rest} />
