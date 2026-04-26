import apiClient from "./client";

export interface UploadResponse {
  thumbnail: string;
  medium: string;
  large: string;
}

/**
 * Extract the object key from a public URL produced by the backend.
 *
 * The backend always returns URLs shaped as ``<public-prefix>/<key>`` where
 * the key starts with ``logos/`` or ``dishes/``. We don't know the prefix at
 * build time (it depends on whether the deployment uses MinIO/S3 or GCS, and
 * whether GCS is fronted by a CDN), so we locate the first ``/logos/`` or
 * ``/dishes/`` segment and treat everything from there onward as the key.
 */
function extractObjectKey(url: string): string {
  const markers = ["/logos/", "/dishes/"];
  for (const marker of markers) {
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      return url.slice(idx + 1);
    }
  }
  // Fallback: if the URL doesn't match a known prefix, assume it already is
  // the key (e.g. a relative path returned by a future backend version).
  return url;
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
    const filename = extractObjectKey(url);
    return apiClient.delete(`/admin/upload/${filename}`);
  },
};
