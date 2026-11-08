import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { NativeSelect } from './index';

const options = createRawSnippet(() => ({
	render: () => '<optgroup label="Letters"><option value="a">Alpha</option><option value="b">Beta</option></optgroup>'
}));

describe('NativeSelect', () => {
	it('renders a combobox with its options', () => {
		render(NativeSelect, { 'aria-label': 'Letter', children: options });
		const select = screen.getByRole('combobox', { name: 'Letter' });
		expect(select.tagName).toBe('SELECT');
		expect(screen.getAllByRole('option')).toHaveLength(2);
		expect(select).toHaveClass('h-10');
	});

	it('selects the bound value and updates on change', async () => {
		render(NativeSelect, { value: 'b', 'aria-label': 'Letter', children: options });
		const select = screen.getByLabelText('Letter') as HTMLSelectElement;
		expect(select.value).toBe('b');
		await fireEvent.change(select, { target: { value: 'a' } });
		expect(select.value).toBe('a');
	});

	it('invalid sets aria-invalid and destructive border', () => {
		render(NativeSelect, { invalid: true, 'aria-label': 'Letter', children: options });
		const select = screen.getByLabelText('Letter');
		expect(select).toHaveAttribute('aria-invalid', 'true');
		expect(select).toHaveClass('border-destructive');
	});

	it('forwards disabled and merges class', () => {
		render(NativeSelect, { disabled: true, class: 'h-20', 'aria-label': 'Letter', children: options });
		const select = screen.getByLabelText('Letter');
		expect(select).toBeDisabled();
		expect(select).toHaveClass('h-20');
	});
});
