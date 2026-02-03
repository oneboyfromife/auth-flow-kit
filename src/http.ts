/*
  Internal HTTP utilities for auth-flow-kit.

  Purpose:
  - makeURL: safely compose baseURL + endpoint
  - getStoredAccessToken: read JWT from localStorage
  - setStoredAccessToken: persist or clear JWT
  - httpJSON: fetch wrapper with JSON handling + optional auth

  IMPORTANT:
  This file is internal to the library.
  Do NOT import or modify it directly.

  It exists to keep authentication logic:
  - predictable
  - lightweight
  - familiar to Redux Toolkit-style flows
*/

export function makeURL(baseURL: string, path: string) {
  const normalizedBase = baseURL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
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
    if (token) {
      localStorage.setItem("afk_access_token", token);
      return;
    }

    localStorage.removeItem("afk_access_token");
  } catch {
    // Ignore storage failures (private mode, restricted environments, etc.)
  }
}

export async function httpJSON<T>(
  url: string,
  opts: RequestInit = {},
  withAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (withAuth) {
    const token = getStoredAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...opts,
    headers: {
      ...headers,
      ...(opts.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const data = await response.json();
        if (data?.message) message = data.message;
      } catch {
        // Ignore malformed JSON errors
      }
    }

    if (contentType.includes("text/html")) {
      if (response.status === 404 && url.includes("forgot")) {
        message =
          "The forgot password endpoint you added in config.endpoints.forgot does not exist in your server. Please check and update your config.endpoints.forgot";
      } else {
        message = "Unexpected server error";
      }
    }

    if (response.status === 404 && url.includes("forgot")) {
      console.error(
        `[auth-flow-kit] Password reset endpoint not found.

        Expected a POST route matching:
          ${url}

        Fix this by either:
        - Adding the route on your backend, or
        - Updating config.endpoints.forgot`,
      );
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
