import { cleanup, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import Stack from './Stack.svelte';

afterEach(cleanup);

const children = createRawSnippet(() => ({ render: () => '<span>a</span>' }));

describe('Stack', () => {
	it('defaults to a column div with medium gap', () => {
		const { container } = render(Stack, { children });
		const el = container.firstElementChild!;
		expect(el.tagName).toBe('DIV');
		expect(el).toHaveClass('flex', 'flex-col', 'gap-4');
		expect(el).not.toHaveClass('flex-wrap');
	});

	it('applies direction, gap, align, justify and wrap', () => {
		const { container } = render(Stack, {
			direction: 'row',
			gap: 'lg',
			align: 'center',
			justify: 'between',
			wrap: true
		});
		expect(container.firstElementChild).toHaveClass(
			'flex-row',
			'gap-6',
			'items-center',
			'justify-between',
			'flex-wrap'
		);
	});

	it('renders the requested element', () => {
		const { container } = render(Stack, { as: 'ul', children });
		expect(container.firstElementChild!.tagName).toBe('UL');
	});

	it('merges class and spreads rest attributes', () => {
		const { container } = render(Stack, { class: 'gap-1', role: 'group', 'aria-label': 'g' });
		const el = container.firstElementChild!;
		expect(el).toHaveClass('gap-1');
		expect(el).not.toHaveClass('gap-4');
		expect(el).toHaveAttribute('role', 'group');
		expect(el).toHaveAttribute('aria-label', 'g');
	});
});
