import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Alert } from './index';

afterEach(cleanup);

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('Alert', () => {
	it('renders title, description and children', () => {
		render(Alert, { title: 'Heads up', description: 'Details', children: text('extra') });
		const el = screen.getByRole('status');
		expect(el).toHaveTextContent('Heads up');
		expect(el).toHaveTextContent('Details');
		expect(el).toHaveTextContent('extra');
	});

	it.each(['destructive', 'warning'] as const)('uses role=alert for %s', (tone) => {
		render(Alert, { tone, title: 'x' });
		expect(screen.getByRole('alert')).toBeInTheDocument();
	});

	it.each(['neutral', 'info', 'success'] as const)('uses role=status for %s', (tone) => {
		render(Alert, { tone, title: 'x' });
		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('applies tone classes', () => {
		render(Alert, { tone: 'success', title: 'x' });
		expect(screen.getByRole('status')).toHaveClass('bg-success/10');
	});

	it('has no close button unless dismissible', () => {
		render(Alert, { title: 'x' });
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('dismisses and calls ondismiss', async () => {
		const ondismiss = vi.fn();
		render(Alert, { title: 'x', dismissible: true, ondismiss });
		await fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
		expect(ondismiss).toHaveBeenCalledOnce();
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	it('supports a custom dismiss label', () => {
		render(Alert, { title: 'x', dismissible: true, dismissLabel: 'Close alert' });
		expect(screen.getByRole('button', { name: 'Close alert' })).toBeInTheDocument();
	});
});
