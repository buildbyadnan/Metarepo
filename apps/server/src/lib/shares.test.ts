import { describe, it, expect } from "vitest";
import { normalizeRecipientEmail, normalizePermission } from "./shares";

describe("normalizeRecipientEmail", () => {
  it("accepts and lowercases a valid email", () => {
    expect(normalizeRecipientEmail("  Person@Example.COM ")).toBe("person@example.com");
  });

  it("rejects malformed addresses", () => {
    expect(normalizeRecipientEmail("nope")).toBeNull();
    expect(normalizeRecipientEmail("a@b")).toBeNull();
    expect(normalizeRecipientEmail("a b@c.com")).toBeNull();
    expect(normalizeRecipientEmail("@example.com")).toBeNull();
    expect(normalizeRecipientEmail("")).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(normalizeRecipientEmail(null)).toBeNull();
    expect(normalizeRecipientEmail(42)).toBeNull();
    expect(normalizeRecipientEmail({ email: "a@b.co" })).toBeNull();
  });

  it("rejects absurdly long addresses (>320 chars)", () => {
    const long = `${"a".repeat(330)}@example.com`;
    expect(normalizeRecipientEmail(long)).toBeNull();
  });
});

describe("normalizePermission", () => {
  it("accepts read and write, case-insensitively", () => {
    expect(normalizePermission("read")).toBe("read");
    expect(normalizePermission("write")).toBe("write");
    expect(normalizePermission(" WRITE ")).toBe("write");
  });

  it("rejects unknown or non-string permissions", () => {
    expect(normalizePermission("admin")).toBeNull();
    expect(normalizePermission("rw")).toBeNull();
    expect(normalizePermission("")).toBeNull();
    expect(normalizePermission(null)).toBeNull();
    expect(normalizePermission(1)).toBeNull();
  });
});
