import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import Navbar from './Navbar.svelte';

afterEach(cleanup);

const snip = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('Navbar', () => {
	it('renders a banner with brand, nav and actions', () => {
		render(Navbar, {
			brand: snip('<span>Stery</span>'),
			nav: snip('<a href="/a">Home</a>'),
			actions: snip('<button>Sign out</button>')
		});
		expect(screen.getByRole('banner')).toBeInTheDocument();
		expect(screen.getByText('Stery')).toBeInTheDocument();
		expect(screen.getByRole('navigation', { name: 'Primary' })).toContainElement(
			screen.getByRole('link', { name: 'Home' })
		);
		expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
	});

	it('omits the nav landmark when no nav snippet is given', () => {
		render(Navbar, { brand: snip('<span>Stery</span>') });
		expect(screen.queryByRole('navigation')).toBeNull();
	});

	it('uses a custom nav label', () => {
		render(Navbar, { nav: snip('<a href="/">x</a>'), navLabel: 'Main menu' });
		expect(screen.getByRole('navigation', { name: 'Main menu' })).toBeInTheDocument();
	});

	it('applies size and sticky variants and merges class', () => {
		render(Navbar, { size: 'lg', sticky: true, class: 'h-20' });
		const el = screen.getByRole('banner');
		expect(el).toHaveClass('sticky', 'z-sticky', 'h-20');
		expect(el).not.toHaveClass('h-16');
	});
});
