import { describe, it, expect } from "vitest";
import { hmacHex, constantTimeCompare, fetchWithTimeout, encrypt, decrypt } from "./index.js";

describe("hmacHex", () => {
  it("returns consistent hex digest", async () => {
    const a = await hmacHex("secret", "data");
    const b = await hmacHex("secret", "data");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns different digests for different inputs", async () => {
    const a = await hmacHex("secret", "data1");
    const b = await hmacHex("secret", "data2");
    expect(a).not.toBe(b);
  });
});

describe("constantTimeCompare", () => {
  it("returns true for equal strings", async () => {
    expect(await constantTimeCompare("abc", "abc")).toBe(true);
  });

  it("returns false for different strings", async () => {
    expect(await constantTimeCompare("abc", "def")).toBe(false);
  });

  it("returns false for different lengths", async () => {
    expect(await constantTimeCompare("abc", "abcd")).toBe(false);
  });
});

describe("fetchWithTimeout", () => {
  it("rejects after timeout", async () => {
    await expect(fetchWithTimeout("https://httpbin.org/delay/10", {}, 50)).rejects.toThrow();
  });
});

describe("encrypt/decrypt", () => {
  const secret = "test-secret-key-for-encryption";

  it("roundtrips plaintext", async () => {
    const plaintext = "my-super-secret-refresh-token";
    const encrypted = await encrypt(plaintext, secret);
    const decrypted = await decrypt(encrypted, secret);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext for same plaintext (random IV)", async () => {
    const plaintext = "same-token";
    const a = await encrypt(plaintext, secret);
    const b = await encrypt(plaintext, secret);
    expect(a).not.toBe(b);
  });

  it("fails to decrypt with wrong secret", async () => {
    const encrypted = await encrypt("data", secret);
    await expect(decrypt(encrypted, "wrong-secret")).rejects.toThrow();
  });

  it("handles empty string", async () => {
    const encrypted = await encrypt("", secret);
    const decrypted = await decrypt(encrypted, secret);
    expect(decrypted).toBe("");
  });

  it("handles long strings", async () => {
    const plaintext = "x".repeat(10_000);
    const encrypted = await encrypt(plaintext, secret);
    const decrypted = await decrypt(encrypted, secret);
    expect(decrypted).toBe(plaintext);
  });
});
