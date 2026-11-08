<script lang="ts">
	import { Accordion as AccordionPrimitive } from 'bits-ui';
	import { cn } from '../utils/cn';

	let {
		ref = $bindable(null),
		class: className,
		children,
		level = 3,
		...rest
	}: AccordionPrimitive.TriggerProps & { level?: AccordionPrimitive.HeaderProps['level'] } =
		$props();
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		bind:ref
		class={cn(
			'group flex flex-1 items-center justify-between gap-4 rounded-sm py-4 text-left text-sm font-medium text-foreground transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
			className
		)}
		{...rest}
	>
		{@render children?.()}
		<svg
			class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
