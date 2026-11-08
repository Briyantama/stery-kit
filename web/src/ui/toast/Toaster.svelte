<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import Toast from './Toast.svelte';
	import { toast } from './store.svelte';
	import { toasterVariants, type ToasterVariant } from './variants';

	let {
		position = 'bottom-right',
		class: className,
		...rest
	}: HTMLAttributes<HTMLDivElement> & ToasterVariant = $props();

	// Errors go to an assertive region so screen readers interrupt; everything else is polite.
	const polite = $derived(toast.items.filter((t) => t.tone !== 'destructive'));
	const assertive = $derived(toast.items.filter((t) => t.tone === 'destructive'));
</script>

<div class={cn(toasterVariants({ position }), className)} {...rest}>
	<div role="status" aria-live="polite" aria-atomic="false" aria-label="Notifications">
		{#each polite as item (item.id)}
			<Toast {item} />
		{/each}
	</div>
	<div role="alert" aria-live="assertive" aria-atomic="false" aria-label="Error notifications">
		{#each assertive as item (item.id)}
			<Toast {item} />
		{/each}
	</div>
</div>
