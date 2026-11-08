import { tv, type VariantProps } from 'tailwind-variants';

/** Shared single-line field look; also used by NativeSelect and SearchInput. */
export const inputVariants = tv({
	base: 'w-full rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
	variants: {
		size: {
			sm: 'h-8 px-2.5 text-sm',
			md: 'h-10 px-3 text-sm',
			lg: 'h-12 px-4 text-base'
		},
		invalid: {
			true: 'border-destructive focus-visible:ring-destructive',
			false: ''
		}
	},
	defaultVariants: { size: 'md', invalid: false }
});

export type InputVariant = VariantProps<typeof inputVariants>;
