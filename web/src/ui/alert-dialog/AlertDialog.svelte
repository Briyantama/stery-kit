<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';

	let { open = $bindable(false), ...rest }: AlertDialogPrimitive.RootProps = $props();
</script>

<AlertDialogPrimitive.Root bind:open {...rest} />
