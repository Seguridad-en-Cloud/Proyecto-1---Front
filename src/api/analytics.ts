import apiClient from "./client";
import { API_BASE_URL, TOKEN_KEYS } from "@/lib/constants";
import type { AnalyticsData } from "./types";

export interface AnalyticsParams {
  granularity?: "day" | "week" | "month";
  from?: string;
  to?: string;
}

export const analyticsApi = {
  get: (params?: AnalyticsParams) =>
    apiClient.get<AnalyticsData>("/admin/analytics", { params }).then((r) => r.data),

  exportCsv: async (params?: { from?: string; to?: string }) => {
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS);
    const queryParams = new URLSearchParams();
    if (params?.from) queryParams.set("from", params.from);
    if (params?.to) queryParams.set("to", params.to);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const res = await fetch(`${API_BASE_URL}/admin/analytics/export${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Export failed");
    return res.blob();
  },
};
