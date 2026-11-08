export type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
	return value instanceof Date ? value : new Date(value);
}

export interface CurrencyOptions {
	currency?: string;
	locale?: string;
}

/** Formats a money amount. IDR has no minor units by default; pass another currency for decimals. */
export function formatCurrency(
	amount: number,
	{ currency = 'IDR', locale = 'id-ID' }: CurrencyOptions = {}
): string {
	return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatNumber(
	value: number,
	{ locale = 'id-ID', ...options }: Intl.NumberFormatOptions & { locale?: string } = {}
): string {
	return new Intl.NumberFormat(locale, options).format(value);
}

export interface DateOptions {
	locale?: string;
	dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
	timeZone?: string;
}

export function formatDate(
	date: DateInput,
	{ locale = 'id-ID', dateStyle = 'medium', timeZone }: DateOptions = {}
): string {
	return new Intl.DateTimeFormat(locale, { dateStyle, timeZone }).format(toDate(date));
}

export interface DateTimeOptions extends DateOptions {
	timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
}

export function formatDateTime(
	date: DateInput,
	{ locale = 'id-ID', dateStyle = 'medium', timeStyle = 'short', timeZone }: DateTimeOptions = {}
): string {
	return new Intl.DateTimeFormat(locale, { dateStyle, timeStyle, timeZone }).format(toDate(date));
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 365 * 24 * 3600],
	['month', 30 * 24 * 3600],
	['week', 7 * 24 * 3600],
	['day', 24 * 3600],
	['hour', 3600],
	['minute', 60]
];

/** "3 hours ago" / "in 2 days" relative to `now`. Differences under a minute use seconds. */
export function formatRelativeTime(
	date: DateInput,
	now: DateInput = new Date(),
	locale = 'id-ID'
): string {
	const seconds = Math.round((toDate(date).getTime() - toDate(now).getTime()) / 1000);
	const abs = Math.abs(seconds);
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	for (const [unit, size] of UNITS) {
		if (abs >= size) return rtf.format(Math.trunc(seconds / size), unit);
	}
	return rtf.format(seconds, 'second');
}

/** First letter of the first and last word, uppercased: "ayu lestari dewi" -> "AD". */
export function initials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return '';
	const first = words[0]!;
	const last = words.length > 1 ? words[words.length - 1]! : '';
	return (Array.from(first)[0]! + (last ? Array.from(last)[0]! : '')).toUpperCase();
}
