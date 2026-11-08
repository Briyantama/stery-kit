import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { Avatar, AvatarGroup, getInitials } from './index';

afterEach(cleanup);

describe('getInitials', () => {
	it.each([
		['Ada Lovelace', 'AL'],
		['ada', 'A'],
		['  grace   brewster   hopper ', 'GH'],
		['', '?']
	])('%j -> %s', (input, expected) => {
		expect(getInitials(input)).toBe(expected);
	});
});

describe('Avatar', () => {
	it('renders the image with alt text', () => {
		render(Avatar, { src: '/a.png', alt: 'Ada' });
		const img = screen.getByRole('img', { name: 'Ada' });
		expect(img.tagName).toBe('IMG');
		expect(img).toHaveAttribute('src', '/a.png');
	});

	it('falls back to initials from name with an accessible label', () => {
		render(Avatar, { name: 'Ada Lovelace' });
		const el = screen.getByRole('img', { name: 'Ada Lovelace' });
		expect(el).toHaveTextContent('AL');
	});

	it('falls back to initials when the image fails to load', async () => {
		render(Avatar, { src: '/broken.png', name: 'Ada Lovelace' });
		await fireEvent.error(screen.getByRole('img', { name: 'Ada Lovelace' }));
		const el = screen.getByRole('img', { name: 'Ada Lovelace' });
		expect(el.tagName).toBe('SPAN');
		expect(el).toHaveTextContent('AL');
	});

	it('shows ? when nothing is known and prefers explicit fallback text', () => {
		render(Avatar, { 'data-testid': 'a' });
		expect(screen.getByTestId('a')).toHaveTextContent('?');
		cleanup();
		render(Avatar, { fallback: '+3', 'data-testid': 'a' });
		expect(screen.getByTestId('a')).toHaveTextContent('+3');
	});

	it.each([
		['sm', 'size-8'],
		['md', 'size-10'],
		['lg', 'size-14']
	] as const)('applies size %s', (size, cls) => {
		render(Avatar, { size, name: 'A B', 'data-testid': 'a' });
		expect(screen.getByTestId('a')).toHaveClass(cls);
	});
});

describe('AvatarGroup', () => {
	const items = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Torvalds', 'Tim Berners'].map((name) => ({ name }));

	it('shows up to max avatars plus an overflow count', () => {
		render(AvatarGroup, { items, max: 3 });
		const group = screen.getByRole('group');
		expect(group.children).toHaveLength(4);
		expect(screen.getByRole('img', { name: '2 more' })).toHaveTextContent('+2');
	});

	it('has no overflow avatar when everything fits', () => {
		render(AvatarGroup, { items: items.slice(0, 2), max: 4 });
		expect(screen.getByRole('group').children).toHaveLength(2);
		expect(screen.queryByText(/^\+/)).toBeNull();
	});

	it('defaults max to 4', () => {
		render(AvatarGroup, { items });
		expect(screen.getByRole('group').children).toHaveLength(5);
		expect(screen.getByRole('img', { name: '1 more' })).toBeInTheDocument();
	});
});
