import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './index';

afterEach(cleanup);

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('Card', () => {
	it('renders children with default variant classes', () => {
		render(Card, { children: text('body'), 'data-testid': 'card' });
		const el = screen.getByTestId('card');
		expect(el).toHaveTextContent('body');
		expect(el).toHaveClass('bg-surface');
	});

	it('applies variants', () => {
		render(Card, { variant: 'muted', 'data-testid': 'card' });
		expect(screen.getByTestId('card')).toHaveClass('bg-muted');
		cleanup();
		render(Card, { variant: 'outline', 'data-testid': 'card' });
		expect(screen.getByTestId('card')).toHaveClass('bg-transparent');
	});

	it('lets caller classes override', () => {
		render(Card, { class: 'bg-primary', 'data-testid': 'card' });
		const el = screen.getByTestId('card');
		expect(el).toHaveClass('bg-primary');
		expect(el).not.toHaveClass('bg-surface');
	});
});

describe('Card parts', () => {
	it('CardTitle defaults to h3 and honours level', () => {
		render(CardTitle, { children: text('Title') });
		expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title');
		cleanup();
		render(CardTitle, { level: 2, children: text('Title') });
		expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
	});

	it('renders description, header, content and footer', () => {
		render(CardDescription, { children: text('desc'), 'data-testid': 'p' });
		expect(screen.getByTestId('p').tagName).toBe('P');
		cleanup();
		for (const part of [CardHeader, CardContent, CardFooter]) {
			render(part, { children: text('x'), 'data-testid': 'part' });
			expect(screen.getByTestId('part')).toHaveTextContent('x');
			cleanup();
		}
	});
});
