import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { Label } from './index';

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('Label', () => {
	it('renders a label with the for attribute', () => {
		render(Label, { for: 'email', children: text('Email') });
		const label = screen.getByText('Email').closest('label')!;
		expect(label).toHaveAttribute('for', 'email');
		expect(screen.queryByTestId('label-required')).toBeNull();
	});

	it('shows a decorative required marker', () => {
		render(Label, { for: 'email', required: true, children: text('Email') });
		const marker = screen.getByTestId('label-required');
		expect(marker).toHaveAttribute('aria-hidden', 'true');
	});

	it('merges class and spreads rest attributes', () => {
		render(Label, { class: 'text-lg', id: 'lbl', children: text('Name') });
		const label = screen.getByText('Name').closest('label')!;
		expect(label).toHaveClass('text-lg');
		expect(label).not.toHaveClass('text-sm');
		expect(label).toHaveAttribute('id', 'lbl');
	});
});
