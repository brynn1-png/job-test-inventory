import { describe, expect, it } from "vitest";
import { calculateNewQuantity } from "./stock.js";

describe("calculateNewQuantity", () => {
  it("adds received stock", () => {
    expect(calculateNewQuantity(12, 8, "STOCK_IN")).toBe(20);
  });

  it("subtracts released stock", () => {
    expect(calculateNewQuantity(12, 5, "STOCK_OUT")).toBe(7);
  });

  it("prevents negative inventory", () => {
    expect(() => calculateNewQuantity(4, 5, "STOCK_OUT")).toThrow("exceeds the available inventory");
  });

  it("rejects non-positive quantities", () => {
    expect(() => calculateNewQuantity(4, 0, "STOCK_IN")).toThrow("positive whole number");
  });
});

