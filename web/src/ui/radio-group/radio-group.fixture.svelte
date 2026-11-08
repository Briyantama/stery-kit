<script lang="ts">
	import RadioGroup from './RadioGroup.svelte';
	import RadioGroupItem from './RadioGroupItem.svelte';

	let {
		value = $bindable(''),
		disabledOption = false,
		...rest
	}: { value?: string; disabledOption?: boolean; [key: string]: unknown } = $props();
</script>

<RadioGroup bind:value aria-label="Plan" {...rest}>
	<RadioGroupItem value="free">Free</RadioGroupItem>
	<RadioGroupItem value="pro">Pro</RadioGroupItem>
	<RadioGroupItem value="team" disabled={disabledOption}>Team</RadioGroupItem>
</RadioGroup>
<output data-testid="value">{value}</output>
