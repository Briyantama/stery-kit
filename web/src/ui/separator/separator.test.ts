import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { Separator } from './index';

afterEach(cleanup);

describe('Separator', () => {
	it('is a horizontal separator by default', () => {
		render(Separator);
		const el = screen.getByRole('separator');
		expect(el).toHaveAttribute('aria-orientation', 'horizontal');
		expect(el).toHaveClass('h-px', 'w-full');
	});

	it('supports vertical orientation', () => {
		render(Separator, { orientation: 'vertical' });
		const el = screen.getByRole('separator');
		expect(el).toHaveAttribute('aria-orientation', 'vertical');
		expect(el).toHaveClass('w-px');
	});

	it('decorative removes semantics', () => {
		render(Separator, { decorative: true, 'data-testid': 's' });
		const el = screen.getByTestId('s');
		expect(el).toHaveAttribute('role', 'none');
		expect(el).not.toHaveAttribute('aria-orientation');
		expect(screen.queryByRole('separator')).toBeNull();
	});

	it('merges class', () => {
		render(Separator, { class: 'bg-primary' });
		const el = screen.getByRole('separator');
		expect(el).toHaveClass('bg-primary');
		expect(el).not.toHaveClass('bg-border');
	});
});
