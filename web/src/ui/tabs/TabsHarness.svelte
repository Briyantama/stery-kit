<script lang="ts">
	import Tabs from './Tabs.svelte';
	import TabsList from './TabsList.svelte';
	import TabsTrigger from './TabsTrigger.svelte';
	import TabsContent from './TabsContent.svelte';

	let { value = $bindable('a') }: { value?: string } = $props();
</script>

<Tabs bind:value>
	<TabsList aria-label="Sections">
		<TabsTrigger value="a">Alpha</TabsTrigger>
		<TabsTrigger value="b">Beta</TabsTrigger>
		<TabsTrigger value="c" disabled>Gamma</TabsTrigger>
	</TabsList>
	<TabsContent value="a">Panel alpha</TabsContent>
	<TabsContent value="b">Panel beta</TabsContent>
</Tabs>
