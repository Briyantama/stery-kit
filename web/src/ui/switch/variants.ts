import { tv, type VariantProps } from 'tailwind-variants';

export const switchVariants = tv({
	slots: {
		root: 'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
		thumb: 'pointer-events-none block rounded-full bg-background shadow-sm transition-transform data-[state=unchecked]:translate-x-0'
	},
	variants: {
		size: {
			sm: { root: 'h-5 w-9', thumb: 'size-4 data-[state=checked]:translate-x-4' },
			md: { root: 'h-6 w-11', thumb: 'size-5 data-[state=checked]:translate-x-5' },
			lg: { root: 'h-7 w-14', thumb: 'size-6 data-[state=checked]:translate-x-7' }
		}
	},
	defaultVariants: { size: 'md' }
});

export type SwitchVariant = VariantProps<typeof switchVariants>;
