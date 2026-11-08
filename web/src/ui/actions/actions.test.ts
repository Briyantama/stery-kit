import { describe, expect, it, vi } from 'vitest';
import { autofocus } from './autofocus';
import { clickOutside } from './click-outside';

function mount() {
	const node = document.createElement('div');
	const inner = document.createElement('button');
	node.appendChild(inner);
	const outside = document.createElement('button');
	document.body.append(node, outside);
	return { node, inner, outside };
}

describe('clickOutside', () => {
	it('fires for outside clicks only', () => {
		const { node, inner, outside } = mount();
		const handler = vi.fn();
		const action = clickOutside(node, handler)!;
		inner.click();
		node.click();
		expect(handler).not.toHaveBeenCalled();
		outside.click();
		expect(handler).toHaveBeenCalledTimes(1);
		action.destroy?.();
	});

	it('uses the updated handler and stops after destroy', () => {
		const { node, outside } = mount();
		const first = vi.fn();
		const second = vi.fn();
		const action = clickOutside(node, first)!;
		action.update?.(second);
		outside.click();
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledTimes(1);
		action.destroy?.();
		outside.click();
		expect(second).toHaveBeenCalledTimes(1);
	});
});

describe('autofocus', () => {
	it('focuses on mount by default', () => {
		const { inner } = mount();
		autofocus(inner, undefined);
		expect(document.activeElement).toBe(inner);
	});

	it('does nothing when disabled, focuses when enabled later', () => {
		const { inner, outside } = mount();
		outside.focus();
		const action = autofocus(inner, false)!;
		expect(document.activeElement).toBe(outside);
		action.update?.(true);
		expect(document.activeElement).toBe(inner);
	});
});
