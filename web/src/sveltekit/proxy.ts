import { json, type RequestEvent, type RequestHandler } from '@sveltejs/kit';
import { parseSession } from './session';

// Headers that must not be forwarded verbatim across the proxy hop.
const STRIP: Record<string, true> = {
	connection: true,
	'keep-alive': true,
	'transfer-encoding': true,
	upgrade: true,
	host: true,
	'content-length': true
};
// The session cookie holds the JWT; the upstream gets it only as the Authorization header.
// Client-supplied forwarding headers are dropped so the upstream sees the real client address.
// accept-encoding is dropped so fetch negotiates (and decodes) the body itself.
const STRIP_REQUEST: Record<string, true> = {
	...STRIP,
	cookie: true,
	'accept-encoding': true,
	'x-forwarded-for': true,
	'x-real-ip': true,
	forwarded: true,
	'x-forwarded-host': true,
	'x-forwarded-proto': true
};
// fetch already decoded the body, so the encoding/length headers no longer describe it, and the
// BFF owns cookies, so an upstream Set-Cookie must never reach the browser.
const STRIP_RESPONSE: Record<string, true> = { ...STRIP, 'content-encoding': true, 'set-cookie': true };

export interface ApiProxyOptions {
	/** Base URL of the Go API, without `/api/v1`. */
	upstream: () => string;
	/** Name of the session cookie written by `createSessionStore`. */
	accessCookie: string;
	/** Called when there is no session or the upstream answers 401, e.g. to clear the cookie. */
	onUnauthorized?: (event: RequestEvent) => void;
	/** Extra upstream request headers per call (e.g. store selection). Win over client-sent values of the same names. */
	headers?: (event: RequestEvent) => Record<string, string> | undefined;
}

/**
 * BFF proxy for `src/routes/api/[...path]/+server.ts`. The browser calls `/api/<path>`; the bearer
 * token is held server-side in the HttpOnly session cookie and injected here, so the JWT never
 * reaches client JS. Forwards to `${upstream}/api/v1/<path><query>`.
 */
export function createApiProxy(opts: ApiProxyOptions) {
	const handler: RequestHandler = async (event) => {
		const { request, params, url, cookies } = event;
		const unauthorized = () => {
			opts.onUnauthorized?.(event);
		};

		const token = parseSession(cookies.get(opts.accessCookie))?.token;
		if (!token) {
			unauthorized();
			return json({ success: false, data: null, error: 'unauthorized' }, { status: 401 });
		}

		// SvelteKit has already decoded params.path once; decode again to catch double-encoded dots.
		const segments = (params.path ?? '').split('/');
		const badSegment = segments.some((seg) => {
			let decoded = seg;
			try {
				decoded = decodeURIComponent(seg);
			} catch {
				// a literal '%' is legal after the first decode
			}
			return [seg, decoded].some((s) => s === '.' || s === '..' || s.includes('\\'));
		});
		if (badSegment) {
			return json({ success: false, data: null, error: 'invalid path' }, { status: 400 });
		}

		const target = `${opts.upstream().replace(/\/+$/, '')}/api/v1/${segments.map(encodeURIComponent).join('/')}${url.search}`;
		const headers = new Headers();
		request.headers.forEach((value, key) => {
			if (!Object.hasOwn(STRIP_REQUEST, key.toLowerCase())) headers.set(key, value);
		});
		try {
			headers.set('X-Forwarded-For', event.getClientAddress());
		} catch {
			// No client address available (e.g. prerender); forward without one.
		}
		headers.set('Authorization', `Bearer ${token}`);
		for (const [name, value] of Object.entries(opts.headers?.(event) ?? {})) headers.set(name, value);

		const init: RequestInit = { method: request.method, headers };
		if (request.method !== 'GET' && request.method !== 'HEAD') {
			init.body = await request.arrayBuffer();
		}

		let res: Response;
		try {
			res = await fetch(target, init);
		} catch {
			return json({ success: false, data: null, error: 'upstream unavailable' }, { status: 502 });
		}
		if (res.status === 401) unauthorized();

		const resHeaders = new Headers();
		res.headers.forEach((value, key) => {
			if (!Object.hasOwn(STRIP_RESPONSE, key.toLowerCase())) resHeaders.set(key, value);
		});
		return new Response(res.body, { status: res.status, statusText: res.statusText, headers: resHeaders });
	};

	return { GET: handler, POST: handler, PUT: handler, PATCH: handler, DELETE: handler };
}
