import { tv, type VariantProps } from 'tailwind-variants';

export const dropdownMenuItemVariants = tv({
	base: 'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-disabled:pointer-events-none data-disabled:opacity-50',
	variants: {
		variant: {
			default: 'text-foreground data-highlighted:bg-muted',
			destructive:
				'text-destructive data-highlighted:bg-destructive data-highlighted:text-destructive-foreground'
		}
	},
	defaultVariants: { variant: 'default' }
});

export type DropdownMenuItemVariant = VariantProps<typeof dropdownMenuItemVariants>;

export const dropdownMenuContentClass =
	'z-dropdown min-w-40 overflow-hidden rounded-md border border-border bg-surface p-1 text-surface-foreground shadow-md animate-scale-in focus-visible:outline-none';
