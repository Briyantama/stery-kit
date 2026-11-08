import { tv, type VariantProps } from 'tailwind-variants';

export const textareaVariants = tv({
	base: 'w-full rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
	variants: {
		size: {
			sm: 'min-h-16 px-2.5 py-1.5 text-sm',
			md: 'min-h-20 px-3 py-2 text-sm',
			lg: 'min-h-28 px-4 py-3 text-base'
		},
		invalid: {
			true: 'border-destructive focus-visible:ring-destructive',
			false: ''
		}
	},
	defaultVariants: { size: 'md', invalid: false }
});

export type TextareaVariant = VariantProps<typeof textareaVariants>;
