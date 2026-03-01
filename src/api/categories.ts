import apiClient from "./client";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "./types";

export const categoriesApi = {
  list: () =>
    apiClient.get<Category[]>("/admin/categories").then((r) => r.data),

  create: (data: CreateCategoryRequest) =>
    apiClient.post<Category>("/admin/categories", data).then((r) => r.data),

  update: (id: string, data: UpdateCategoryRequest) =>
    apiClient.put<Category>(`/admin/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/admin/categories/${id}`),

  reorder: (ordered_ids: string[]) =>
    apiClient.patch("/admin/categories/reorder", { ordered_ids }),
};
