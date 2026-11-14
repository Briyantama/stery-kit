<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface SidebarNavItem {
		label: string;
		href: string;
		icon?: Snippet;
		active?: boolean;
		badge?: string;
	}

	export interface SidebarNavGroup {
		label?: string;
		items: SidebarNavItem[];
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		/** Flat list of items. Ignored when `groups` is given. */
		items?: SidebarNavItem[];
		/** Items grouped under optional headings. */
		groups?: SidebarNavGroup[];
		ref?: HTMLElement | null;
	}

	let {
		items = [],
		groups,
		ref = $bindable(null),
		class: className,
		'aria-label': ariaLabel = 'Sidebar',
		...rest
	}: Props = $props();

	const sections = $derived(groups ?? [{ items }]);
	const uid = $props.id();
</script>

<nav bind:this={ref} aria-label={ariaLabel} class={cn('flex flex-col gap-4', className)} {...rest}>
	{#each sections as group, g (g)}
		<div class="flex flex-col gap-1">
			{#if group.label}
				<p
					id="{uid}-g{g}"
					class="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
				>
					{group.label}
				</p>
			{/if}
			<ul class="flex flex-col gap-0.5" aria-labelledby={group.label ? `${uid}-g${g}` : undefined}>
				{#each group.items as item (item.href)}
					<li>
						<a
							href={item.href}
							aria-current={item.active ? 'page' : undefined}
							class={cn(
								'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
								item.active
									? 'bg-primary/10 text-primary'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'
							)}
						>
							{#if item.icon}
								<span class="inline-flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
									{@render item.icon()}
								</span>
							{/if}
							<span class="min-w-0 flex-1 truncate">{item.label}</span>
							{#if item.badge}
								<span
									class="rounded-md bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground"
								>
									{item.badge}
								</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
