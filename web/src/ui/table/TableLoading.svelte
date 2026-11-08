<!-- Set `aria-busy` on the surrounding table/tbody while loading; it does not belong on the placeholder rows. -->
<script lang="ts">
	import { Skeleton } from '../skeleton';
	import { cn } from '../utils/cn';

	interface Props {
		/** Number of cells per placeholder row. */
		columns?: number;
		/** Number of placeholder rows. */
		rows?: number;
		/** Screen reader text for the loading state. */
		label?: string;
		/** Applied to every placeholder row. */
		class?: string;
	}

	let { columns = 1, rows = 3, label = 'Loading', class: className }: Props = $props();
</script>

{#each { length: rows }, r}
	<tr class={cn('border-b border-border', className)}>
		{#each { length: columns }, c}
			<td class="p-3">
				<Skeleton class="h-4 w-full" />
				{#if r === 0 && c === 0}
					<span role="status" class="sr-only">{label}</span>
				{/if}
			</td>
		{/each}
	</tr>
{/each}
