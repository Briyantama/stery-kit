import { describe, expect, it } from 'vitest';
import {
	formatCurrency,
	formatDate,
	formatDateTime,
	formatNumber,
	formatRelativeTime,
	initials
} from './format';

// Intl output uses non-breaking spaces; normalize before comparing.
const norm = (s: string) => s.replace(/\s/g, ' ');

describe('formatCurrency', () => {
	it('defaults to IDR / id-ID', () => {
		expect(norm(formatCurrency(1500000))).toBe('Rp 1.500.000');
	});
	it('honors currency and locale', () => {
		expect(norm(formatCurrency(12.5, { currency: 'USD', locale: 'en-US' }))).toBe('$12.50');
	});
});

describe('formatNumber', () => {
	it('groups digits per locale', () => {
		expect(formatNumber(1234567.5)).toBe('1.234.567,5');
		expect(formatNumber(1234567.5, { locale: 'en-US' })).toBe('1,234,567.5');
	});
	it('passes Intl options', () => {
		expect(formatNumber(0.256, { locale: 'en-US', style: 'percent' })).toBe('26%');
	});
});

describe('formatDate / formatDateTime', () => {
	const d = new Date('2026-03-05T14:30:00Z');
	it('formats the date in the given zone', () => {
		expect(formatDate(d, { locale: 'en-US', timeZone: 'UTC' })).toBe('Mar 5, 2026');
		expect(formatDate(d, { locale: 'en-US', dateStyle: 'short', timeZone: 'UTC' })).toBe('3/5/26');
	});
	it('accepts ISO strings and timestamps', () => {
		expect(formatDate('2026-03-05T14:30:00Z', { locale: 'en-US', timeZone: 'UTC' })).toBe(
			'Mar 5, 2026'
		);
		expect(formatDate(d.getTime(), { locale: 'en-US', timeZone: 'UTC' })).toBe('Mar 5, 2026');
	});
	it('includes time', () => {
		expect(norm(formatDateTime(d, { locale: 'en-US', timeZone: 'UTC' }))).toContain('2:30 PM');
	});
});

describe('formatRelativeTime', () => {
	const now = new Date('2026-03-05T12:00:00Z');
	const at = (ms: number) => new Date(now.getTime() + ms);
	const rel = (ms: number) => formatRelativeTime(at(ms), now, 'en');
	it('handles past and future across units', () => {
		expect(rel(-3 * 3600_000)).toBe('3 hours ago');
		expect(rel(2 * 86400_000)).toBe('in 2 days');
		expect(rel(-5 * 60_000)).toBe('5 minutes ago');
		expect(rel(-14 * 86400_000)).toBe('2 weeks ago');
	});
	it('uses seconds under a minute', () => {
		expect(rel(-30_000)).toBe('30 seconds ago');
		expect(rel(0)).toBe('now');
	});
});

describe('initials', () => {
	it('takes first and last word', () => {
		expect(initials('ayu lestari dewi')).toBe('AD');
		expect(initials('Budi Santoso')).toBe('BS');
	});
	it('handles single word, extra whitespace, and empty input', () => {
		expect(initials('  budi ')).toBe('B');
		expect(initials('   ')).toBe('');
		expect(initials('')).toBe('');
	});
});
