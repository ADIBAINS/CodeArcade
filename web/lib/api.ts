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

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }

  return data as T;
}
