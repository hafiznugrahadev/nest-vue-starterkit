import type {
  ApiResponse,
  ApiErrorResponse,
  Paginated,
  PaginationMeta,
  User,
} from '@starterkit/shared-types';
import { pinia } from '~/stores/pinia';
import { useAuthStore } from '~/stores/auth.store';

const BASE =
  (import.meta.env['VITE_API_BASE'] as string | undefined) ?? 'http://localhost:4400/api';

export function getApiBase() {
  return BASE;
}

export interface ApiFetchOpts {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | string[] | undefined>;
  signal?: AbortSignal;
}

let refreshPromise: Promise<boolean> | null = null;

/** Like apiFetch but returns the full ApiResponse (needed for paginated meta). */
export async function apiFetchRaw<T>(
  url: string,
  opts: ApiFetchOpts = {},
): Promise<ApiResponse<T>> {
  const fullUrl = buildUrl(BASE, url, opts.query);
  const auth = useAuthStore(pinia);

  const headers: Record<string, string> = {};
  if (auth.accessToken) headers['Authorization'] = `Bearer ${auth.accessToken}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(fullUrl, {
    method: opts.method ?? 'GET',
    credentials: 'include',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  // 401 → refresh → retry once (non-auth routes; mutex dedupes concurrent 401s)
  if (res.status === 401 && !url.startsWith('/auth/')) {
    if (!refreshPromise) {
      refreshPromise = clientRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const ok = await refreshPromise;
    if (ok) return apiFetchRaw<T>(url, opts);
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = (await res.clone().json()) as ApiErrorResponse;
      msg = Array.isArray(err.message) ? err.message.join(', ') : String(err.message ?? msg);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  return res.json() as Promise<ApiResponse<T>>;
}

export async function apiFetch<T>(url: string, opts: ApiFetchOpts = {}): Promise<T> {
  return unwrap(await apiFetchRaw<T>(url, opts));
}

export async function clientRefresh(): Promise<boolean> {
  const auth = useAuthStore(pinia);
  try {
    const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) {
      auth.clearSession();
      return false;
    }
    const body = (await res.json()) as ApiResponse<{ accessToken: string; user: User }>;
    if (body.success) {
      auth.setSession(body.data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function unwrap<T>(res: ApiResponse<T>): T {
  if (res.success) return res.data;
  const msg = Array.isArray(res.message)
    ? res.message.join(', ')
    : String(res.message ?? 'Unknown error');
  throw new Error(msg);
}

export function unwrapPaginated<T>(res: ApiResponse<T[]>): Paginated<T> {
  if (res.success) return { data: res.data, meta: res.meta as PaginationMeta };
  const msg = Array.isArray(res.message)
    ? res.message.join(', ')
    : String(res.message ?? 'Unknown error');
  throw new Error(msg);
}

function buildUrl(
  base: string,
  path: string,
  query?: Record<string, string | number | boolean | string[] | undefined>,
) {
  // Strip leading slash so `new URL` doesn't replace the base path (e.g. /api).
  const relPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(relPath, base.endsWith('/') ? base : base + '/');
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      if (val === undefined) continue;
      if (Array.isArray(val)) val.forEach((v) => url.searchParams.append(key, v));
      else url.searchParams.set(key, String(val));
    }
  }
  return url.toString();
}
