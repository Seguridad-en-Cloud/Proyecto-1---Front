import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Mock authApi
vi.mock("@/api/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

// Helper component that exposes auth state
function AuthConsumer() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.email : "none"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("is unauthenticated by default", async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("restores user from localStorage", async () => {
    const storedUser = { id: "1", email: "test@example.com", created_at: "2024-01-01" };
    localStorage.setItem("livemenu_access_token", "some-token");
    localStorage.setItem("livemenu_user", JSON.stringify(storedUser));

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toBe("test@example.com");
  });

  it("clears user if stored JSON is invalid", async () => {
    localStorage.setItem("livemenu_access_token", "token");
    localStorage.setItem("livemenu_user", "INVALID JSON");

    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(localStorage.getItem("livemenu_access_token")).toBeNull();
    expect(localStorage.getItem("livemenu_refresh_token")).toBeNull();
  });

  it("uses login to store tokens and user", async () => {
    const { authApi } = await import("@/api/auth");
    const mockResponse = {
      user: { id: "2", email: "new@test.com", created_at: "2024-01-01" },
      access_token: "at",
      refresh_token: "rt",
      token_type: "bearer",
    };
    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    let authHook: ReturnType<typeof useAuth>;
    function LoginHelper() {
      authHook = useAuth();
      return null;
    }

    await act(async () => {
      render(
        <AuthProvider>
          <LoginHelper />
          <AuthConsumer />
        </AuthProvider>
      );
    });

    await act(async () => {
      await authHook!.login({ email: "new@test.com", password: "pwd" });
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toBe("new@test.com");
    expect(localStorage.getItem("livemenu_access_token")).toBe("at");
    expect(localStorage.getItem("livemenu_refresh_token")).toBe("rt");
  });

  it("logout clears tokens and user", async () => {
    const { authApi } = await import("@/api/auth");
    vi.mocked(authApi.logout).mockResolvedValue({} as any);

    localStorage.setItem("livemenu_access_token", "token");
    localStorage.setItem("livemenu_refresh_token", "rtoken");
    localStorage.setItem("livemenu_user", JSON.stringify({ id: "1", email: "x@y.com", created_at: "2024-01-01" }));

    let authHook: ReturnType<typeof useAuth>;
    function LogoutHelper() {
      authHook = useAuth();
      return null;
    }

    await act(async () => {
      render(
        <AuthProvider>
          <LogoutHelper />
          <AuthConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("true");

    await act(async () => {
      await authHook!.logout();
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(localStorage.getItem("livemenu_access_token")).toBeNull();
    expect(localStorage.getItem("livemenu_refresh_token")).toBeNull();
    expect(localStorage.getItem("livemenu_user")).toBeNull();
  });

  it("throws error when useAuth is used outside AuthProvider", () => {
    // Suppress React error boundary console.error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow("useAuth must be used within AuthProvider");
    consoleSpy.mockRestore();
  });
});
