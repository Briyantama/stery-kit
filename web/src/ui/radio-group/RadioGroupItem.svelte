<script lang="ts">
	import { RadioGroup as BitsRadioGroup } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { cn } from '../utils/cn';

	type Props = Omit<BitsRadioGroup.ItemProps, 'class' | 'children' | 'child'> & {
		class?: string;
		/** Label content; when given, the radio is wrapped in a <label>. */
		children?: Snippet;
	};

	let { ref = $bindable(null), class: className, children, ...rest }: Props = $props();
</script>

{#snippet dot({ checked }: { checked: boolean })}
	{#if checked}
		<span class="size-2 rounded-full bg-primary" aria-hidden="true"></span>
	{/if}
{/snippet}

{#snippet control()}
	<BitsRadioGroup.Item
		bind:ref
		{...rest}
		class={cn(
			'inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary',
			className
		)}
		children={dot}
	/>
{/snippet}

{#if children}
	<label class="inline-flex items-center gap-2 text-sm text-foreground has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70">
		{@render control()}
		{@render children()}
	</label>
{:else}
	{@render control()}
{/if}
