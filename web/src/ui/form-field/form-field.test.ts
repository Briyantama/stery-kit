import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { FormField } from './index';

type Control = { id: string; describedBy: string | undefined; invalid: boolean };

const control = createRawSnippet<[Control]>((ctx) => ({
	render: () => {
		const { id, describedBy, invalid } = ctx();
		const attrs = [
			`id="${id}"`,
			describedBy ? `aria-describedby="${describedBy}"` : '',
			invalid ? 'aria-invalid="true"' : ''
		].join(' ');
		return `<input ${attrs} />`;
	}
}));

describe('FormField', () => {
	it('associates the label with the control', () => {
		render(FormField, { label: 'Email', children: control });
		const input = screen.getByLabelText('Email');
		expect(input.tagName).toBe('INPUT');
		expect(input).not.toHaveAttribute('aria-describedby');
		expect(input).not.toHaveAttribute('aria-invalid');
	});

	it('wires description into aria-describedby', () => {
		render(FormField, { label: 'Email', description: 'We never share it', children: control });
		const input = screen.getByLabelText('Email');
		const desc = screen.getByText('We never share it');
		expect(input.getAttribute('aria-describedby')).toBe(desc.id);
	});

	it('renders error with role=alert, marks invalid and describes the control', () => {
		render(FormField, {
			label: 'Email',
			description: 'Hint',
			error: 'Required',
			children: control
		});
		const input = screen.getByLabelText('Email');
		const alert = screen.getByRole('alert');
		expect(alert).toHaveTextContent('Required');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		const ids = input.getAttribute('aria-describedby')!.split(' ');
		expect(ids).toContain(alert.id);
		expect(ids).toContain(screen.getByText('Hint').id);
	});

	it('shows the required marker', () => {
		render(FormField, { label: 'Email', required: true, children: control });
		expect(screen.getByTestId('label-required')).toBeInTheDocument();
	});

	it('uses a caller supplied id', () => {
		render(FormField, { label: 'Email', id: 'custom', children: control });
		expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'custom');
	});

	it('generates distinct ids per instance', () => {
		render(FormField, { label: 'A', children: control });
		render(FormField, { label: 'B', children: control });
		expect(screen.getByLabelText('A').id).not.toBe(screen.getByLabelText('B').id);
	});

	it('merges class onto the root', () => {
		const { container } = render(FormField, { class: 'gap-6', children: control });
		expect(container.firstElementChild).toHaveClass('gap-6');
	});
});
