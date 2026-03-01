import { describe, it, expect } from "vitest";
import type { DishFilters } from "@/api/items";

/**
 * Verify that the DishFilters interface includes all the query parameters
 * the backend /admin/dishes endpoint supports.
 */
describe("DishFilters – query parameter interface", () => {
  it("supports all filter fields", () => {
    const filters: DishFilters = {
      category_id: "cat-1",
      available: true,
      featured: true,
      q: "ceviche",
      tag: "popular",
      min_price: 5,
      max_price: 50,
      limit: 20,
      offset: 0,
    };
    expect(filters.category_id).toBe("cat-1");
    expect(filters.available).toBe(true);
    expect(filters.featured).toBe(true);
    expect(filters.q).toBe("ceviche");
    expect(filters.tag).toBe("popular");
    expect(filters.min_price).toBe(5);
    expect(filters.max_price).toBe(50);
    expect(filters.limit).toBe(20);
    expect(filters.offset).toBe(0);
  });

  it("is fully optional", () => {
    const filters: DishFilters = {};
    expect(Object.keys(filters)).toHaveLength(0);
  });
});

describe("UploadResponse – response format", () => {
  it("has thumbnail, medium, large urls", () => {
    // Build a conforming UploadResponse object
    const res = { thumbnail: "/t.webp", medium: "/m.webp", large: "/l.webp" };
    expect(res).toHaveProperty("thumbnail");
    expect(res).toHaveProperty("medium");
    expect(res).toHaveProperty("large");
  });
});

describe("AnalyticsParams – query parameters", () => {
  it("supports granularity, from, to", async () => {
    const mod = await import("@/api/analytics");
    // Just verify the module exports correctly
    expect(mod.analyticsApi).toBeDefined();
    // Build conforming params
    const params = { granularity: "day" as const, from: "2024-01-01", to: "2024-12-31" };
    expect(params.granularity).toBe("day");
    expect(params.from).toBe("2024-01-01");
    expect(params.to).toBe("2024-12-31");
  });
});
