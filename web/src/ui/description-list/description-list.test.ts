import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { DescriptionList } from './index';

afterEach(cleanup);

const html = (value: string) => createRawSnippet(() => ({ render: () => value }));
const items = [
	{ term: 'Name', description: 'Ada' },
	{ term: 'Age', description: 36 }
];

describe('DescriptionList', () => {
	it('renders term/description pairs from items', () => {
		render(DescriptionList, { items, 'data-testid': 'dl' });
		const dl = screen.getByTestId('dl');
		expect(dl.tagName).toBe('DL');
		expect([...dl.querySelectorAll('dt')].map((n) => n.textContent)).toEqual(['Name', 'Age']);
		expect([...dl.querySelectorAll('dd')].map((n) => n.textContent)).toEqual(['Ada', '36']);
	});

	it('renders children for custom markup', () => {
		render(DescriptionList, { children: html('<div><dt>Custom</dt><dd>Value</dd></div>'), 'data-testid': 'dl' });
		expect(screen.getByTestId('dl').querySelector('dt')).toHaveTextContent('Custom');
	});

	it('defaults to vertical layout', () => {
		render(DescriptionList, { items, 'data-testid': 'dl' });
		const dl = screen.getByTestId('dl');
		expect(dl).toHaveAttribute('data-layout', 'vertical');
		expect(dl.querySelector('div')).not.toHaveClass('sm:grid');
	});

	it('horizontal layout puts term and description side by side from sm', () => {
		render(DescriptionList, { items, layout: 'horizontal', 'data-testid': 'dl' });
		const dl = screen.getByTestId('dl');
		expect(dl).toHaveAttribute('data-layout', 'horizontal');
		expect(dl.querySelector('div')).toHaveClass('sm:grid', 'sm:grid-cols-3');
		expect(dl.querySelector('dd')).toHaveClass('sm:col-span-2');
	});

	it('merges class', () => {
		render(DescriptionList, { items, class: 'text-xs', 'data-testid': 'dl' });
		expect(screen.getByTestId('dl')).toHaveClass('text-xs');
		expect(screen.getByTestId('dl')).not.toHaveClass('text-sm');
	});
});
