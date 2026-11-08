import { tv, type VariantProps } from 'tailwind-variants';

export const buttonVariants = tv({
	base: 'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
	variants: {
		variant: {
			primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
			outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
			ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
			destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
			link: 'text-primary underline-offset-4 hover:underline'
		},
		size: {
			sm: 'h-8 px-3 text-sm',
			md: 'h-10 px-4 text-sm',
			lg: 'h-12 px-6 text-base',
			icon: 'size-10'
		}
	},
	defaultVariants: { variant: 'primary', size: 'md' }
});

export type ButtonVariant = VariantProps<typeof buttonVariants>;
