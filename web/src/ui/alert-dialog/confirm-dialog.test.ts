import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import ConfirmDialog from './ConfirmDialog.svelte';

afterEach(cleanup);

describe('ConfirmDialog', () => {
	it('renders an alertdialog with title, description and labels', async () => {
		render(ConfirmDialog, {
			open: true,
			title: 'Delete record',
			description: 'This cannot be undone.',
			confirmLabel: 'Delete',
			cancelLabel: 'Keep'
		});
		const dialog = await screen.findByRole('alertdialog');
		expect(dialog).toHaveAccessibleName('Delete record');
		expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
	});

	it('uses the destructive tone for the confirm button', async () => {
		render(ConfirmDialog, { open: true, title: 'Delete', tone: 'destructive' });
		expect(await screen.findByRole('button', { name: 'Confirm' })).toHaveClass('bg-destructive');
	});

	it('shows a loading state while onconfirm is pending, then closes', async () => {
		let resolve!: () => void;
		const onconfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)));
		render(ConfirmDialog, { open: true, title: 'Go', onconfirm });
		const confirm = await screen.findByRole('button', { name: 'Confirm' });
		await fireEvent.click(confirm);
		expect(onconfirm).toHaveBeenCalledOnce();
		expect(confirm).toBeDisabled();
		expect(confirm).toHaveAttribute('aria-busy', 'true');
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
		resolve();
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
	});

	it('calls oncancel and closes on cancel', async () => {
		const oncancel = vi.fn();
		render(ConfirmDialog, { open: true, title: 'Go', oncancel });
		await fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
		expect(oncancel).toHaveBeenCalledOnce();
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
	});
});
