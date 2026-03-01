import axios from "axios";
import { API_BASE_URL, TOKEN_KEYS } from "@/lib/constants";
import type { TokenResponse } from "./types";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never intercept auth endpoints — let the calling code handle errors
    const url: string = originalRequest?.url ?? "";
    if (url.includes("/auth/login") || url.includes("/auth/register")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH);

      if (!refreshToken) {
        localStorage.removeItem(TOKEN_KEYS.ACCESS);
        localStorage.removeItem(TOKEN_KEYS.REFRESH);
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<TokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { access_token, refresh_token } = res.data;
        localStorage.setItem(TOKEN_KEYS.ACCESS, access_token);
        localStorage.setItem(TOKEN_KEYS.REFRESH, refresh_token);

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(TOKEN_KEYS.ACCESS);
        localStorage.removeItem(TOKEN_KEYS.REFRESH);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
