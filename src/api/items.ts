import apiClient from "./client";
import type { Dish, DishListResponse, CreateDishRequest, UpdateDishRequest } from "./types";

export interface DishFilters {
  category_id?: string;
  available?: boolean;
  featured?: boolean;
  q?: string;
  tag?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  offset?: number;
}

export const dishesApi = {
  list: (filters?: DishFilters) =>
    apiClient.get<DishListResponse>("/admin/dishes", { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Dish>(`/admin/dishes/${id}`).then((r) => r.data),

  create: (data: CreateDishRequest) =>
    apiClient.post<Dish>("/admin/dishes", data).then((r) => r.data),

  update: (id: string, data: UpdateDishRequest) =>
    apiClient.put<Dish>(`/admin/dishes/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/admin/dishes/${id}`),
};

// Keep backward-compatible alias
export const itemsApi = dishesApi;
