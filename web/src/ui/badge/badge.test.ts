import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge } from './index';

afterEach(cleanup);

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('Badge', () => {
	it('renders children with neutral solid default', () => {
		render(Badge, { children: text('New'), 'data-testid': 'b' });
		const el = screen.getByTestId('b');
		expect(el).toHaveTextContent('New');
		expect(el).toHaveClass('bg-muted');
	});

	it.each(['info', 'success', 'warning', 'destructive'] as const)('applies solid %s tone', (tone) => {
		render(Badge, { tone, 'data-testid': 'b' });
		expect(screen.getByTestId('b')).toHaveClass(`bg-${tone}`, `text-${tone}-foreground`);
	});

	it('applies outline style', () => {
		render(Badge, { tone: 'success', outline: true, 'data-testid': 'b' });
		const el = screen.getByTestId('b');
		expect(el).toHaveClass('border-success', 'text-success', 'bg-transparent');
		expect(el).not.toHaveClass('bg-success');
	});

	it('merges caller classes and attributes', () => {
		render(Badge, { class: 'px-4', title: 'hint', 'data-testid': 'b' });
		const el = screen.getByTestId('b');
		expect(el).toHaveClass('px-4');
		expect(el).not.toHaveClass('px-2');
		expect(el).toHaveAttribute('title', 'hint');
	});
});
