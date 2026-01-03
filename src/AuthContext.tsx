import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  PropsWithChildren,
} from "react";

import {
  AuthContextType,
  AuthProviderConfig,
  StandardAuthResponse,
  User,
} from "./types";

import {
  httpJSON,
  makeURL,
  setStoredAccessToken,
  getStoredAccessToken,
} from "./http";

const STORAGE_KEY = "afk_user";

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(user: User, token: string) {
  setStoredAccessToken(token);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearSession() {
  setStoredAccessToken(null);
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({
  config,
  children,
}: PropsWithChildren<{ config: AuthProviderConfig }>) {
  const { baseURL, endpoints, onLoginSuccess, onLogout } = config;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => getStoredAccessToken();

  // Restore persisted session
  useEffect(() => {
    const existingUser = readStoredUser();
    if (existingUser) {
      setUser(existingUser);
    }
    setLoading(false);
  }, []);

  const authenticate = async (url: string, payload: unknown): Promise<void> => {
    const response = await httpJSON<StandardAuthResponse>(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    persistSession(response.user, response.accessToken);
    setUser(response.user);

    onLoginSuccess?.();
  };

  const login: AuthContextType["login"] = (email, password) => {
    const url = makeURL(baseURL, endpoints.login);
    return authenticate(url, { email, password });
  };

  const signup: AuthContextType["signup"] = (payload) => {
    const url = makeURL(baseURL, endpoints.signup);
    return authenticate(url, payload);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    onLogout?.();
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      getToken,
      config,
    }),
    [user, loading, config]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
