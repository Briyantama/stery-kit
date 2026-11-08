import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { Table, TableCaption, TableCell, TableEmpty, TableHead, TableLoading, TableRow } from './index';

afterEach(cleanup);

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));
const html = (value: string) => createRawSnippet(() => ({ render: () => value }));

describe('Table', () => {
	it('wraps the table in a horizontal scroll container', () => {
		render(Table, { children: html('<tbody><tr><td>cell</td></tr></tbody>'), 'aria-label': 'People' });
		const table = screen.getByRole('table', { name: 'People' });
		expect(table.parentElement).toHaveClass('overflow-x-auto');
		expect(screen.getByRole('cell')).toHaveTextContent('cell');
	});

	it('merges class onto the table and wrapperClass onto the wrapper', () => {
		render(Table, { class: 'text-xs', wrapperClass: 'max-h-40', 'aria-label': 't' });
		const table = screen.getByRole('table');
		expect(table).toHaveClass('text-xs');
		expect(table).not.toHaveClass('text-sm');
		expect(table.parentElement).toHaveClass('max-h-40');
	});

	it('renders a caption', () => {
		render(TableCaption, { children: text('Cap') });
		expect(document.querySelector('caption')).toHaveTextContent('Cap');
	});
});

describe('TableHead', () => {
	const th = () => document.querySelector('th') as HTMLElement;

	it('sets scope=col and omits aria-sort by default', () => {
		render(TableHead, { children: text('Name') });
		expect(th()).toHaveAttribute('scope', 'col');
		expect(th()).not.toHaveAttribute('aria-sort');
	});

	it.each([
		['asc', 'ascending'],
		['desc', 'descending'],
		['none', 'none']
	] as const)('maps sort=%s to aria-sort=%s', (sort, expected) => {
		render(TableHead, { sort, children: text('Name') });
		expect(th()).toHaveAttribute('aria-sort', expected);
		cleanup();
	});

	it('shows a decorative marker only when sorted', () => {
		render(TableHead, { sort: 'asc', children: text('Name') });
		expect(th().querySelector('[aria-hidden="true"]')).toBeInTheDocument();
		cleanup();
		render(TableHead, { sort: 'none', children: text('Name') });
		expect(th().querySelector('[aria-hidden="true"]')).toBeNull();
	});
});

describe('TableRow and TableCell', () => {
	it('marks selected rows', () => {
		render(TableRow, { selected: true, 'data-testid': 'r' });
		expect(screen.getByTestId('r')).not.toHaveAttribute('aria-selected');
		expect(screen.getByTestId('r')).toHaveAttribute('data-state', 'selected');
	});

	it('renders cell content and passes colspan through', () => {
		render(TableCell, { colspan: 2, children: text('v'), 'data-testid': 'c' });
		expect(screen.getByTestId('c')).toHaveTextContent('v');
		expect(screen.getByTestId('c')).toHaveAttribute('colspan', '2');
	});
});

describe('TableEmpty', () => {
	it('spans the given columns with a default message', () => {
		render(TableEmpty, { colspan: 4 });
		const td = document.querySelector('td') as HTMLElement;
		expect(td).toHaveAttribute('colspan', '4');
		expect(td).toHaveTextContent('No results');
	});

	it('renders a custom message', () => {
		render(TableEmpty, { colspan: 2, children: text('Nothing here') });
		expect(document.querySelector('td')).toHaveTextContent('Nothing here');
	});
});

describe('TableLoading', () => {
	it('renders rows x columns skeleton cells with one status label', () => {
		render(TableLoading, { rows: 2, columns: 3 });
		expect(document.querySelectorAll('tr')).toHaveLength(2);
		expect(document.querySelectorAll('td')).toHaveLength(6);
		expect(screen.getAllByRole('status')).toHaveLength(1);
		expect(screen.getByRole('status')).toHaveTextContent('Loading');
	});
});
