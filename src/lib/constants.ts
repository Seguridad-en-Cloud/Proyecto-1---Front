export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost/api/v1";

export const TOKEN_KEYS = {
  ACCESS: "livemenu_access_token",
  REFRESH: "livemenu_refresh_token",
} as const;
