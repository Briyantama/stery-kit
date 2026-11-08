import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Textarea } from './index';

describe('Textarea', () => {
	it('renders a textbox with default size', () => {
		render(Textarea, { 'aria-label': 'notes' });
		const el = screen.getByRole('textbox', { name: 'notes' });
		expect(el.tagName).toBe('TEXTAREA');
		expect(el).toHaveClass('min-h-20');
		expect(el).not.toHaveAttribute('aria-invalid');
	});

	it('invalid sets aria-invalid and destructive border', () => {
		render(Textarea, { invalid: true, 'aria-label': 'notes' });
		const el = screen.getByLabelText('notes');
		expect(el).toHaveAttribute('aria-invalid', 'true');
		expect(el).toHaveClass('border-destructive');
	});

	it('applies size and merges caller class', () => {
		render(Textarea, { size: 'lg', class: 'min-h-40', 'aria-label': 'notes' });
		const el = screen.getByLabelText('notes');
		expect(el).toHaveClass('min-h-40');
		expect(el).not.toHaveClass('min-h-28');
	});

	it('reflects value and updates on input', async () => {
		render(Textarea, { value: 'hello', 'aria-label': 'notes' });
		const el = screen.getByLabelText('notes') as HTMLTextAreaElement;
		expect(el.value).toBe('hello');
		await fireEvent.input(el, { target: { value: 'bye' } });
		expect(el.value).toBe('bye');
	});

	it('forwards disabled and rows', () => {
		render(Textarea, { disabled: true, rows: 6, 'aria-label': 'notes' });
		const el = screen.getByLabelText('notes');
		expect(el).toBeDisabled();
		expect(el).toHaveAttribute('rows', '6');
	});
});
