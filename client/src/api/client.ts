const TOKEN_KEY = "inventory-access-token";

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body !== undefined && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({ message: "The server returned an unreadable response." }));
  if (!response.ok) throw new ApiError(response.status, payload.message ?? "The request could not be completed.");
  return payload as T;
}
