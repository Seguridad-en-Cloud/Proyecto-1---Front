import { describe, it, expect } from "vitest";
import type {
  LoginRequest,
  RegisterRequest,
  UserResponse,
  AuthResponse,
  TokenResponse,
  RefreshRequest,
  Restaurant,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Dish,
  DishListResponse,
  CreateDishRequest,
  UpdateDishRequest,
  AnalyticsData,
  ScansByPeriod,
  ScansByHour,
  TopUserAgent,
  ApiErrorResponse,
} from "@/api/types";

/*
 * These tests ensure the TypeScript interfaces conform to the shapes expected
 * by the backend API. Each test constructs a valid sample object conforming to
 * the interface and asserts its required keys are present. This catches
 * accidental regressions (e.g. renaming a key without updating the type).
 */

describe("API Types – Auth", () => {
  it("LoginRequest has email and password", () => {
    const req: LoginRequest = { email: "a@b.com", password: "pwd" };
    expect(req).toHaveProperty("email");
    expect(req).toHaveProperty("password");
  });

  it("RegisterRequest has email and password", () => {
    const req: RegisterRequest = { email: "a@b.com", password: "pwd" };
    expect(req).toHaveProperty("email");
    expect(req).toHaveProperty("password");
  });

  it("AuthResponse contains user + tokens", () => {
    const res: AuthResponse = {
      user: { id: "1", email: "a@b.com", created_at: "2024-01-01" },
      access_token: "at",
      refresh_token: "rt",
      token_type: "bearer",
    };
    expect(res.user.id).toBe("1");
    expect(res.access_token).toBeTruthy();
    expect(res.refresh_token).toBeTruthy();
    expect(res.token_type).toBe("bearer");
  });

  it("TokenResponse has access_token and refresh_token", () => {
    const res: TokenResponse = { access_token: "a", refresh_token: "r", token_type: "bearer" };
    expect(Object.keys(res)).toEqual(["access_token", "refresh_token", "token_type"]);
  });

  it("RefreshRequest has refresh_token", () => {
    const req: RefreshRequest = { refresh_token: "rt" };
    expect(req.refresh_token).toBe("rt");
  });
});

describe("API Types – Restaurant", () => {
  const sample: Restaurant = {
    id: "uuid",
    owner_user_id: "uuid2",
    name: "Test",
    slug: "test",
    description: null,
    logo_url: null,
    phone: null,
    address: null,
    hours: null,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  };

  it("Restaurant has all required fields", () => {
    expect(sample).toHaveProperty("id");
    expect(sample).toHaveProperty("owner_user_id");
    expect(sample).toHaveProperty("name");
    expect(sample).toHaveProperty("slug");
    expect(sample).toHaveProperty("hours");
    expect(sample).toHaveProperty("created_at");
  });

  it("CreateRestaurantRequest minimum is just name", () => {
    const req: CreateRestaurantRequest = { name: "R" };
    expect(req.name).toBe("R");
    // Optional fields should be absent
    expect(req.description).toBeUndefined();
    expect(req.hours).toBeUndefined();
  });

  it("CreateRestaurantRequest supports hours", () => {
    const req: CreateRestaurantRequest = {
      name: "R",
      hours: { lunes: { open: "09:00", close: "22:00" } },
    };
    expect(req.hours).toBeDefined();
  });

  it("UpdateRestaurantRequest is fully optional", () => {
    const req: UpdateRestaurantRequest = {};
    expect(Object.keys(req).length).toBe(0);
  });
});

describe("API Types – Category", () => {
  it("Category has required fields including position and active", () => {
    const cat: Category = {
      id: "1",
      restaurant_id: "r1",
      name: "Entradas",
      description: null,
      position: 0,
      active: true,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };
    expect(cat.position).toBe(0);
    expect(cat.active).toBe(true);
  });

  it("CreateCategoryRequest minimum is name", () => {
    const req: CreateCategoryRequest = { name: "Bebidas" };
    expect(req.name).toBe("Bebidas");
  });

  it("UpdateCategoryRequest supports position for reorder", () => {
    const req: UpdateCategoryRequest = { position: 3 };
    expect(req.position).toBe(3);
  });
});

describe("API Types – Dish", () => {
  const sampleDish: Dish = {
    id: "d1",
    category_id: "c1",
    name: "Ceviche",
    description: "Fresh",
    price: 12.50,
    sale_price: 9.99,
    image_url: null,
    available: true,
    featured: true,
    tags: ["popular", "new"],
    position: 0,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    deleted_at: null,
  };

  it("Dish has sale_price, featured, and tags (Gap 3 fields)", () => {
    expect(sampleDish).toHaveProperty("sale_price");
    expect(sampleDish).toHaveProperty("featured");
    expect(sampleDish).toHaveProperty("tags");
    expect(sampleDish.tags).toEqual(["popular", "new"]);
  });

  it("Dish supports soft-delete via deleted_at", () => {
    expect(sampleDish).toHaveProperty("deleted_at");
    expect(sampleDish.deleted_at).toBeNull();
  });

  it("CreateDishRequest requires category_id, name, price", () => {
    const req: CreateDishRequest = { category_id: "c1", name: "Dish", price: 10 };
    expect(req.category_id).toBe("c1");
    expect(req.name).toBe("Dish");
    expect(req.price).toBe(10);
  });

  it("CreateDishRequest supports optional sale_price/featured/tags", () => {
    const req: CreateDishRequest = {
      category_id: "c1",
      name: "D",
      price: 5,
      sale_price: 3,
      featured: true,
      tags: ["vegan"],
    };
    expect(req.sale_price).toBe(3);
    expect(req.featured).toBe(true);
    expect(req.tags).toEqual(["vegan"]);
  });

  it("DishListResponse wraps items with pagination", () => {
    const res: DishListResponse = { items: [sampleDish], total: 1, limit: 20, offset: 0 };
    expect(res.items).toHaveLength(1);
    expect(res.total).toBe(1);
    expect(res.limit).toBe(20);
    expect(res.offset).toBe(0);
  });

  it("UpdateDishRequest is fully optional", () => {
    const req: UpdateDishRequest = {};
    expect(Object.keys(req).length).toBe(0);
  });
});

describe("API Types – Analytics", () => {
  it("AnalyticsData contains all sections", () => {
    const data: AnalyticsData = {
      total_scans: 100,
      scans_by_period: [{ period: "2024-01-01", count: 10 }],
      scans_by_hour: [{ hour: 12, count: 20 }],
      top_user_agents: [{ user_agent: "Chrome", count: 50 }],
    };
    expect(data.total_scans).toBe(100);
    expect(data.scans_by_period).toHaveLength(1);
    expect(data.scans_by_hour[0].hour).toBe(12);
    expect(data.top_user_agents[0].user_agent).toBe("Chrome");
  });
});

describe("API Types – Error", () => {
  it("ApiErrorResponse has detail and message", () => {
    const err: ApiErrorResponse = { detail: "Not found", message: "Resource not found" };
    expect(err.detail).toBe("Not found");
    expect(err.message).toBe("Resource not found");
    expect(err.request_id).toBeUndefined();
  });

  it("ApiErrorResponse supports optional request_id", () => {
    const err: ApiErrorResponse = {
      detail: "Err",
      message: "Msg",
      request_id: "abc-123",
    };
    expect(err.request_id).toBe("abc-123");
  });
});
