import { describe, it, expect } from "vitest";
import { PRODUCTS, getProductById } from "./index.js";

describe("PRODUCTS", () => {
  it("has at least one product", () => {
    expect(PRODUCTS.length).toBeGreaterThan(0);
  });

  it("has valid product structure", () => {
    const product = PRODUCTS[0];
    expect(product.id).toBeTruthy();
    expect(product.name).toBeTruthy();
    expect(product.amount).toBeGreaterThan(0);
    expect(product.currency).toMatch(/^[A-Z]{3}$/);
    expect(product.features.length).toBeGreaterThan(0);
  });
});

describe("getProductById", () => {
  it("returns product for valid id", () => {
    const product = getProductById("starter");
    expect(product).toBeDefined();
    expect(product?.id).toBe("starter");
  });

  it("returns undefined for invalid id", () => {
    expect(getProductById("nonexistent")).toBeUndefined();
  });
});
