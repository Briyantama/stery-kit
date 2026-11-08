import type { RequestEvent } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiProxy } from './proxy';

const COOKIE = 'test_session';

function event(
	method: string,
	path: string,
	search: string,
	cookie?: string,
	init: RequestInit = {},
	getClientAddress: () => string = () => '203.0.113.9'
) {
	return {
		request: new Request(`http://app.test/api/${path}${search}`, { method, ...init }),
		params: { path },
		url: new URL(`http://app.test/api/${path}${search}`),
		cookies: { get: (name: string) => (name === COOKIE ? cookie : undefined) },
		getClientAddress
	} as unknown as RequestEvent;
}

const session = JSON.stringify({ token: 'jwt-1', role: 'admin' });

describe('createApiProxy', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('forwards path, query and bearer token to the upstream', async () => {
		const fetchMock = vi.fn(async () => new Response('{"success":true}', { status: 200 }));
		vi.stubGlobal('fetch', fetchMock);
		const proxy = createApiProxy({ upstream: () => 'http://api.test/', accessCookie: COOKIE });

		const res = await proxy.POST(
			event('POST', 'products/42', '?page=2', session, {
				body: '{"a":1}',
				headers: { 'X-Store-ID': 's1', Authorization: 'Bearer forged', Cookie: `${COOKIE}=secret` }
			})
		);

		expect(res.status).toBe(200);
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('http://api.test/api/v1/products/42?page=2');
		const headers = init.headers as Headers;
		expect(headers.get('Authorization')).toBe('Bearer jwt-1');
		expect(headers.get('X-Store-ID')).toBe('s1');
		expect(headers.has('cookie')).toBe(false);
		expect(init.method).toBe('POST');
		expect(new TextDecoder().decode(init.body as ArrayBuffer)).toBe('{"a":1}');
	});

	it('answers 401 without calling the upstream when there is no session', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const onUnauthorized = vi.fn();
		const proxy = createApiProxy({ upstream: () => 'http://api.test', accessCookie: COOKIE, onUnauthorized });

		const res = await proxy.GET(event('GET', 'products', ''));

		expect(res.status).toBe(401);
		expect(await res.json()).toEqual({ success: false, data: null, error: 'unauthorized' });
		expect(fetchMock).not.toHaveBeenCalled();
		expect(onUnauthorized).toHaveBeenCalledOnce();
	});

	it('answers 502 in envelope form when the upstream is down', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('refused')));
		const proxy = createApiProxy({ upstream: () => 'http://api.test', accessCookie: COOKIE });

		const res = await proxy.GET(event('GET', 'products', '', session));

		expect(res.status).toBe(502);
		expect(await res.json()).toMatchObject({ success: false, error: 'upstream unavailable' });
	});

	it('replaces spoofed forwarding headers with the real client address', async () => {
		const fetchMock = vi.fn(async () => new Response('{}'));
		vi.stubGlobal('fetch', fetchMock);
		const proxy = createApiProxy({ upstream: () => 'http://api.test', accessCookie: COOKIE });

		await proxy.GET(
			event('GET', 'products', '', session, {
				headers: {
					'X-Forwarded-For': '6.6.6.6',
					'X-Real-IP': '6.6.6.6',
					Forwarded: 'for=6.6.6.6',
					'X-Forwarded-Host': 'evil.test',
					'X-Forwarded-Proto': 'http',
					'Accept-Encoding': 'br'
				}
			})
		);

		const headers = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].headers as Headers;
		expect(headers.get('x-forwarded-for')).toBe('203.0.113.9');
		for (const name of ['x-real-ip', 'forwarded', 'x-forwarded-host', 'x-forwarded-proto', 'accept-encoding']) {
			expect(headers.has(name)).toBe(false);
		}
	});

	it('forwards without x-forwarded-for when the client address is unavailable', async () => {
		const fetchMock = vi.fn(async () => new Response('{}'));
		vi.stubGlobal('fetch', fetchMock);
		const proxy = createApiProxy({ upstream: () => 'http://api.test', accessCookie: COOKIE });
		const throwing = () => {
			throw new Error('no address');
		};

		const res = await proxy.GET(
			event('GET', 'products', '', session, { headers: { 'X-Forwarded-For': '6.6.6.6' } }, throwing)
		);

		expect(res.status).toBe(200);
		const headers = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].headers as Headers;
		expect(headers.has('x-forwarded-for')).toBe(false);
	});

	it('strips set-cookie, content-encoding and content-length from the response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(
				async () =>
					new Response('{}', {
						headers: {
							'Set-Cookie': 'a=b',
							'Content-Encoding': 'gzip',
							'Content-Length': '2',
							'Content-Type': 'application/json'
						}
					})
			)
		);
		const proxy = createApiProxy({ upstream: () => 'http://api.test', accessCookie: COOKIE });

		const res = await proxy.GET(event('GET', 'products', '', session));

		expect(res.headers.has('set-cookie')).toBe(false);
		expect(res.headers.has('content-encoding')).toBe(false);
		expect(res.headers.has('content-length')).toBe(false);
		expect(res.headers.get('content-type')).toBe('application/json');
	});

	it('rejects dot segments and backslashes with 400 without calling the upstream', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const proxy = createApiProxy({ upstream: () => 'http://api.test', accessCookie: COOKIE });

		for (const path of ['../admin', 'products/..', './x', 'a/%2e%2e/b', 'a\\b']) {
			const res = await proxy.GET(event('GET', path, '', session));
			expect(res.status, path).toBe(400);
			expect(await res.json()).toEqual({ success: false, data: null, error: 'invalid path' });
		}
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('encodes each path segment for the upstream', async () => {
		const fetchMock = vi.fn(async () => new Response('{}'));
		vi.stubGlobal('fetch', fetchMock);
		const proxy = createApiProxy({ upstream: () => 'http://api.test', accessCookie: COOKIE });

		await proxy.GET(event('GET', 'products/a b/ü', '', session));

		expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe('http://api.test/api/v1/products/a%20b/%C3%BC');
	});

	it('applies the headers hook last, overriding client-supplied values', async () => {
		const fetchMock = vi.fn(async () => new Response('{}'));
		vi.stubGlobal('fetch', fetchMock);
		const hook = vi.fn(() => ({ 'X-Store-ID': 'server-store' }));
		const proxy = createApiProxy({ upstream: () => 'http://api.test', accessCookie: COOKIE, headers: hook });

		await proxy.GET(event('GET', 'products', '', session, { headers: { 'X-Store-ID': 'client-store' } }));

		expect(hook).toHaveBeenCalledOnce();
		const headers = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].headers as Headers;
		expect(headers.get('x-store-id')).toBe('server-store');
	});
});
