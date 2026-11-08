import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './index';

const label = createRawSnippet(() => ({ render: () => '<span>Notifications</span>' }));

describe('Switch', () => {
	it('renders role=switch, off by default', () => {
		render(Switch, { 'aria-label': 'Wifi' });
		const sw = screen.getByRole('switch', { name: 'Wifi' });
		expect(sw).toHaveAttribute('aria-checked', 'false');
		expect(sw).toHaveClass('h-6', 'w-11');
	});

	it('is named by its label content', () => {
		render(Switch, { children: label });
		expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument();
	});

	it('toggles on click and calls onCheckedChange', async () => {
		const onCheckedChange = vi.fn();
		render(Switch, { 'aria-label': 'Wifi', onCheckedChange });
		const sw = screen.getByRole('switch');
		await fireEvent.click(sw);
		expect(sw).toHaveAttribute('aria-checked', 'true');
		expect(sw).toHaveAttribute('data-state', 'checked');
		expect(onCheckedChange).toHaveBeenLastCalledWith(true);
	});

	it('respects initial checked', () => {
		render(Switch, { checked: true, 'aria-label': 'Wifi' });
		expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
	});

	it('does not toggle when disabled', async () => {
		const onCheckedChange = vi.fn();
		render(Switch, { disabled: true, 'aria-label': 'Wifi', onCheckedChange });
		const sw = screen.getByRole('switch');
		expect(sw).toBeDisabled();
		await fireEvent.click(sw);
		expect(onCheckedChange).not.toHaveBeenCalled();
	});

	it('applies size and merges caller class', () => {
		render(Switch, { size: 'sm', class: 'w-20', 'aria-label': 'Wifi' });
		const sw = screen.getByRole('switch');
		expect(sw).toHaveClass('h-5', 'w-20');
		expect(sw).not.toHaveClass('w-9');
	});
});
