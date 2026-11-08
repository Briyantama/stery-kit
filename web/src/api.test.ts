import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, createClient, unwrap, unwrapEnvelope } from './api';

const envelope = (body: unknown, init?: ResponseInit) =>
	new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, ...init });

describe('unwrap', () => {
	it('returns data of a success envelope', async () => {
		const res = envelope({ success: true, data: { id: 'a' }, error: null });
		expect(await unwrap<{ id: string }>(res)).toEqual({ id: 'a' });
	});

	it('throws ApiError with the server text and status on an error envelope', async () => {
		const res = envelope({ success: false, data: null, error: 'name is required' }, { status: 422 });
		const err = await unwrap(res).catch((e: unknown) => e);
		expect(err).toBeInstanceOf(ApiError);
		expect(err).toMatchObject({ message: 'name is required', status: 422 });
	});

	it('throws ApiError(502, statusText) for a non-JSON body', async () => {
		const res = new Response('<html>bad gateway</html>', { status: 502, statusText: 'Bad Gateway' });
		const err = await unwrap(res).catch((e: unknown) => e);
		expect(err).toBeInstanceOf(ApiError);
		expect(err).toMatchObject({ message: 'Bad Gateway', status: 502 });
	});

	it('falls back to a default message when statusText is empty', async () => {
		const html = () => new Response('<html></html>', { status: 502 });
		expect(await unwrap(html()).catch((e: unknown) => e)).toMatchObject({ message: 'Unexpected response', status: 502 });
		const failed = envelope({ success: false, data: null, error: '' }, { status: 500 });
		expect(await unwrap(failed).catch((e: unknown) => e)).toMatchObject({ message: 'Request failed', status: 500 });
		const undef = await unwrap(html(), { unexpected: undefined }).catch((e: unknown) => e);
		expect(undef).toMatchObject({ message: 'Unexpected response' });
	});

	it('carries Retry-After and rejects a body that is not an envelope', async () => {
		const res = envelope({ hello: 'world' }, { status: 429, headers: { 'Retry-After': '90' } });
		const err = (await unwrap(res, { unexpected: 'odd reply' }).catch((e: unknown) => e)) as ApiError;
		expect(err).toMatchObject({ message: 'odd reply', status: 429, retryAfterSeconds: 90 });
	});
});

describe('unwrapEnvelope', () => {
	it('rejects a success envelope without data', () => {
		expect(() => unwrapEnvelope({ success: true, error: null })).toThrowError(ApiError);
		expect(unwrapEnvelope({ success: true, data: null, error: null })).toBeNull();
	});
});

describe('createClient', () => {
	afterEach(() => vi.useRealTimers());

	it('sends JSON with merged headers, query and credentials, and returns data', async () => {
		const fetchMock = vi.fn(async () => envelope({ success: true, data: [1], error: null }));
		const api = createClient('/api/v1', {
			fetch: fetchMock as unknown as typeof fetch,
			credentials: 'include',
			headers: () => ({ Authorization: 'Bearer t' })
		});

		const data = await api.post<number[]>('/things', { a: 1 }, { query: { page: 2, skip: undefined } });

		expect(data).toEqual([1]);
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe('/api/v1/things?page=2');
		expect(init).toMatchObject({ method: 'POST', credentials: 'include', body: '{"a":1}' });
		const headers = new Headers(init.headers);
		expect(headers.get('Authorization')).toBe('Bearer t');
		expect(headers.get('Content-Type')).toBe('application/json');
	});

	it('turns a network failure into ApiError status 0 with the localised text', async () => {
		const api = createClient('', {
			fetch: (async () => {
				throw new TypeError('offline');
			}) as typeof fetch,
			messages: () => ({ network: 'koneksi terputus' })
		});
		const err = await api.get('/x').catch((e: unknown) => e);
		expect(err).toMatchObject({ message: 'koneksi terputus', status: 0 });
	});

	it('aborts after the timeout with status 0', async () => {
		vi.useFakeTimers();
		const hang = (_url: string, init?: RequestInit) =>
			new Promise<Response>((_, reject) =>
				init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
			);
		const api = createClient('', { fetch: hang as unknown as typeof fetch });
		const pending = api.get('/x', { timeoutMs: 1000 }).catch((e: unknown) => e);
		await vi.advanceTimersByTimeAsync(1000);
		expect(await pending).toMatchObject({ status: 0 });
	});

	it('calls onUnauthorized on 401 and still throws', async () => {
		const onUnauthorized = vi.fn();
		const api = createClient('', {
			fetch: (async () =>
				envelope({ success: false, data: null, error: 'unauthorized' }, { status: 401 })) as typeof fetch,
			onUnauthorized
		});
		await expect(api.del('/x')).rejects.toMatchObject({ status: 401, message: 'unauthorized' });
		expect(onUnauthorized).toHaveBeenCalledOnce();
	});
});
