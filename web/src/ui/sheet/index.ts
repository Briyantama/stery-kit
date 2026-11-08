export { default as SheetContent } from './SheetContent.svelte';
// A sheet is a dialog with a different content shell, so every other part is shared.
export {
	Dialog as Sheet,
	DialogTrigger as SheetTrigger,
	DialogClose as SheetClose,
	DialogHeader as SheetHeader,
	DialogTitle as SheetTitle,
	DialogDescription as SheetDescription,
	DialogFooter as SheetFooter
} from '../dialog';
export { sheetVariants, type SheetVariant } from './variants';
