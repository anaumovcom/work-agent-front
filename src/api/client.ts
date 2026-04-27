const DEFAULT_BASE = "http://localhost:8000";

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) || DEFAULT_BASE;

export const WS_BASE: string =
  (import.meta.env.VITE_WS_BASE as string | undefined) ||
  API_BASE.replace(/^http/, "ws");

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(p: string) => request<T>("GET", p),
  post: <T>(p: string, body?: unknown) => request<T>("POST", p, body ?? {}),
  patch: <T>(p: string, body?: unknown) => request<T>("PATCH", p, body ?? {}),
  delete: <T>(p: string) => request<T>("DELETE", p),
};
