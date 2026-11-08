<script lang="ts">
	import Dialog from './Dialog.svelte';
	import DialogTrigger from './DialogTrigger.svelte';
	import DialogContent from './DialogContent.svelte';
	import DialogHeader from './DialogHeader.svelte';
	import DialogTitle from './DialogTitle.svelte';
	import DialogDescription from './DialogDescription.svelte';
	import DialogFooter from './DialogFooter.svelte';
	import type { DialogVariant } from './variants';

	let { open = $bindable(false), size }: { open?: boolean } & DialogVariant = $props();
</script>

<Dialog bind:open>
	<DialogTrigger>Open</DialogTrigger>
	<DialogContent {size}>
		<DialogHeader>
			<DialogTitle>Edit profile</DialogTitle>
			<DialogDescription>Change your details.</DialogDescription>
		</DialogHeader>
		<DialogFooter>
			<button type="button">Save</button>
		</DialogFooter>
	</DialogContent>
</Dialog>
