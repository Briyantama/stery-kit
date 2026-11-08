import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSessionHandlers, createSessionStore } from './session';

function fakeCookies(initial: Record<string, string> = {}) {
	const jar = { ...initial };
	const set = vi.fn((name: string, value: string) => void (jar[name] = value));
	const del = vi.fn((name: string) => void delete jar[name]);
	const cookies = { get: (name: string) => jar[name], set, delete: del } as unknown as Cookies;
	return { cookies, set, del, jar };
}

const post = (cookies: Cookies, body: unknown) =>
	({ request: new Request('http://app.test/auth/session', { method: 'POST', body: JSON.stringify(body) }), cookies }) as unknown as RequestEvent;

const login = (data: unknown, status = 200) =>
	vi.fn(
		async (_url: string) =>
			new Response(JSON.stringify({ success: status < 400, data, error: status < 400 ? null : 'bad credentials' }), { status })
	);

describe('createSessionHandlers', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('logs in, checks the role and sets an HttpOnly cookie', async () => {
		const fetchMock = login({ access_token: 'jwt', claims: { role: 'admin' } });
		vi.stubGlobal('fetch', fetchMock);
		const store = createSessionStore({ cookie: 'c', secure: true });
		const { POST } = createSessionHandlers({ upstream: () => 'http://api.test', store, requiredRole: 'admin' });
		const { cookies, set } = fakeCookies();

		const res = await POST(post(cookies, { email: ' a@b.test ', password: 'pw' }));

		expect(await res.json()).toEqual({ role: 'admin' });
		expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/api/v1/login');
		expect(set).toHaveBeenCalledWith('c', JSON.stringify({ token: 'jwt', role: 'admin' }), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: 2592000
		});
	});

	it('refuses another role and a failed login', async () => {
		const store = createSessionStore({ cookie: 'c', secure: true });
		const { POST } = createSessionHandlers({ upstream: () => 'http://api.test', store, requiredRole: 'admin' });
		const { cookies, set } = fakeCookies();

		vi.stubGlobal('fetch', login({ access_token: 'jwt', claims: { role: 'cashier' } }));
		await expect(POST(post(cookies, { email: 'a@b.test', password: 'pw' }))).rejects.toMatchObject({ status: 403 });

		vi.stubGlobal('fetch', login(null, 401));
		await expect(POST(post(cookies, { email: 'a@b.test', password: 'pw' }))).rejects.toMatchObject({
			status: 401,
			body: { message: 'bad credentials' }
		});
		expect(set).not.toHaveBeenCalled();
	});

	it('forwards the client address on login and logout', async () => {
		const fetchMock = login({ access_token: 'jwt', claims: { role: 'admin' } });
		vi.stubGlobal('fetch', fetchMock);
		const store = createSessionStore({ cookie: 'c', secure: true });
		const { POST, DELETE } = createSessionHandlers({ upstream: () => 'http://api.test', store, requiredRole: 'admin' });
		const { cookies } = fakeCookies({ c: JSON.stringify({ token: 'jwt', role: 'admin' }) });
		const getClientAddress = () => '203.0.113.9';

		await POST({ ...post(cookies, { email: 'a@b.test', password: 'pw' }), getClientAddress } as unknown as RequestEvent);
		await DELETE({ cookies, getClientAddress } as unknown as RequestEvent);

		for (const call of fetchMock.mock.calls) {
			const init = (call as unknown as [string, RequestInit])[1];
			expect((init.headers as Record<string, string>)['X-Forwarded-For']).toBe('203.0.113.9');
			expect(init.signal).toBeInstanceOf(AbortSignal);
		}
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('answers 502, not 403, when the login response has no data', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response('not json', { status: 200 })));
		const store = createSessionStore({ cookie: 'c', secure: true });
		const { POST } = createSessionHandlers({ upstream: () => 'http://api.test', store, requiredRole: 'admin' });

		await expect(POST(post(fakeCookies().cookies, { email: 'a@b.test', password: 'pw' }))).rejects.toMatchObject({ status: 502 });
	});

	it('passes upstream 4xx statuses through and maps 5xx to 502', async () => {
		const store = createSessionStore({ cookie: 'c', secure: true });
		const { POST } = createSessionHandlers({ upstream: () => 'http://api.test', store, requiredRole: 'admin' });
		const { cookies } = fakeCookies();
		const attempt = () => POST(post(cookies, { email: 'a@b.test', password: 'pw' }));

		for (const status of [400, 403, 404, 409, 422, 429]) {
			vi.stubGlobal('fetch', login(null, status));
			await expect(attempt()).rejects.toMatchObject({ status, body: { message: 'bad credentials' } });
		}
		for (const status of [500, 503]) {
			vi.stubGlobal('fetch', login(null, status));
			await expect(attempt()).rejects.toMatchObject({ status: 502 });
		}
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('refused')));
		await expect(attempt()).rejects.toMatchObject({ status: 502 });
	});

	it('closes the upstream session with the new token on a role mismatch', async () => {
		const fetchMock = vi.fn(async (url: string) =>
			String(url).endsWith('/login')
				? new Response(JSON.stringify({ success: true, data: { access_token: 'new-jwt', claims: { role: 'cashier' } }, error: null }))
				: new Response('{}')
		);
		vi.stubGlobal('fetch', fetchMock);
		const store = createSessionStore({ cookie: 'c', secure: true });
		const { POST } = createSessionHandlers({ upstream: () => 'http://api.test', store, requiredRole: 'admin' });
		const { cookies, set } = fakeCookies();

		await expect(POST(post(cookies, { email: 'a@b.test', password: 'pw' }))).rejects.toMatchObject({ status: 403 });

		const [url, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
		expect(url).toBe('http://api.test/api/v1/logout');
		expect(init.headers).toMatchObject({ Authorization: 'Bearer new-jwt' });
		expect(set).not.toHaveBeenCalled();
	});

	it('keeps the store id for store-scoped sessions and requires it at login', async () => {
		vi.stubGlobal('fetch', login({ access_token: 'jwt', claims: { role: 'cashier', store_id: 'st1' } }));
		const store = createSessionStore({ cookie: 'c', secure: false, requireStore: true });
		const { POST } = createSessionHandlers({ upstream: () => 'http://api.test', store, requiredRole: 'cashier' });
		const { cookies, jar } = fakeCookies();

		await expect(POST(post(cookies, { email: 'a@b.test', password: 'pw' }))).rejects.toMatchObject({ status: 400 });
		const res = await POST(post(cookies, { email: 'a@b.test', password: 'pw', store_id: 'st1' }));

		expect(await res.json()).toEqual({ role: 'cashier', storeId: 'st1' });
		expect(store.read(cookies)).toEqual({ token: 'jwt', role: 'cashier', storeId: 'st1' });
		expect(jar.c).toBeDefined();
	});

	it('logs out upstream with the bearer token and clears the cookie', async () => {
		const fetchMock = vi.fn(async () => new Response('{}'));
		vi.stubGlobal('fetch', fetchMock);
		const store = createSessionStore({ cookie: 'c', secure: true });
		const { DELETE } = createSessionHandlers({ upstream: () => 'http://api.test', store, requiredRole: 'admin' });
		const { cookies, del } = fakeCookies({ c: JSON.stringify({ token: 'jwt', role: 'admin' }) });

		await DELETE({ cookies } as unknown as RequestEvent);

		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('http://api.test/api/v1/logout');
		expect(init.headers).toMatchObject({ Authorization: 'Bearer jwt' });
		expect(del).toHaveBeenCalledWith('c', { path: '/' });
	});
});
