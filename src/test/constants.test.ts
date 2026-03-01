import { describe, it, expect } from "vitest";
import { TOKEN_KEYS } from "@/lib/constants";

describe("constants", () => {
  it("TOKEN_KEYS has correct access key", () => {
    expect(TOKEN_KEYS.ACCESS).toBe("livemenu_access_token");
  });

  it("TOKEN_KEYS has correct refresh key", () => {
    expect(TOKEN_KEYS.REFRESH).toBe("livemenu_refresh_token");
  });

  it("TOKEN_KEYS is frozen (readonly)", () => {
    expect(Object.keys(TOKEN_KEYS)).toEqual(["ACCESS", "REFRESH"]);
  });
});
