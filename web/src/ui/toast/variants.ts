import { tv, type VariantProps } from 'tailwind-variants';

export const toastVariants = tv({
	base: 'pointer-events-auto relative mt-2 flex w-full items-start gap-3 rounded-md border border-border bg-surface p-4 pr-10 text-surface-foreground shadow-lg animate-slide-in-up',
	variants: {
		tone: {
			neutral: '',
			info: 'border-info/50',
			success: 'border-success/50',
			warning: 'border-warning/60',
			destructive: 'border-destructive/50'
		}
	},
	defaultVariants: { tone: 'neutral' }
});

export type ToastVariant = VariantProps<typeof toastVariants>;

/** Tone marker: a dot in the toast body instead of a thick side stripe. */
export const toastDotVariants = tv({
	base: 'mt-1.5 size-2 shrink-0 rounded-full',
	variants: {
		tone: {
			neutral: 'bg-muted-foreground',
			info: 'bg-info',
			success: 'bg-success',
			warning: 'bg-warning',
			destructive: 'bg-destructive'
		}
	},
	defaultVariants: { tone: 'neutral' }
});

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
