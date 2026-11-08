import type { Action } from 'svelte/action';

/** Focuses `node` on mount when `enabled`, and again whenever `enabled` flips to true. */
export const autofocus: Action<HTMLElement, boolean | undefined> = (node, enabled = true) => {
	if (enabled) node.focus();
	return {
		update(next = true) {
			if (next) node.focus();
		}
	};
};
