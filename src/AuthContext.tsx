import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
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

const USER_KEY = "afk_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const value = useContext(AuthContext);
  if (value === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

function loadUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({
  config,
  children,
}: PropsWithChildren<{ config: AuthProviderConfig }>) {
  const [user, setUser] = useState<User | null>(() => loadUser());
  const [loading, setLoading] = useState<boolean>(true);

  const { baseURL, endpoints, onLoginSuccess, onLogout } = config;

  const getToken = () => getStoredAccessToken();

  useEffect(() => {
    setLoading(false);
  }, []);

  const runAuthRequest = async (
    endpoint: string,
    body: unknown
  ): Promise<void> => {
    const response = await httpJSON<StandardAuthResponse>(
      makeURL(baseURL, endpoint),
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    setStoredAccessToken(response.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);

    onLoginSuccess?.();
  };

  const login: AuthContextType["login"] = async (email, password) => {
    await runAuthRequest(endpoints.login, { email, password });
  };

  const signup: AuthContextType["signup"] = async (payload) => {
    await runAuthRequest(endpoints.signup, payload);
  };

  const logout = () => {
    setStoredAccessToken(null);
    localStorage.removeItem(USER_KEY);
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
