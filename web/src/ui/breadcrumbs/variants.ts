import { tv, type VariantProps } from 'tailwind-variants';

export const breadcrumbsVariants = tv({
	base: 'flex flex-wrap items-center gap-1.5 break-words text-muted-foreground',
	variants: {
		size: {
			sm: 'text-xs',
			md: 'text-sm',
			lg: 'text-base'
		}
	},
	defaultVariants: { size: 'md' }
});

export type BreadcrumbsVariant = VariantProps<typeof breadcrumbsVariants>;
