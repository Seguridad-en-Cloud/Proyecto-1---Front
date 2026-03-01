import apiClient from "./client";
import { TOKEN_KEYS } from "@/lib/constants";
import type { LoginRequest, RegisterRequest, AuthResponse, TokenResponse, RefreshRequest } from "./types";

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  refresh: (data: RefreshRequest) =>
    apiClient.post<TokenResponse>("/auth/refresh", data).then((r) => r.data),

  logout: () => {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);
    return apiClient.post("/auth/logout", { refresh_token: refreshToken });
  },
};
