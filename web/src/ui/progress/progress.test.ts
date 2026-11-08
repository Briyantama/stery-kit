import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { Progress } from './index';

afterEach(cleanup);

const bar = () => screen.getByRole('progressbar').firstElementChild as HTMLElement;

describe('Progress', () => {
	it('exposes progressbar ARIA values', () => {
		render(Progress, { value: 40, max: 200, 'aria-label': 'Upload' });
		const el = screen.getByRole('progressbar', { name: 'Upload' });
		expect(el).toHaveAttribute('aria-valuemin', '0');
		expect(el).toHaveAttribute('aria-valuemax', '200');
		expect(el).toHaveAttribute('aria-valuenow', '40');
		expect(bar().style.width).toBe('20%');
	});

	it('defaults max to 100', () => {
		render(Progress, { value: 25 });
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
		expect(bar().style.width).toBe('25%');
	});

	it('clamps out-of-range values', () => {
		render(Progress, { value: 150 });
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
		expect(bar().style.width).toBe('100%');
		cleanup();
		render(Progress, { value: -5 });
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
	});

	it('omits aria-valuenow when indeterminate', () => {
		render(Progress, { indeterminate: true });
		const el = screen.getByRole('progressbar');
		expect(el).not.toHaveAttribute('aria-valuenow');
		expect(el).toHaveAttribute('data-state', 'indeterminate');
		expect(bar()).toHaveClass('animate-pulse', 'motion-reduce:animate-none');
	});

	it.each(['info', 'success', 'warning', 'destructive'] as const)('applies %s tone', (tone) => {
		render(Progress, { value: 10, tone });
		expect(bar()).toHaveClass(`bg-${tone}`);
	});

	it('defaults to primary tone and md size, and merges class', () => {
		render(Progress, { value: 10, class: 'h-6' });
		expect(bar()).toHaveClass('bg-primary');
		expect(screen.getByRole('progressbar')).toHaveClass('h-6');
		expect(screen.getByRole('progressbar')).not.toHaveClass('h-2.5');
	});
});
