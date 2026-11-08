import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput } from './index';

describe('SearchInput', () => {
	it('renders a searchbox and no clear button when empty', () => {
		render(SearchInput, { 'aria-label': 'Find' });
		expect(screen.getByRole('searchbox', { name: 'Find' })).toHaveAttribute('type', 'search');
		expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
	});

	it('shows a clear button with aria-label when it has a value', () => {
		render(SearchInput, { value: 'abc', 'aria-label': 'Find' });
		expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
	});

	it('uses a custom clear label', () => {
		render(SearchInput, { value: 'abc', clearLabel: 'Reset', 'aria-label': 'Find' });
		expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
	});

	it('clear empties the value, focuses the input and calls onsearch', async () => {
		const onsearch = vi.fn();
		render(SearchInput, { value: 'abc', onsearch, 'aria-label': 'Find' });
		const input = screen.getByRole('searchbox') as HTMLInputElement;
		await fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
		expect(input.value).toBe('');
		expect(input).toHaveFocus();
		expect(onsearch).toHaveBeenCalledWith('');
		expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
	});

	it('calls onsearch with the value on Enter only', async () => {
		const onsearch = vi.fn();
		render(SearchInput, { onsearch, 'aria-label': 'Find' });
		const input = screen.getByRole('searchbox') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: 'cats' } });
		await fireEvent.keyDown(input, { key: 'a' });
		expect(onsearch).not.toHaveBeenCalled();
		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(onsearch).toHaveBeenCalledWith('cats');
	});

	it('still calls a caller onkeydown', async () => {
		const onkeydown = vi.fn();
		render(SearchInput, { onkeydown, 'aria-label': 'Find' });
		await fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'x' });
		expect(onkeydown).toHaveBeenCalledOnce();
	});

	it('invalid sets aria-invalid; disabled hides the clear button', () => {
		render(SearchInput, { invalid: true, disabled: true, value: 'abc', 'aria-label': 'Find' });
		const input = screen.getByRole('searchbox');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toBeDisabled();
		expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
	});
});
