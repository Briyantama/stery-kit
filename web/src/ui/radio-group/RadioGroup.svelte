<script lang="ts">
	import { RadioGroup as BitsRadioGroup } from 'bits-ui';
	import { cn } from '../utils/cn';

	type Props = Omit<BitsRadioGroup.RootProps, 'class'> & { class?: string };

	let {
		value = $bindable(''),
		ref = $bindable(null),
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<BitsRadioGroup.Root
	bind:ref
	bind:value
	{...rest}
	class={cn(
		'grid gap-2 data-[orientation=horizontal]:flex data-[orientation=horizontal]:flex-wrap data-[orientation=horizontal]:gap-4',
		className
	)}
>
	{@render children?.()}
</BitsRadioGroup.Root>
