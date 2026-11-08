import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import Container from './Container.svelte';

afterEach(cleanup);

const children = createRawSnippet(() => ({ render: () => '<span>content</span>' }));

describe('Container', () => {
	it('renders children with the default xl width', () => {
		const { container, getByText } = render(Container, { children });
		expect(getByText('content')).toBeInTheDocument();
		expect(container.firstElementChild).toHaveClass('max-w-screen-xl', 'mx-auto', 'w-full');
	});

	it.each([
		['sm', 'max-w-screen-sm'],
		['md', 'max-w-screen-md'],
		['lg', 'max-w-screen-lg'],
		['full', 'max-w-none']
	] as const)('applies size %s', (size, cls) => {
		const { container } = render(Container, { size });
		expect(container.firstElementChild).toHaveClass(cls);
	});

	it('has responsive padding', () => {
		const { container } = render(Container);
		expect(container.firstElementChild).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
	});

	it('merges class so caller overrides win and spreads rest attributes', () => {
		const { container } = render(Container, { class: 'px-0', 'data-testid': 'c', id: 'x' });
		const el = container.firstElementChild!;
		expect(el).toHaveClass('px-0');
		expect(el).not.toHaveClass('px-4');
		expect(el).toHaveAttribute('data-testid', 'c');
		expect(el).toHaveAttribute('id', 'x');
	});
});
