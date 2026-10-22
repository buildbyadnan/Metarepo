import { describe, it, expect } from "vitest";
import { generateState, validateState } from "./google";

describe("generateState", () => {
  it("returns a 43-character base64url string", () => {
    const state = generateState();
    expect(state).toHaveLength(43);
    expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("generates unique values", () => {
    const a = generateState();
    const b = generateState();
    expect(a).not.toBe(b);
  });
});

describe("validateState", () => {
  it("returns true for matching strings", () => {
    expect(validateState("abc", "abc")).toBe(true);
  });

  it("returns false for different strings", () => {
    expect(validateState("abc", "def")).toBe(false);
  });

  it("returns false for different lengths", () => {
    expect(validateState("abc", "abcd")).toBe(false);
  });
});
