import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import AppShell from './AppShell.svelte';

afterEach(cleanup);

const snip = (html: string) => createRawSnippet(() => ({ render: () => html }));

const props = {
	sidebar: snip('<a href="/x">Nav link</a>'),
	header: snip('<span>Header</span>'),
	children: snip('<p>Body</p>')
};

describe('AppShell', () => {
	it('renders header, main and sidebar slots', () => {
		render(AppShell, props);
		expect(screen.getByText('Header')).toBeInTheDocument();
		expect(screen.getByRole('main')).toContainElement(screen.getByText('Body'));
		expect(screen.getByRole('complementary', { hidden: true })).toContainElement(
			screen.getByRole('link', { name: 'Nav link', hidden: true })
		);
	});

	it('has a skip link targeting the main region', () => {
		render(AppShell, props);
		expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main');
		expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
	});

	it('toggle exposes aria-expanded and aria-controls and opens the drawer', async () => {
		render(AppShell, props);
		const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
		const aside = screen.getByRole('complementary', { hidden: true });
		expect(toggle).toHaveAttribute('aria-controls', aside.id);
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
		expect(aside).toHaveClass('invisible');
		await fireEvent.click(toggle);
		expect(toggle).toHaveAttribute('aria-expanded', 'true');
		expect(aside).toHaveAttribute('data-open', 'true');
		expect(aside).not.toHaveClass('invisible');
	});

	it('closes on Escape, backdrop click, and sidebar link click', async () => {
		render(AppShell, { ...props, open: true });
		const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(toggle).toHaveAttribute('aria-expanded', 'false');

		await fireEvent.click(toggle);
		await fireEvent.click(screen.getByTestId('shell-backdrop'));
		expect(toggle).toHaveAttribute('aria-expanded', 'false');

		await fireEvent.click(toggle);
		await fireEvent.click(screen.getByRole('link', { name: 'Nav link' }));
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
	});

	it('omits the sidebar and toggle when no sidebar snippet is given', () => {
		render(AppShell, { children: props.children });
		expect(screen.queryByRole('button', { name: 'Toggle navigation' })).toBeNull();
		expect(screen.queryByRole('complementary', { hidden: true })).toBeNull();
		expect(screen.getByRole('main')).toBeInTheDocument();
	});

	it('merges class', () => {
		const { container } = render(AppShell, { ...props, class: 'bg-muted' });
		expect(container.firstElementChild).toHaveClass('bg-muted');
		expect(container.firstElementChild).not.toHaveClass('bg-background');
	});
});
