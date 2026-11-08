import { beforeEach, describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY, theme } from './theme.svelte';

type Listener = (e: { matches: boolean }) => void;

function stubMatchMedia(initial: boolean) {
	const listeners = new Set<Listener>();
	const mq = {
		matches: initial,
		addEventListener: (_: string, l: Listener) => listeners.add(l),
		removeEventListener: (_: string, l: Listener) => listeners.delete(l)
	};
	vi.stubGlobal('matchMedia', () => mq);
	return {
		listeners,
		emit(matches: boolean) {
			mq.matches = matches;
			listeners.forEach((l) => l({ matches }));
		}
	};
}

const attr = () => document.documentElement.getAttribute('data-theme');

describe('theme', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
		theme.value = 'system';
	});

	it('setTheme applies data-theme and persists', () => {
		stubMatchMedia(false);
		theme.setTheme('dark');
		expect(theme.value).toBe('dark');
		expect(attr()).toBe('dark');
		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
	});

	it('init restores the stored choice', () => {
		stubMatchMedia(false);
		localStorage.setItem(THEME_STORAGE_KEY, 'dark');
		const stop = theme.init();
		expect(theme.value).toBe('dark');
		expect(attr()).toBe('dark');
		stop();
	});

	it('ignores invalid stored values', () => {
		stubMatchMedia(false);
		localStorage.setItem(THEME_STORAGE_KEY, 'purple');
		const stop = theme.init();
		expect(theme.value).toBe('system');
		expect(attr()).toBe('light');
		stop();
	});

	it('resolves system via matchMedia and follows changes', () => {
		const mm = stubMatchMedia(true);
		const stop = theme.init();
		expect(theme.resolved).toBe('dark');
		expect(attr()).toBe('dark');
		mm.emit(false);
		expect(theme.resolved).toBe('light');
		expect(attr()).toBe('light');
		stop();
		expect(mm.listeners.size).toBe(0);
	});

	it('explicit choice wins over the system preference', () => {
		stubMatchMedia(true);
		const stop = theme.init();
		theme.setTheme('light');
		expect(attr()).toBe('light');
		stop();
	});
});
