import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/api/auth";
import { TOKEN_KEYS } from "@/lib/constants";
import type { LoginRequest, RegisterRequest, UserResponse } from "@/api/types";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
    const storedUser = localStorage.getItem("livemenu_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEYS.ACCESS);
        localStorage.removeItem(TOKEN_KEYS.REFRESH);
        localStorage.removeItem("livemenu_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    localStorage.setItem(TOKEN_KEYS.ACCESS, res.access_token);
    localStorage.setItem(TOKEN_KEYS.REFRESH, res.refresh_token);
    localStorage.setItem("livemenu_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    localStorage.setItem(TOKEN_KEYS.ACCESS, res.access_token);
    localStorage.setItem(TOKEN_KEYS.REFRESH, res.refresh_token);
    localStorage.setItem("livemenu_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem("livemenu_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
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
