/*
 This file contains the low-level HTTP utilities used internally by
 auth-flow-kit to communicate with the backend.
 
 It provides:
  - makeURL: safely joins baseURL + endpoint path
  - getStoredAccessToken: reads the JWT from localStorage
  - setStoredAccessToken: stores/removes the JWT
  - httpJSON: wrapper around fetch with JSON + optional auth header
 
 NOTES FOR DEVELOPERS USING THE LIBRARY:
 You do NOT need to import or modify anything in this file.
 It is an internal helper used by the AuthProvider and auth screens.
 
 This keeps the library lightweight, predictable,
 and familiar to developers used to Redux Toolkit-style authentication.
 
 */

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
    // ignore storage errors (Safari private mode, etc.)
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

  // Add Authorization header only if requested
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
