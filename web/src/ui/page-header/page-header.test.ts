import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { PageHeader } from './index';

afterEach(cleanup);

const html = (value: string) => createRawSnippet(() => ({ render: () => value }));

describe('PageHeader', () => {
	it('renders the title as h1 and the description', () => {
		render(PageHeader, { title: 'Orders', description: 'All orders' });
		expect(screen.getByRole('heading', { level: 1, name: 'Orders' })).toBeInTheDocument();
		expect(screen.getByText('All orders')).toBeInTheDocument();
	});

	it('renders breadcrumbs before the title and actions after', () => {
		render(PageHeader, {
			title: 'Orders',
			breadcrumbs: html('<nav aria-label="Breadcrumb">crumbs</nav>'),
			actions: html('<button>New</button>')
		});
		const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
		const h1 = screen.getByRole('heading', { level: 1 });
		const button = screen.getByRole('button', { name: 'New' });
		expect(nav.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(h1.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	it('omits optional regions when absent', () => {
		render(PageHeader, { title: 'Orders', 'data-testid': 'h' });
		const root = screen.getByTestId('h');
		expect(root.querySelector('p')).toBeNull();
		expect(root.children).toHaveLength(1);
	});

	it('stacks on mobile and goes horizontal from sm, with class merge', () => {
		render(PageHeader, { title: 'x', class: 'gap-2', 'data-testid': 'h' });
		const root = screen.getByTestId('h');
		expect(root).toHaveClass('flex-col', 'sm:flex-row', 'gap-2');
		expect(root).not.toHaveClass('gap-4');
		expect(root.tagName).toBe('HEADER');
	});
});
