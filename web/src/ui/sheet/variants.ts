import { tv, type VariantProps } from 'tailwind-variants';

// Left and top slide in with `starting:` (CSS @starting-style) because the theme only ships
// slide-in-right and slide-in-up keyframes.
export const sheetVariants = tv({
	base: 'fixed z-modal flex flex-col gap-4 overflow-y-auto border-border bg-surface p-6 text-surface-foreground shadow-lg focus-visible:outline-none',
	variants: {
		side: {
			right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l animate-slide-in-right',
			left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r transition-[translate] duration-(--duration-slow) starting:-translate-x-full',
			top: 'inset-x-0 top-0 max-h-[85dvh] border-b transition-[translate] duration-(--duration-slow) starting:-translate-y-full',
			bottom: 'inset-x-0 bottom-0 max-h-[85dvh] border-t animate-slide-in-up'
		}
	},
	defaultVariants: { side: 'right' }
});

export type SheetVariant = VariantProps<typeof sheetVariants>;
