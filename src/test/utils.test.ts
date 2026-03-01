import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn – class name merge utility", () => {
  it("merges simple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("merges conflicting tailwind classes (last wins)", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("returns empty string when no args given", () => {
    expect(cn()).toBe("");
  });

  it("handles arrays of classes", () => {
    expect(cn(["p-2", "m-4"])).toBe("p-2 m-4");
  });

  it("deduplicates padding classes", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("handles undefined/null values gracefully", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });
});
