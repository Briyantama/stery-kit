import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import DialogHarness from './DialogHarness.svelte';

afterEach(cleanup);

describe('Dialog', () => {
	it('is closed until the trigger is clicked', async () => {
		render(DialogHarness);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		await fireEvent.click(screen.getByRole('button', { name: 'Open' }));
		const dialog = await screen.findByRole('dialog');
		expect(dialog).toHaveAccessibleName('Edit profile');
		expect(dialog).toHaveAccessibleDescription('Change your details.');
	});

	it('closes on Escape', async () => {
		render(DialogHarness, { open: true });
		await screen.findByRole('dialog');
		await fireEvent.keyDown(document.body, { key: 'Escape' });
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	});

	it('closes with the labelled close button', async () => {
		render(DialogHarness, { open: true });
		await fireEvent.click(await screen.findByRole('button', { name: 'Close' }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	});

	it('applies the size variant', async () => {
		render(DialogHarness, { open: true, size: 'xl' });
		expect(await screen.findByRole('dialog')).toHaveClass('max-w-2xl');
	});
});
