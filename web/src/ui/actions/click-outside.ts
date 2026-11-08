import type { Action } from 'svelte/action';

/** Calls `handler` when a click lands outside `node`. Capture phase, so handlers that remove the target cannot cause false positives. */
export const clickOutside: Action<HTMLElement, (event: MouseEvent) => void> = (node, handler) => {
	let current = handler;
	const onClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node | null)) current?.(event);
	};
	document.addEventListener('click', onClick, true);
	return {
		update(next) {
			current = next;
		},
		destroy() {
			document.removeEventListener('click', onClick, true);
		}
	};
};
