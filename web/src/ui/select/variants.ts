import { tv, type VariantProps } from 'tailwind-variants';

export const selectVariants = tv({
	base: 'flex w-full items-center justify-between gap-2 rounded-md border bg-background text-left text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
	variants: {
		size: {
			sm: 'h-8 px-2 text-xs',
			md: 'h-10 px-3 text-sm',
			lg: 'h-12 px-4 text-base'
		},
		invalid: {
			true: 'border-destructive focus-visible:ring-destructive',
			false: 'border-input'
		}
	},
	defaultVariants: { size: 'md', invalid: false }
});

export type SelectVariant = VariantProps<typeof selectVariants>;
