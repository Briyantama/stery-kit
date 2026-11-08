import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { StatCard } from './index';

afterEach(cleanup);

const html = (value: string) => createRawSnippet(() => ({ render: () => value }));

describe('StatCard', () => {
	it('renders label and value', () => {
		render(StatCard, { label: 'Revenue', value: '$1,200' });
		expect(screen.getByText('Revenue')).toBeInTheDocument();
		expect(screen.getByText('$1,200')).toBeInTheDocument();
	});

	it('omits the delta when not given', () => {
		render(StatCard, { label: 'x', value: 1, 'data-testid': 's' });
		expect(screen.getByTestId('s').querySelector('[data-trend]')).toBeNull();
	});

	it.each([
		['up', 'text-success', 'Increase'],
		['down', 'text-destructive', 'Decrease'],
		['flat', 'text-muted-foreground', 'No change']
	] as const)('trend %s picks default tone and accessible text', (trend, cls, sr) => {
		render(StatCard, { label: 'x', value: 1, delta: '5%', trend });
		const delta = document.querySelector('[data-trend]') as HTMLElement;
		expect(delta).toHaveClass(cls);
		expect(delta).toHaveTextContent(`${sr}:`);
		expect(delta).toHaveTextContent('5%');
		cleanup();
	});

	it('lets tone override the trend colour', () => {
		render(StatCard, { label: 'Cost', value: 1, delta: '+3%', trend: 'up', tone: 'destructive' });
		expect(document.querySelector('[data-trend]')).toHaveClass('text-destructive');
	});

	it('renders hint and icon', () => {
		render(StatCard, { label: 'x', value: 1, hint: 'vs last month', icon: html('<svg data-testid="i"></svg>') });
		expect(screen.getByText('vs last month')).toBeInTheDocument();
		expect(screen.getByTestId('i')).toBeInTheDocument();
	});
});
