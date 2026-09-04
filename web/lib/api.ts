// A relative URL keeps browser traffic on the public origin, where Nginx proxies
// /api to the private API container.  An absolute URL remains available for
// development or deployments that deliberately host the API elsewhere.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("json")) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`API returned an invalid response (HTTP ${response.status}). Please try again.`);
      }
    } else {
      // The API (or a proxy in front of it) returned an HTML error page,
      // e.g. a 502 while the API is restarting. Surface the status instead
      // of leaking a JSON parse SyntaxError to the UI.
      throw new Error(
        response.ok
          ? "API returned an unexpected response. Please try again."
          : `API request failed (HTTP ${response.status}). Please try again.`
      );
    }
  }

  if (!response.ok) {
    const message = (data as { message?: unknown } | null)?.message;
    throw new Error(typeof message === "string" && message ? message : `Request failed (HTTP ${response.status})`);
  }

  return data as T;
}

export type PageMeta = { total: number; page: number; limit: number; totalPages: number };

export const EMPTY_META: PageMeta = { total: 0, page: 1, limit: 20, totalPages: 1 };

export type Page<T> = {
  data: T[];
  meta: PageMeta;
};

function normalizeMeta(meta: unknown, fallbackPage: number, fallbackLimit: number): PageMeta {
  const m = (meta ?? {}) as Partial<PageMeta>;
  const total = typeof m.total === "number" && m.total >= 0 ? m.total : 0;
  const limit = typeof m.limit === "number" && m.limit > 0 ? m.limit : fallbackLimit;
  const totalPages = typeof m.totalPages === "number" && m.totalPages > 0 ? m.totalPages : 1;
  const page = typeof m.page === "number" && m.page > 0 ? m.page : fallbackPage;
  return { total, page, limit, totalPages };
}

/**
 * Fetches a list endpoint and unwraps the API's paginated `{data,meta}`
 * envelope. Also accepts a bare array (older API versions). Never throws
 * on shape mismatches — returns `{items: [], meta}` instead, so pages
 * render their empty state rather than crashing.
 */
export async function apiList<T>(
  path: string,
  options: RequestInit = {},
  fallbackPage = 1,
  fallbackLimit = 20
): Promise<{ items: T[]; meta: PageMeta }> {
  const body = await apiRequest<Page<T> | T[] | null>(path, options);
  if (Array.isArray(body)) {
    return {
      items: body,
      meta: { ...EMPTY_META, total: body.length, page: fallbackPage, limit: Math.max(body.length, 1) },
    };
  }
  if (body && Array.isArray(body.data)) {
    return { items: body.data, meta: normalizeMeta(body.meta, fallbackPage, fallbackLimit) };
  }
  return { items: [], meta: { ...EMPTY_META, page: fallbackPage, limit: fallbackLimit } };
}

/** Unwraps paginated `{data,meta}` envelopes while staying compatible with plain arrays. */
export async function apiPage<T>(path: string, options: RequestInit = {}): Promise<T[]> {
  return (await apiList<T>(path, options)).items;
}
