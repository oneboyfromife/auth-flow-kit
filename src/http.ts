import { EndpointsConfig } from "./types";

export function makeURL(baseURL: string, path: string) {
  return `${baseURL.replace(/\/$/, "")}${
    path.startsWith("/") ? path : `/${path}`
  }`;
}

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem("afk_access_token");
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null) {
  try {
    if (token) localStorage.setItem("afk_access_token", token);
    else localStorage.removeItem("afk_access_token");
  } catch {
    // ignore storage errors
  }
}

export async function httpJSON<T>(
  url: string,
  opts: RequestInit = {},
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (withAuth) {
    const tok = getStoredAccessToken();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }
  const res = await fetch(url, {
    ...opts,
    headers: { ...headers, ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function tryRefreshToken(
  baseURL: string,
  endpoints: EndpointsConfig
): Promise<string | null> {
  if (!endpoints.refresh) return null;
  const refreshToken = localStorage.getItem("afk_refresh_token");
  if (!refreshToken) return null;

  try {
    const url = makeURL(baseURL, endpoints.refresh);
    const next = await httpJSON<{ accessToken: string }>(url, {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    setStoredAccessToken(next.accessToken);
    return next.accessToken;
  } catch {
    return null;
  }
}
