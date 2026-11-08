import { tv, type VariantProps } from 'tailwind-variants';

export const toastVariants = tv({
	base: 'pointer-events-auto relative mt-2 flex w-full items-start gap-3 rounded-md border border-l-4 border-border bg-surface p-4 pr-10 text-surface-foreground shadow-lg animate-slide-in-up',
	variants: {
		tone: {
			neutral: 'border-l-muted-foreground',
			info: 'border-l-info',
			success: 'border-l-success',
			warning: 'border-l-warning',
			destructive: 'border-l-destructive'
		}
	},
	defaultVariants: { tone: 'neutral' }
});

export type ToastVariant = VariantProps<typeof toastVariants>;

export const toasterVariants = tv({
	base: 'pointer-events-none fixed z-toast flex w-full max-w-sm flex-col p-2',
	variants: {
		position: {
			'top-left': 'left-0 top-0',
			'top-center': 'left-1/2 top-0 -translate-x-1/2',
			'top-right': 'right-0 top-0',
			'bottom-left': 'bottom-0 left-0',
			'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
			'bottom-right': 'bottom-0 right-0'
		}
	},
	defaultVariants: { position: 'bottom-right' }
});

export type ToasterVariant = VariantProps<typeof toasterVariants>;
