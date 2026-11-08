import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/svelte';
import { tick } from 'svelte';
import Toaster from './Toaster.svelte';
import { toast } from './store.svelte';

beforeEach(() => toast.clear());
afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe('toast store', () => {
	it('ignores show() on the server, where the store would be shared across requests', () => {
		vi.stubGlobal('window', undefined);
		try {
			expect(toast.show({ title: 'Leak' })).toBe('');
		} finally {
			vi.unstubAllGlobals();
		}
		expect(toast.items).toHaveLength(0);
	});

	it('show adds an item with defaults and returns its id', () => {
		const id = toast.show({ title: 'Saved' });
		expect(toast.items).toHaveLength(1);
		expect(toast.items[0]).toMatchObject({ id, title: 'Saved', tone: 'neutral', duration: 5000 });
	});

	it('shorthands set the tone', () => {
		toast.success('a');
		toast.error('b');
		toast.info('c', { description: 'more', duration: 0 });
		expect(toast.items.map((t) => t.tone)).toEqual(['success', 'destructive', 'info']);
		expect(toast.items[2]).toMatchObject({ description: 'more', duration: 0 });
	});

	it('dismiss removes only the given toast', () => {
		const a = toast.show({ title: 'a' });
		const b = toast.show({ title: 'b' });
		expect(a).not.toBe(b);
		toast.dismiss(a);
		expect(toast.items.map((t) => t.id)).toEqual([b]);
		toast.dismiss('missing');
		expect(toast.items).toHaveLength(1);
	});
});

describe('Toaster', () => {
	it('renders non-errors in a polite status region and errors in an assertive one', async () => {
		render(Toaster);
		toast.info('Heads up');
		toast.error('Failed');
		await tick();
		const status = screen.getByRole('status');
		expect(status).toHaveAttribute('aria-live', 'polite');
		expect(within(status).getByText('Heads up')).toBeInTheDocument();
		const alert = screen.getByRole('alert');
		expect(alert).toHaveAttribute('aria-live', 'assertive');
		expect(within(alert).getByText('Failed')).toBeInTheDocument();
	});

	it('dismisses via the close button', async () => {
		render(Toaster);
		toast.success('Done', { duration: 0 });
		await tick();
		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
		expect(screen.queryByText('Done')).not.toBeInTheDocument();
		expect(toast.items).toHaveLength(0);
	});

	it('auto-dismisses after the duration', async () => {
		vi.useFakeTimers();
		render(Toaster);
		toast.success('Bye', { duration: 1000 });
		await tick();
		await vi.advanceTimersByTimeAsync(999);
		expect(toast.items).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(2);
		expect(toast.items).toHaveLength(0);
	});

	it('never auto-dismisses when duration is 0', async () => {
		vi.useFakeTimers();
		render(Toaster);
		toast.show({ title: 'Sticky', duration: 0 });
		await tick();
		await vi.advanceTimersByTimeAsync(60_000);
		expect(toast.items).toHaveLength(1);
	});

	it('pauses on hover and resumes with the remaining time', async () => {
		vi.useFakeTimers();
		render(Toaster);
		toast.info('Hover me', { duration: 1000 });
		await tick();
		const el = screen.getByText('Hover me').closest('[data-tone]')!;
		await vi.advanceTimersByTimeAsync(600);
		el.dispatchEvent(new MouseEvent('mouseenter'));
		await vi.advanceTimersByTimeAsync(5000);
		expect(toast.items).toHaveLength(1);
		el.dispatchEvent(new MouseEvent('mouseleave'));
		await vi.advanceTimersByTimeAsync(399);
		expect(toast.items).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(2);
		expect(toast.items).toHaveLength(0);
	});

	it('pauses while focus is inside the toast', async () => {
		vi.useFakeTimers();
		render(Toaster);
		toast.info('Focus me', { duration: 1000 });
		await tick();
		screen.getByRole('button', { name: 'Dismiss notification' }).focus();
		await vi.advanceTimersByTimeAsync(5000);
		expect(toast.items).toHaveLength(1);
	});
});
