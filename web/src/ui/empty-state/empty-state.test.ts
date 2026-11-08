import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { EmptyState } from './index';

afterEach(cleanup);

const html = (value: string) => createRawSnippet(() => ({ render: () => value }));

describe('EmptyState', () => {
	it('renders the title as an h3 by default and the description', () => {
		render(EmptyState, { title: 'No orders', description: 'Create one to get started' });
		expect(screen.getByRole('heading', { level: 3, name: 'No orders' })).toBeInTheDocument();
		expect(screen.getByText('Create one to get started')).toBeInTheDocument();
	});

	it('honours the heading level', () => {
		render(EmptyState, { title: 'None', level: 2 });
		expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
	});

	it('renders icon and action snippets', () => {
		render(EmptyState, {
			title: 'None',
			icon: html('<svg data-testid="icon"></svg>'),
			action: html('<button>Add</button>')
		});
		expect(screen.getByTestId('icon')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
	});

	it('omits optional parts when absent', () => {
		render(EmptyState, { title: 'None', 'data-testid': 'e' });
		expect(screen.getByTestId('e').querySelector('p')).toBeNull();
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('merges class and attributes', () => {
		render(EmptyState, { title: 'None', class: 'py-4', 'data-testid': 'e' });
		expect(screen.getByTestId('e')).toHaveClass('py-4');
		expect(screen.getByTestId('e')).not.toHaveClass('py-12');
	});
});
