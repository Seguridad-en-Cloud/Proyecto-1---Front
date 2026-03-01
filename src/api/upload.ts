import apiClient from "./client";

export interface UploadResponse {
  thumbnail: string;
  medium: string;
  large: string;
}

export const uploadApi = {
  /**
   * Upload an image. Returns URLs for thumbnail, medium, and large variants.
   * @param file - The image file to upload
   * @param prefix - "logos" for restaurant logos, "dishes" for dish images
   */
  upload: async (file: File, prefix: "logos" | "dishes" = "dishes"): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<UploadResponse>(`/admin/upload?prefix=${prefix}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** Delete an uploaded image by its URL */
  delete: (url: string) => {
    // Extract the object key (filename path) from the full URL
    // e.g., "http://localhost:9000/livemenu/dishes/large/abc.webp" → "dishes/large/abc.webp"
    const parts = url.split("/livemenu/");
    const filename = parts.length > 1 ? parts[parts.length - 1] : url;
    return apiClient.delete(`/admin/upload/${filename}`);
  },
};
