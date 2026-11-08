import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './index';

const label = createRawSnippet(() => ({ render: () => '<span>Accept terms</span>' }));

describe('Checkbox', () => {
	it('renders an unchecked checkbox', () => {
		render(Checkbox, { 'aria-label': 'Agree' });
		const box = screen.getByRole('checkbox', { name: 'Agree' });
		expect(box).toHaveAttribute('aria-checked', 'false');
		expect(box).toHaveAttribute('data-state', 'unchecked');
	});

	it('is named by its label content', () => {
		render(Checkbox, { children: label });
		expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument();
	});

	it('toggles on click and calls onCheckedChange', async () => {
		const onCheckedChange = vi.fn();
		render(Checkbox, { 'aria-label': 'Agree', onCheckedChange });
		const box = screen.getByRole('checkbox');
		await fireEvent.click(box);
		expect(box).toHaveAttribute('aria-checked', 'true');
		expect(onCheckedChange).toHaveBeenLastCalledWith(true);
		await fireEvent.click(box);
		expect(box).toHaveAttribute('aria-checked', 'false');
		expect(onCheckedChange).toHaveBeenLastCalledWith(false);
	});

	it('respects initial checked', () => {
		render(Checkbox, { checked: true, 'aria-label': 'Agree' });
		expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
	});

	it('supports indeterminate', () => {
		render(Checkbox, { indeterminate: true, 'aria-label': 'Some' });
		expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
	});

	it('does not toggle when disabled', async () => {
		const onCheckedChange = vi.fn();
		render(Checkbox, { disabled: true, 'aria-label': 'Agree', onCheckedChange });
		const box = screen.getByRole('checkbox');
		expect(box).toBeDisabled();
		await fireEvent.click(box);
		expect(onCheckedChange).not.toHaveBeenCalled();
	});

	it('invalid sets aria-invalid and destructive border; size applies', () => {
		render(Checkbox, { invalid: true, size: 'lg', 'aria-label': 'Agree' });
		const box = screen.getByRole('checkbox');
		expect(box).toHaveAttribute('aria-invalid', 'true');
		expect(box).toHaveClass('border-destructive', 'size-5');
	});
});
