import { tv, type VariantProps } from 'tailwind-variants';

export const dialogVariants = tv({
	base: 'fixed left-1/2 top-1/2 z-modal flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-lg border border-border bg-surface p-6 text-surface-foreground shadow-lg animate-scale-in focus-visible:outline-none',
	variants: {
		size: {
			sm: 'max-w-sm',
			md: 'max-w-md',
			lg: 'max-w-lg',
			xl: 'max-w-2xl'
		}
	},
	defaultVariants: { size: 'md' }
});

export type DialogVariant = VariantProps<typeof dialogVariants>;

/** Shared overlay (backdrop) classes for dialog, alert dialog and sheet. */
export const overlayClass = 'fixed inset-0 z-overlay bg-overlay animate-fade-in';

/** Shared close-button classes (the "x" in the corner of dialog and sheet). */
export const closeButtonClass =
	'absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
