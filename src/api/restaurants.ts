import apiClient from "./client";
import type { Restaurant, CreateRestaurantRequest, UpdateRestaurantRequest } from "./types";
import axios from "axios";

export const restaurantsApi = {
  /** Get the current user's restaurant. Returns null if none exists (404). */
  get: async (): Promise<Restaurant | null> => {
    try {
      const r = await apiClient.get<Restaurant>("/admin/restaurant");
      return r.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  create: (data: CreateRestaurantRequest) =>
    apiClient.post<Restaurant>("/admin/restaurant", data).then((r) => r.data),

  update: (data: UpdateRestaurantRequest) =>
    apiClient.put<Restaurant>("/admin/restaurant", data).then((r) => r.data),

  delete: () =>
    apiClient.delete("/admin/restaurant"),
};
