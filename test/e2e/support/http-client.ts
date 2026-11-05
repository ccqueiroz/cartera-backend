import { readRunContext } from './run-context';

const REQUEST_TIMEOUT_MS = 20_000;

export type HttpVerb = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface RequestOptions {
  token?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export interface HttpResult {
  status: number;
  // A 2xx JSON body arrives unwrapped from its `{ data }` envelope; a 204 or a non-2xx body keeps the parsed value as it came.
  body: unknown;
}

function baseUrl(): string {
  return readRunContext().baseUrl;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  const url = `${baseUrl()}/${clean}`;
  if (!query) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function request(
  method: HttpVerb,
  path: string,
  options: RequestOptions = {},
): Promise<HttpResult> {
  const headers: Record<string, string> = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const init: RequestInit = { method: method.toUpperCase(), headers };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  const text = await response.text();
  let body: unknown;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (response.status >= 200 && response.status < 300 && text) {
    if (typeof body !== 'object' || body === null || !('data' in body)) {
      throw new Error(`${method.toUpperCase()} ${path} ${response.status}`);
    }
    body = (body as { data: unknown }).data;
  }
  return { status: response.status, body };
}

export function delay(ms: number): Promise<void> {
  return new Promise((done) => setTimeout(done, ms));
}
