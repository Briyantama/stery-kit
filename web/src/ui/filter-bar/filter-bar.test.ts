import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import FilterBar from './FilterBar.svelte';

afterEach(cleanup);

const snip = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('FilterBar', () => {
	it('renders search, filters and actions inside a search landmark', () => {
		render(FilterBar, {
			search: snip('<input aria-label="Search" />'),
			filters: snip('<button>Status</button>'),
			actions: snip('<button>Export</button>')
		});
		const region = screen.getByRole('search');
		expect(region).toContainElement(screen.getByLabelText('Search'));
		expect(region).toContainElement(screen.getByRole('button', { name: 'Status' }));
		expect(region).toContainElement(screen.getByRole('button', { name: 'Export' }));
	});

	it('only renders the slots provided', () => {
		render(FilterBar, { filters: snip('<button>Status</button>') });
		expect(screen.getByRole('search').children).toHaveLength(1);
	});

	it('wraps and merges caller classes, spreading rest attributes', () => {
		render(FilterBar, { class: 'gap-8', 'data-testid': 'fb' });
		const el = screen.getByTestId('fb');
		expect(el).toHaveClass('flex', 'flex-wrap', 'gap-8');
		expect(el).not.toHaveClass('gap-2');
	});
});
