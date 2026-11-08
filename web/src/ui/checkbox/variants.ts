import { tv, type VariantProps } from 'tailwind-variants';

export const checkboxVariants = tv({
	base: 'peer inline-flex shrink-0 items-center justify-center rounded-sm border border-input bg-background text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
	variants: {
		size: { sm: 'size-3.5', md: 'size-4', lg: 'size-5' },
		invalid: { true: 'border-destructive focus-visible:ring-destructive', false: '' }
	},
	defaultVariants: { size: 'md', invalid: false }
});

export type CheckboxVariant = VariantProps<typeof checkboxVariants>;
