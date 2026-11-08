import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import SidebarNav from './SidebarNav.svelte';

afterEach(cleanup);

const icon = createRawSnippet(() => ({ render: () => '<svg data-testid="icon"></svg>' }));

describe('SidebarNav', () => {
	const items = [
		{ label: 'Dashboard', href: '/', active: true, icon },
		{ label: 'Orders', href: '/orders', badge: '3' }
	];

	it('renders links and marks only the active one as current page', () => {
		render(SidebarNav, { items });
		expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: /Orders/ })).not.toHaveAttribute('aria-current');
	});

	it('renders icon and badge', () => {
		render(SidebarNav, { items });
		expect(screen.getByTestId('icon')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
	});

	it('is a labelled navigation landmark', () => {
		render(SidebarNav, { items, 'aria-label': 'Admin' });
		expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument();
	});

	it('renders groups with headings and labelled lists', () => {
		render(SidebarNav, {
			groups: [
				{ label: 'Sales', items: [{ label: 'Orders', href: '/orders' }] },
				{ items: [{ label: 'Settings', href: '/settings' }] }
			]
		});
		expect(screen.getByText('Sales')).toBeInTheDocument();
		expect(screen.getByRole('list', { name: 'Sales' })).toContainElement(
			screen.getByRole('link', { name: 'Orders' })
		);
		expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
	});

	it('merges class', () => {
		render(SidebarNav, { items, class: 'gap-0' });
		expect(screen.getByRole('navigation')).toHaveClass('gap-0');
		expect(screen.getByRole('navigation')).not.toHaveClass('gap-4');
	});
});
