import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Fixture from './radio-group.fixture.svelte';

describe('RadioGroup', () => {
	it('renders a radiogroup with labelled radios', () => {
		render(Fixture, {});
		expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument();
		expect(screen.getAllByRole('radio')).toHaveLength(3);
		expect(screen.getByRole('radio', { name: 'Pro' })).toHaveAttribute('aria-checked', 'false');
	});

	it('reflects the initial value', () => {
		render(Fixture, { value: 'pro' });
		expect(screen.getByRole('radio', { name: 'Pro' })).toHaveAttribute('aria-checked', 'true');
		expect(screen.getByRole('radio', { name: 'Free' })).toHaveAttribute('aria-checked', 'false');
	});

	it('selects on click, updates the bound value and calls onValueChange', async () => {
		const onValueChange = vi.fn();
		render(Fixture, { onValueChange });
		await fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
		expect(screen.getByRole('radio', { name: 'Free' })).toHaveAttribute('aria-checked', 'true');
		expect(screen.getByTestId('value')).toHaveTextContent('free');
		expect(onValueChange).toHaveBeenCalledWith('free');
	});

	it('only one radio is checked at a time', async () => {
		render(Fixture, { value: 'free' });
		await fireEvent.click(screen.getByRole('radio', { name: 'Pro' }));
		expect(screen.getByRole('radio', { name: 'Free' })).toHaveAttribute('aria-checked', 'false');
		expect(screen.getByRole('radio', { name: 'Pro' })).toHaveAttribute('aria-checked', 'true');
	});

	it('does not select a disabled item', async () => {
		render(Fixture, { disabledOption: true });
		const team = screen.getByRole('radio', { name: 'Team' });
		expect(team).toBeDisabled();
		await fireEvent.click(team);
		expect(team).toHaveAttribute('aria-checked', 'false');
	});

	it('disabled group disables every radio', () => {
		render(Fixture, { disabled: true });
		for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
	});
});
