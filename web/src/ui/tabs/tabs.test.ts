import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import TabsHarness from './TabsHarness.svelte';

afterEach(cleanup);

describe('Tabs', () => {
	it('exposes tablist/tab/tabpanel roles and selects the initial tab', () => {
		render(TabsHarness);
		expect(screen.getByRole('tablist', { name: 'Sections' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'false');
		expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel alpha');
	});

	it('moves selection with ArrowRight and skips disabled tabs', async () => {
		render(TabsHarness);
		const alpha = screen.getByRole('tab', { name: 'Alpha' });
		alpha.focus();
		await fireEvent.keyDown(alpha, { key: 'ArrowRight' });
		await waitFor(() =>
			expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true')
		);
		expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel beta');
		const beta = screen.getByRole('tab', { name: 'Beta' });
		await fireEvent.keyDown(beta, { key: 'ArrowRight' });
		await waitFor(() =>
			expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
		);
	});

	it('selects a tab on click', async () => {
		render(TabsHarness);
		await fireEvent.click(screen.getByRole('tab', { name: 'Beta' }));
		expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
	});
});
