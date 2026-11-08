import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { Skeleton } from './index';

afterEach(cleanup);

describe('Skeleton', () => {
	it('is hidden from assistive tech and pulses unless motion is reduced', () => {
		render(Skeleton, { 'data-testid': 's' });
		const el = screen.getByTestId('s');
		expect(el).toHaveAttribute('aria-hidden', 'true');
		expect(el).toHaveClass('animate-pulse', 'motion-reduce:animate-none');
	});

	it('merges caller classes so sizes can be set', () => {
		render(Skeleton, { class: 'h-4 w-24 rounded-full', 'data-testid': 's' });
		const el = screen.getByTestId('s');
		expect(el).toHaveClass('h-4', 'w-24', 'rounded-full');
		expect(el).not.toHaveClass('rounded-md');
	});
});
