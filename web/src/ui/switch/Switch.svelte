<script lang="ts">
	import { Switch as BitsSwitch } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '../utils/cn';
	import { switchVariants, type SwitchVariant } from './variants';

	type Props = Omit<BitsSwitch.RootProps, 'class' | 'children' | 'child'> & {
		size?: SwitchVariant['size'];
		class?: string;
		/** Label content; when given, the control is wrapped in a <label>. */
		children?: Snippet;
	};

	let {
		checked = $bindable(false),
		ref = $bindable(null),
		size = 'md',
		class: className,
		children,
		...rest
	}: Props = $props();

	const slots = $derived(switchVariants({ size }));
</script>

{#snippet control()}
	<BitsSwitch.Root bind:ref bind:checked {...rest} class={cn(slots.root(), className)}>
		<BitsSwitch.Thumb class={slots.thumb()} />
	</BitsSwitch.Root>
{/snippet}

{#if children}
	<label class="inline-flex items-center gap-2 text-sm text-foreground has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70">
		{@render control()}
		{@render children()}
	</label>
{:else}
	{@render control()}
{/if}
