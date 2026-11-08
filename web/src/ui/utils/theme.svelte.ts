export type Theme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'stery.theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function isTheme(value: unknown): value is Theme {
	return value === 'light' || value === 'dark' || value === 'system';
}

class ThemeStore {
	/** The user's choice. */
	value = $state<Theme>('system');
	/** Whether the OS currently prefers dark; only meaningful after `init()`. */
	#systemDark = $state(false);

	/** The theme actually applied: `light` or `dark`. */
	get resolved(): 'light' | 'dark' {
		if (this.value === 'system') return this.#systemDark ? 'dark' : 'light';
		return this.value;
	}

	/**
	 * Loads the stored choice, applies it and follows OS changes. Browser only: call from
	 * `onMount` (SSR-safe: nothing touches `window` at import). Returns a cleanup function.
	 */
	init(): () => void {
		if (typeof window === 'undefined') return () => {};
		try {
			const stored = localStorage.getItem(THEME_STORAGE_KEY);
			if (isTheme(stored)) this.value = stored;
		} catch {
			// storage blocked: keep the default
		}
		const mq = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
		this.#systemDark = mq?.matches ?? false;
		this.#apply();
		const onChange = (e: MediaQueryListEvent) => {
			this.#systemDark = e.matches;
			this.#apply();
		};
		mq?.addEventListener('change', onChange);
		return () => mq?.removeEventListener('change', onChange);
	}

	setTheme(next: Theme): void {
		this.value = next;
		if (typeof window === 'undefined') return;
		try {
			localStorage.setItem(THEME_STORAGE_KEY, next);
		} catch {
			// storage blocked: the choice still applies for this session
		}
		this.#apply();
	}

	#apply(): void {
		document.documentElement.setAttribute('data-theme', this.resolved);
	}
}

export const theme = new ThemeStore();
