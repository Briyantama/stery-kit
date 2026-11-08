export type ToastTone = 'neutral' | 'info' | 'success' | 'warning' | 'destructive';

export interface ToastOptions {
	title: string;
	description?: string;
	/** Defaults to `neutral`. */
	tone?: ToastTone;
	/** Milliseconds before auto-dismiss. `0` keeps the toast until dismissed. Defaults to 5000. */
	duration?: number;
}

export interface ToastItem {
	id: string;
	title: string;
	description?: string;
	tone: ToastTone;
	duration: number;
}

export const DEFAULT_TOAST_DURATION = 5000;

let items = $state<ToastItem[]>([]);
let seq = 0;

type Shorthand = (title: string, options?: Omit<ToastOptions, 'title' | 'tone'>) => string;

function show(options: ToastOptions): string {
	const id = `toast-${++seq}`;
	items.push({
		id,
		title: options.title,
		description: options.description,
		tone: options.tone ?? 'neutral',
		duration: options.duration ?? DEFAULT_TOAST_DURATION
	});
	return id;
}

const withTone =
	(tone: ToastTone): Shorthand =>
	(title, options) =>
		show({ ...options, title, tone });

/** Global toast store. Render `<Toaster />` once near the app root to display it. */
export const toast = {
	/** Reactive list of visible toasts, oldest first. */
	get items(): readonly ToastItem[] {
		return items;
	},
	show,
	success: withTone('success'),
	error: withTone('destructive'),
	info: withTone('info'),
	warning: withTone('warning'),
	dismiss(id: string): void {
		items = items.filter((item) => item.id !== id);
	},
	clear(): void {
		items = [];
	}
};
