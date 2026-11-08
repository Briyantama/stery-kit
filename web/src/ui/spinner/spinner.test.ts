import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { Spinner } from './index';

afterEach(cleanup);

describe('Spinner', () => {
	it('is a status with default Loading label', () => {
		render(Spinner);
		expect(screen.getByRole('status')).toHaveTextContent('Loading');
		expect(screen.getByText('Loading')).toHaveClass('sr-only');
	});

	it('accepts a custom label', () => {
		render(Spinner, { label: 'Saving' });
		expect(screen.getByRole('status')).toHaveTextContent('Saving');
	});

	it.each([
		['sm', 'size-4'],
		['md', 'size-6'],
		['lg', 'size-8']
	] as const)('applies size %s', (size, cls) => {
		render(Spinner, { size });
		expect(screen.getByRole('status')).toHaveClass(cls);
	});

	it('hides the svg from assistive tech and merges class', () => {
		render(Spinner, { class: 'text-primary' });
		const el = screen.getByRole('status');
		expect(el).toHaveClass('text-primary');
		expect(el.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
	});
});
