/** The response shape every Stery Go API writes (`httpx.WriteSuccess` / `httpx.WriteError`). */
export type Envelope<T> = { success: boolean; data: T | null; error: string | null };

/**
 * Error raised when the API reports a failure or returns a malformed body.
 * @param status HTTP status, or 0 when no response was received or the failure is not HTTP.
 * @param retryAfterSeconds seconds the server asked the caller to wait (Retry-After), if any.
 */
export class ApiError extends Error {
	constructor(
		message: string,
		readonly status: number = 0,
		readonly retryAfterSeconds?: number
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/** Texts the client itself produces. Pass localised ones; the defaults are English. */
export interface ErrorMessages {
	network: string;
	unexpected: string;
	requestFailed: string;
}

const DEFAULT_MESSAGES: ErrorMessages = {
	network: 'Network request failed',
	unexpected: 'Unexpected response',
	requestFailed: 'Request failed'
};

function isEnvelope(
	body: unknown
): body is { success: boolean; data?: unknown; error?: string | null } {
	return (
		typeof body === 'object' &&
		body !== null &&
		'success' in body &&
		typeof body.success === 'boolean'
	);
}

/** Returns `data` of an already parsed envelope, or throws ApiError (status 0). */
export function unwrapEnvelope<T>(body: unknown, messages: Partial<ErrorMessages> = {}): T {
	const m = { ...DEFAULT_MESSAGES, ...messages };
	if (!isEnvelope(body)) throw new ApiError(m.unexpected);
	if (!body.success) throw new ApiError(body.error || m.requestFailed);
	if (!('data' in body)) throw new ApiError(m.unexpected);
	return body.data as T;
}

/** Only a positive whole number of seconds is a usable Retry-After. */
function parseRetryAfter(value: string | null): number | undefined {
	if (value === null || !/^\d+$/.test(value)) return undefined;
	const seconds = Number(value);
	return seconds > 0 ? seconds : undefined;
}

/**
 * Parses the envelope of a response and returns `data`. Non-JSON bodies, non-envelope bodies and
 * `success:false` envelopes throw ApiError carrying the HTTP status (and Retry-After, if sent).
 * Without `messages`, the text of a malformed body is the response's statusText.
 */
export async function unwrap<T>(res: Response, messages: Partial<ErrorMessages> = {}): Promise<T> {
	// `||` and `??` so an empty statusText (HTTP/2 has none) or an explicit undefined never yields a blank message.
	const m = {
		unexpected: messages.unexpected ?? (res.statusText || DEFAULT_MESSAGES.unexpected),
		requestFailed: messages.requestFailed ?? (res.statusText || DEFAULT_MESSAGES.requestFailed),
		network: messages.network ?? DEFAULT_MESSAGES.network
	};
	try {
		return unwrapEnvelope<T>(await res.json(), m);
	} catch (err) {
		const text = err instanceof ApiError ? err.message : m.unexpected;
		throw new ApiError(text, res.status, parseRetryAfter(res.headers.get('Retry-After')));
	}
}

export interface RequestOptions {
	/** Appended to the URL; undefined values are skipped. */
	query?: Record<string, string | number | boolean | undefined>;
	headers?: HeadersInit;
	/** The request fails with status 0 if the response is not complete by then. Default 15 s. */
	timeoutMs?: number;
}

export interface ClientInit {
	fetch?: typeof fetch;
	/** Called per request, e.g. to add Authorization or X-Request-ID. */
	headers?: () => HeadersInit;
	credentials?: RequestCredentials;
	/** Called per request so a reactive language setting is honoured. */
	messages?: () => Partial<ErrorMessages>;
	timeoutMs?: number;
	/** Called with the ApiError of a 401 response, before it is thrown. */
	onUnauthorized?: (err: ApiError) => void;
}

const DEFAULT_TIMEOUT_MS = 15_000;

function mergeHeaders(into: Headers, from: HeadersInit | undefined): void {
	if (from) new Headers(from).forEach((value, key) => into.set(key, value));
}

/**
 * JSON client for the Stery APIs. Every method returns the unwrapped `data`; every failure,
 * including network, timeout and malformed-body failures, is an ApiError (status 0 when there was
 * no response).
 */
export function createClient(baseUrl: string, init: ClientInit = {}) {
	async function request<T>(
		method: string,
		path: string,
		body?: unknown,
		options: RequestOptions = {}
	): Promise<T> {
		const messages = { ...DEFAULT_MESSAGES, ...init.messages?.() };
		const headers = new Headers({ Accept: 'application/json' });
		mergeHeaders(headers, init.headers?.());
		mergeHeaders(headers, options.headers);

		let url = baseUrl + path;
		if (options.query) {
			const params = new URLSearchParams();
			for (const [key, value] of Object.entries(options.query)) {
				if (value !== undefined) params.append(key, String(value));
			}
			const qs = params.toString();
			if (qs) url += (url.includes('?') ? '&' : '?') + qs;
		}

		const controller = new AbortController();
		const req: RequestInit = { method, headers, signal: controller.signal };
		if (init.credentials) req.credentials = init.credentials;
		if (body !== undefined) {
			headers.set('Content-Type', 'application/json');
			req.body = JSON.stringify(body);
		}

		// A stalled mobile connection must not leave a form disabled forever.
		const timer = setTimeout(
			() => controller.abort(),
			options.timeoutMs ?? init.timeoutMs ?? DEFAULT_TIMEOUT_MS
		);
		try {
			const doFetch = init.fetch ?? globalThis.fetch;
			let res: Response;
			try {
				res = await doFetch(url, req);
			} catch {
				throw new ApiError(messages.network, 0);
			}
			try {
				return await unwrap<T>(res, messages);
			} catch (err) {
				if (!(err instanceof ApiError)) throw err;
				if (controller.signal.aborted) throw new ApiError(messages.network, 0);
				if (err.status === 401) init.onUnauthorized?.(err);
				throw err;
			}
		} finally {
			clearTimeout(timer);
		}
	}

	return {
		/** Same as get/post/..., for callers that pick the method at run time. */
		request,
		get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
		post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
			request<T>('POST', path, body, options),
		put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
			request<T>('PUT', path, body, options),
		patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
			request<T>('PATCH', path, body, options),
		del: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options)
	};
}
