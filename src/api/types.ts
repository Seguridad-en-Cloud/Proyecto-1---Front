// ─── Auth ─────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: UserResponse;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

// ─── Restaurant ───────────────────────────────────────────
export interface Restaurant {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  hours: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRestaurantRequest {
  name: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  address?: string;
  hours?: Record<string, unknown>;
}

export interface UpdateRestaurantRequest {
  name?: string;
  description?: string;
  logo_url?: string;
  phone?: string;
  address?: string;
  hours?: Record<string, unknown>;
}

// ─── Category ─────────────────────────────────────────────
export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  active?: boolean;
  position?: number;
}

// ─── Dish ─────────────────────────────────────────────────
export interface Dish {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  available: boolean;
  featured: boolean;
  tags: string[] | null;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DishListResponse {
  items: Dish[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateDishRequest {
  category_id: string;
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  available?: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface UpdateDishRequest {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  sale_price?: number;
  image_url?: string;
  available?: boolean;
  featured?: boolean;
  tags?: string[];
  position?: number;
}

// ─── Analytics ────────────────────────────────────────────
export interface ScansByPeriod {
  period: string;
  count: number;
}

export interface ScansByHour {
  hour: number;
  count: number;
}

export interface TopUserAgent {
  user_agent: string;
  count: number;
}

export interface AnalyticsData {
  total_scans: number;
  scans_by_period: ScansByPeriod[];
  scans_by_hour: ScansByHour[];
  top_user_agents: TopUserAgent[];
}

// ─── API Error ────────────────────────────────────────────
export interface ApiErrorResponse {
  detail: string;
  message: string;
  request_id?: string;
}
