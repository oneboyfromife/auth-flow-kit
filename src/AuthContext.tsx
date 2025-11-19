import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  tryRefreshToken,
} from "./http";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function AuthProvider({
  config,
  children,
}: React.PropsWithChildren<{ config: AuthProviderConfig }>) {
  const { baseURL, endpoints, onLoginSuccess, onLogout } = config;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => getStoredAccessToken();

  // Load session on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const token = getStoredAccessToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const meURL = makeURL(baseURL, endpoints.me);
        const profile = await httpJSON<User>(meURL, {}, true);
        setUser(profile);
      } catch (err) {
        // try refresh if available
        const refreshed = await tryRefreshToken(baseURL, endpoints);
        if (refreshed) {
          try {
            const meURL = makeURL(baseURL, endpoints.me);
            const profile = await httpJSON<User>(meURL, {}, true);
            setUser(profile);
          } catch {
            setStoredAccessToken(null);
            localStorage.removeItem("afk_refresh_token");
            setUser(null);
          }
        } else {
          setStoredAccessToken(null);
          localStorage.removeItem("afk_refresh_token");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login: AuthContextType["login"] = async (email, password) => {
    const url = makeURL(baseURL, endpoints.login);
    const res = await httpJSON<StandardAuthResponse>(url, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // store tokens
    setStoredAccessToken(res.accessToken);
    if (res.refreshToken)
      localStorage.setItem("afk_refresh_token", res.refreshToken);

    // set user
    setUser(res.user);

    if (onLoginSuccess) onLoginSuccess();
  };

  const signup: AuthContextType["signup"] = async (payload) => {
    const url = makeURL(baseURL, endpoints.signup);
    const res = await httpJSON<StandardAuthResponse>(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setStoredAccessToken(res.accessToken);
    if (res.refreshToken)
      localStorage.setItem("afk_refresh_token", res.refreshToken);
    setUser(res.user);

    if (onLoginSuccess) onLoginSuccess();
  };

  const logout = () => {
    setStoredAccessToken(null);
    localStorage.removeItem("afk_refresh_token");
    setUser(null);
    if (onLogout) onLogout();
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, loading, login, signup, logout, getToken }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
