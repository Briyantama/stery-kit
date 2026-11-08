import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import Pagination from './Pagination.svelte';
import { getPageItems } from './pages';

afterEach(cleanup);

describe('getPageItems', () => {
	it('lists every page when they fit', () => {
		expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
	});

	it('collapses the far end near the start', () => {
		expect(getPageItems(1, 10)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 10]);
	});

	it('collapses both ends in the middle', () => {
		expect(getPageItems(5, 10)).toEqual([1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10]);
	});

	it('collapses the near end close to the last page', () => {
		expect(getPageItems(10, 10)).toEqual([1, 'ellipsis-start', 6, 7, 8, 9, 10]);
	});
});

describe('Pagination', () => {
	it('exposes a labelled nav and marks the current page', () => {
		render(Pagination, { page: 3, pageCount: 5 });
		expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('button', { name: 'Page 2' })).not.toHaveAttribute('aria-current');
	});

	it('disables previous on the first page and next on the last', async () => {
		render(Pagination, { page: 1, pageCount: 3 });
		expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
		await fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
		expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
		expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
	});

	it('calls onchange with the new page and updates the current page', async () => {
		const onchange = vi.fn();
		render(Pagination, { page: 1, pageCount: 5, onchange });
		await fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
		expect(onchange).toHaveBeenCalledWith(2);
		expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
		await fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
		expect(onchange).toHaveBeenLastCalledWith(1);
	});

	it('does not call onchange when the current page is clicked', async () => {
		const onchange = vi.fn();
		render(Pagination, { page: 2, pageCount: 5, onchange });
		await fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
		expect(onchange).not.toHaveBeenCalled();
	});

	it('derives the page count from total and perPage', () => {
		render(Pagination, { page: 1, total: 95, perPage: 10 });
		expect(screen.getByRole('button', { name: 'Page 10' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Page 11' })).not.toBeInTheDocument();
	});

	it('renders an ellipsis for collapsed ranges', () => {
		render(Pagination, { page: 1, pageCount: 20 });
		expect(screen.getByText('...')).toHaveAttribute('aria-hidden', 'true');
	});

	it('merges class and spreads rest attributes onto the nav', () => {
		render(Pagination, { page: 1, pageCount: 2, class: 'custom', 'data-testid': 'pg' });
		expect(screen.getByTestId('pg')).toHaveClass('custom');
	});
});
