import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Input } from './index';

describe('Input', () => {
	it('renders a textbox with md size by default', () => {
		render(Input, { placeholder: 'Name' });
		const input = screen.getByPlaceholderText('Name');
		expect(input).toHaveClass('h-10');
		expect(input).not.toHaveAttribute('aria-invalid');
	});

	it('applies size and merges caller class', () => {
		render(Input, { size: 'lg', class: 'h-20', placeholder: 'x' });
		const input = screen.getByPlaceholderText('x');
		expect(input).toHaveClass('h-20');
		expect(input).not.toHaveClass('h-12');
	});

	it('invalid sets aria-invalid and destructive border', () => {
		render(Input, { invalid: true, placeholder: 'x' });
		const input = screen.getByPlaceholderText('x');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveClass('border-destructive');
	});

	it('reflects initial value and updates on input', async () => {
		render(Input, { value: 'abc', 'aria-label': 'field' });
		const input = screen.getByLabelText('field') as HTMLInputElement;
		expect(input.value).toBe('abc');
		await fireEvent.input(input, { target: { value: 'xyz' } });
		expect(input.value).toBe('xyz');
	});

	it('forwards disabled and type', () => {
		render(Input, { disabled: true, type: 'email', placeholder: 'x' });
		const input = screen.getByPlaceholderText('x');
		expect(input).toBeDisabled();
		expect(input).toHaveAttribute('type', 'email');
	});
});
