export { default as AlertDialog } from './AlertDialog.svelte';
export { default as AlertDialogTrigger } from './AlertDialogTrigger.svelte';
export { default as AlertDialogContent } from './AlertDialogContent.svelte';
export { default as AlertDialogAction } from './AlertDialogAction.svelte';
export { default as AlertDialogCancel } from './AlertDialogCancel.svelte';
export { default as ConfirmDialog } from './ConfirmDialog.svelte';
// Title, description, header and footer are the same bits-ui parts as in Dialog (shared context).
export {
	DialogHeader as AlertDialogHeader,
	DialogTitle as AlertDialogTitle,
	DialogDescription as AlertDialogDescription,
	DialogFooter as AlertDialogFooter
} from '../dialog';
export { confirmButtonVariants, type ConfirmDialogVariant } from './variants';
