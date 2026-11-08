import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import Breadcrumbs from './Breadcrumbs.svelte';

afterEach(cleanup);

const items = [{ label: 'Home', href: '/' }, { label: 'Staff', href: '/staff' }, { label: 'Ada' }];

describe('Breadcrumbs', () => {
	it('renders a Breadcrumb nav with a list of items', () => {
		render(Breadcrumbs, { items });
		expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
		expect(screen.getAllByRole('listitem')).toHaveLength(3);
	});

	it('links items that have an href', () => {
		render(Breadcrumbs, { items });
		expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
		expect(screen.getByRole('link', { name: 'Staff' })).toHaveAttribute('href', '/staff');
	});

	it('marks only the last item as the current page and does not link it', () => {
		render(Breadcrumbs, { items: [...items.slice(0, 2), { label: 'Ada', href: '/ada' }] });
		const current = screen.getByText('Ada');
		expect(current).toHaveAttribute('aria-current', 'page');
		expect(screen.queryByRole('link', { name: 'Ada' })).not.toBeInTheDocument();
		expect(screen.getByText('Home')).not.toHaveAttribute('aria-current');
	});

	it('merges class and spreads rest attributes onto the nav', () => {
		render(Breadcrumbs, { items, class: 'custom', 'data-testid': 'bc' });
		expect(screen.getByTestId('bc')).toHaveClass('custom');
	});
});
