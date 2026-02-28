import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  apiRegister, apiLogin, apiGetMe, apiLogout,
  setTokens, clearTokens, getAccessToken,
  type UserData, type RegisterPayload, type AuthResponse,
} from "@/lib/api";

interface AuthContextValue {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserData>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /* Showcase injects ?_st=TOKEN into iframe URLs — pick it up */
    const params = new URLSearchParams(window.location.search);
    const showcaseToken = params.get("_st");
    if (showcaseToken) {
      localStorage.setItem("lily_access_token", showcaseToken);
      /* Clean only the token from the URL (keep _showcase for other components) */
      params.delete("_st");
      const clean = params.toString();
      const base = window.location.pathname + (clean ? `?${clean}` : "");
      window.history.replaceState({}, "", base);
    }

    const token = getAccessToken();
    if (token) {
      apiGetMe()
        .then(setUser)
        .catch(() => {
          clearTokens();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiLogin(email, password);
    setTokens(tokens.access, tokens.refresh);
    const userData = await apiGetMe();
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiRegister(payload);
    if (res.access) {
      setTokens(res.access, res.refresh);
      const userData = await apiGetMe();
      setUser(userData);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    clearTokens();
    setUser(null);
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await apiGetMe();
      setUser(userData);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
