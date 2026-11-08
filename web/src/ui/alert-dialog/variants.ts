import { tv, type VariantProps } from 'tailwind-variants';

/** Action button inside ConfirmDialog; `tone` picks the semantic color. */
export const confirmButtonVariants = tv({
	base: 'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
	variants: {
		tone: {
			primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
		}
	},
	defaultVariants: { tone: 'primary' }
});

export type ConfirmDialogVariant = VariantProps<typeof confirmButtonVariants>;

export const cancelButtonClass =
	'inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';
