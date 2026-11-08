<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';
	import Label from '../label/Label.svelte';

	type Control = { id: string; describedBy: string | undefined; invalid: boolean };

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> & {
		label?: string;
		description?: string;
		/** Error message; presence marks the control invalid. */
		error?: string;
		required?: boolean;
		/** Override the generated control id. */
		id?: string;
		class?: string;
		ref?: HTMLDivElement | null;
		/** Renders the control; spread `id`, `aria-describedby` and `aria-invalid` onto it. */
		children: Snippet<[Control]>;
	};

	const uid = $props.id();

	let {
		label,
		description,
		error,
		required = false,
		id: idProp,
		class: className,
		ref = $bindable(null),
		children,
		...rest
	}: Props = $props();

	const id = $derived(idProp ?? `${uid}-control`);
	const descriptionId = $derived(`${uid}-description`);
	const errorId = $derived(`${uid}-error`);
	const invalid = $derived(Boolean(error));
	const describedBy = $derived(
		[description ? descriptionId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined
	);
</script>

<div bind:this={ref} {...rest} class={cn('grid gap-1.5', className)}>
	{#if label}
		<Label for={id} {required}>{label}</Label>
	{/if}
	{@render children({ id, describedBy, invalid })}
	{#if description}
		<p id={descriptionId} class="text-sm text-muted-foreground">{description}</p>
	{/if}
	{#if error}
		<p id={errorId} role="alert" class="text-sm text-destructive">{error}</p>
	{/if}
</div>
