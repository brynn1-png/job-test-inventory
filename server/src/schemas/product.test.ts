import { describe, expect, it } from "vitest";
import { productSchema } from "./product.js";

describe("productSchema", () => {
  const validProduct = {
    name: "Wireless Keyboard",
    barcode: "4800000000017",
    unit: "bottle",
    minimumStock: 12,
  };

  it("accepts a complete product", () => {
    expect(productSchema.parse(validProduct)).toMatchObject(validProduct);
  });

  it("rejects negative minimum stock", () => {
    expect(() => productSchema.parse({ ...validProduct, minimumStock: -1 })).toThrow();
  });

  it("rejects whitespace in barcodes", () => {
    expect(() => productSchema.parse({ ...validProduct, barcode: "bad barcode" })).toThrow();
  });
});
