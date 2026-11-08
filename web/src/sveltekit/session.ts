import { error, json, type Cookies, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import type { Envelope } from '../api';

/**
 * Server-only session. The JWT lives in an HttpOnly cookie so it never reaches client JS; the
 * cookie value is the JSON of a Session. hooks.server.ts reads it to enforce the role at the edge
 * and the /api proxy reads it to inject the bearer token upstream.
 */
export interface Session {
	token: string;
	role: string;
	/** Only for products whose sessions are store-scoped (cashier). Display only. */
	storeId?: string;
}

/** Returns the session stored in a cookie value, or null when it is missing or malformed. */
export function parseSession(raw: string | undefined, requireStore = false): Session | null {
	if (!raw) return null;
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}
	if (typeof parsed !== 'object' || parsed === null) return null;
	const { token, role, storeId } = parsed as Partial<Session>;
	if (typeof token !== 'string' || typeof role !== 'string') return null;
	if (requireStore && typeof storeId !== 'string') return null;
	return typeof storeId === 'string' ? { token, role, storeId } : { token, role };
}

export interface SessionStoreOptions {
	cookie: string;
	/** Pass `!dev` from `$app/environment`. */
	secure: boolean;
	/** Sessions without a storeId are rejected. */
	requireStore?: boolean;
	path?: string;
	/** Seconds. Default 30 days, the refresh-token TTL. */
	maxAge?: number;
}

export interface SessionStore {
	cookie: string;
	requireStore: boolean;
	read: (cookies: Cookies) => Session | null;
	write: (cookies: Cookies, session: Session) => void;
	clear: (cookies: Cookies) => void;
}

export function createSessionStore(opts: SessionStoreOptions): SessionStore {
	const path = opts.path ?? '/';
	return {
		cookie: opts.cookie,
		requireStore: opts.requireStore ?? false,
		read: (cookies) => parseSession(cookies.get(opts.cookie), opts.requireStore),
		write: (cookies, session) =>
			cookies.set(opts.cookie, JSON.stringify(session), {
				path,
				httpOnly: true,
				sameSite: 'lax',
				secure: opts.secure,
				maxAge: opts.maxAge ?? 60 * 60 * 24 * 30
			}),
		clear: (cookies) => cookies.delete(opts.cookie, { path })
	};
}

export interface SessionHandlersOptions {
	/** Base URL of the Go API, without `/api/v1`. */
	upstream: () => string;
	store: SessionStore;
	/** Login is refused with 403 for any other role. */
	requiredRole: string;
	/** Default: `<requiredRole> access only.` */
	forbiddenMessage?: string;
}

interface LoginData {
	access_token?: string;
	claims?: { role?: string; store_id?: string };
}

const UPSTREAM_TIMEOUT_MS = 15_000;

/** The caller's address for `X-Forwarded-For`; undefined when the adapter cannot provide one (e.g. prerender). */
function clientIp(event: Pick<RequestEvent, 'getClientAddress'>): string | undefined {
	try {
		return event.getClientAddress();
	} catch {
		return undefined;
	}
}

/**
 * `POST` exchanges credentials for a session cookie (login via `${upstream}/api/v1/login`),
 * `DELETE` calls `${upstream}/api/v1/logout` best effort and clears the cookie.
 * Failures are SvelteKit `error()`s, so the response body is `{ message }`.
 */
export function createSessionHandlers(opts: SessionHandlersOptions): {
	POST: RequestHandler;
	DELETE: RequestHandler;
} {
	const { store, requiredRole } = opts;
	const forbidden = opts.forbiddenMessage ?? `${requiredRole} access only.`;
	// Client errors the login form can act on pass through; anything else is the gateway's fault.
	const PASSTHROUGH = new Set([400, 401, 403, 404, 409, 422, 429]);

	const logoutUpstream = async (token: string, ip?: string) => {
		try {
			await fetch(`${opts.upstream()}/api/v1/logout`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(ip && { 'X-Forwarded-For': ip }) },
				signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
			});
		} catch {
			// Best effort: the caller proceeds regardless of upstream availability.
		}
	};

	const POST: RequestHandler = async (event) => {
		const { request, cookies } = event;
		let payload: { email?: string; password?: string; store_id?: string };
		try {
			payload = await request.json();
		} catch {
			error(400, 'Invalid request body.');
		}

		const email = payload.email?.trim();
		const password = payload.password;
		const storeId = payload.store_id?.trim();
		if (!email || !password) error(400, 'Email and password are required.');
		if (store.requireStore && !storeId) error(400, 'Store ID is required.');

		const ip = clientIp(event);
		let res: Response;
		try {
			res = await fetch(`${opts.upstream()}/api/v1/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(ip && { 'X-Forwarded-For': ip }) },
				body: JSON.stringify(store.requireStore ? { email, password, store_id: storeId } : { email, password }),
				signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
			});
		} catch {
			error(502, 'Cannot reach authentication service.');
		}

		const body = (await res.json().catch(() => null)) as Envelope<LoginData> | null;
		if (!res.ok) error(PASSTHROUGH.has(res.status) ? res.status : 502, body?.error || 'Login failed.');
		if (!body?.data) error(502, 'Invalid login response from gateway.');

		const token = body.data.access_token;
		const role = body.data.claims?.role;
		if (role !== requiredRole) {
			// The upstream already opened a refresh session for this token; close it.
			if (token) await logoutUpstream(token, ip);
			error(403, forbidden);
		}
		if (!token) error(502, 'Invalid login response from gateway.');

		if (store.requireStore) {
			const resolved = body?.data?.claims?.store_id ?? storeId!;
			store.write(cookies, { token, role, storeId: resolved });
			return json({ role, storeId: resolved });
		}
		store.write(cookies, { token, role });
		return json({ role });
	};

	const DELETE: RequestHandler = async (event) => {
		const session = store.read(event.cookies);
		if (session) await logoutUpstream(session.token, clientIp(event));
		store.clear(event.cookies);
		return json({ ok: true });
	};

	return { POST, DELETE };
}
