import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { Button, ButtonGroup, buttonVariants } from './index';

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('Button', () => {
	it('renders a button with type=button by default', () => {
		render(Button, { children: text('Save') });
		const btn = screen.getByRole('button', { name: 'Save' });
		expect(btn).toHaveAttribute('type', 'button');
		expect(btn).toHaveClass('bg-primary');
	});

	it('applies variant and size classes and lets caller class win', () => {
		render(Button, { variant: 'destructive', size: 'lg', class: 'h-20', children: text('Delete') });
		const btn = screen.getByRole('button');
		expect(btn).toHaveClass('bg-destructive', 'h-20');
		expect(btn).not.toHaveClass('h-12');
	});

	it('buttonVariants exposes variant classes', () => {
		expect(buttonVariants({ variant: 'outline', size: 'icon' })).toContain('border-input');
		expect(buttonVariants({ size: 'icon' })).toContain('size-10');
	});

	it('forwards submit type and rest attributes', () => {
		render(Button, { type: 'submit', 'aria-label': 'Go', children: text('Go') });
		expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
	});

	it('calls onclick', async () => {
		const onclick = vi.fn();
		render(Button, { onclick, children: text('Go') });
		await fireEvent.click(screen.getByRole('button'));
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('is disabled when disabled', async () => {
		const onclick = vi.fn();
		render(Button, { disabled: true, onclick, children: text('Go') });
		const btn = screen.getByRole('button');
		expect(btn).toBeDisabled();
		btn.click(); // a real activation; synthetic dispatchEvent would bypass the disabled check
		expect(onclick).not.toHaveBeenCalled();
	});

	it('loading shows a spinner, sets aria-busy and disables', () => {
		render(Button, { loading: true, children: text('Save') });
		const btn = screen.getByRole('button');
		expect(btn).toHaveAttribute('aria-busy', 'true');
		expect(btn).toBeDisabled();
		expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
	});

	it('renders an anchor when href is set', () => {
		render(Button, { href: '/home', children: text('Home') });
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link.tagName).toBe('A');
		expect(link).toHaveAttribute('href', '/home');
		expect(link).not.toHaveAttribute('aria-disabled');
	});

	it('anchor is aria-disabled and has no href when disabled', () => {
		render(Button, { href: '/home', disabled: true, children: text('Home') });
		const link = screen.getByRole('link', { name: 'Home' });
		expect(link).toHaveAttribute('aria-disabled', 'true');
		expect(link).not.toHaveAttribute('href');
		expect(link).toHaveAttribute('tabindex', '-1');
	});

	it('anchor does not fire onclick while disabled or loading, but does when active', async () => {
		const onclick = vi.fn();
		const { unmount } = render(Button, { href: '/home', disabled: true, onclick, children: text('Home') });
		await fireEvent.click(screen.getByRole('link', { name: 'Home' }));
		unmount();
		const loading = render(Button, { href: '/home', loading: true, onclick, children: text('Home') });
		await fireEvent.click(screen.getByRole('link', { name: 'Home' }));
		expect(onclick).not.toHaveBeenCalled();
		loading.unmount();
		render(Button, { href: '/home', onclick, children: text('Home') });
		await fireEvent.click(screen.getByRole('link', { name: 'Home' }));
		expect(onclick).toHaveBeenCalledOnce();
	});
});

describe('ButtonGroup', () => {
	it('renders role=group and merges class', () => {
		render(ButtonGroup, { 'aria-label': 'Actions', class: 'gap-4', children: text('x') });
		const group = screen.getByRole('group', { name: 'Actions' });
		expect(group).toHaveClass('inline-flex', 'gap-4');
	});
});
