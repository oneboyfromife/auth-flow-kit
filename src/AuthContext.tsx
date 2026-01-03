import React, {
  createContext,
  useContext,
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

const USER_STORAGE_KEY = "afk_user";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}

function initState(): AuthState {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return {
    user: stored ? JSON.parse(stored) : null,
    loading: false,
  };
}

export function AuthProvider({
  config,
  children,
}: PropsWithChildren<{ config: AuthProviderConfig }>) {
  const [{ user, loading }, setState] = useState<AuthState>(initState);

  const { baseURL, endpoints, onLoginSuccess, onLogout } = config;

  const getToken = () => getStoredAccessToken();

  const applyAuthResponse = (res: StandardAuthResponse) => {
    setStoredAccessToken(res.accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));

    setState({
      user: res.user,
      loading: false,
    });

    onLoginSuccess?.();
  };

  const login: AuthContextType["login"] = async (email, password) => {
    const response = await httpJSON<StandardAuthResponse>(
      makeURL(baseURL, endpoints.login),
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    applyAuthResponse(response);
  };

  const signup: AuthContextType["signup"] = async (payload) => {
    const response = await httpJSON<StandardAuthResponse>(
      makeURL(baseURL, endpoints.signup),
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    applyAuthResponse(response);
  };

  const logout = () => {
    setStoredAccessToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);

    setState({
      user: null,
      loading: false,
    });

    onLogout?.();
  };

  const value = useMemo<AuthContextType>(
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
