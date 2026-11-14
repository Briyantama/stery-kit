import { tv, type VariantProps } from 'tailwind-variants';

export const paginationVariants = tv({
	base: 'inline-flex select-none items-center justify-center rounded-md border border-transparent font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
	variants: {
		size: {
			sm: 'size-8 text-xs',
			md: 'size-10 text-sm',
			lg: 'size-12 text-base'
		},
		current: {
			true: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
			false: ''
		}
	},
	defaultVariants: { size: 'md', current: false }
});

export type PaginationVariant = VariantProps<typeof paginationVariants>;
