import { describe, it, expect } from "vitest";
import { discountedValue } from "./useBackDiscount";

describe("back redirect discount", () => {
  it("gives 40% off on each back attempt", () => {
    expect(discountedValue(100, 1)).toBe(60);
    expect(discountedValue(100, 2)).toBe(36);
  });
  it("never goes below R$ 18", () => {
    expect(discountedValue(100, 3)).toBe(21.6);
    expect(discountedValue(100, 4)).toBe(18);
    expect(discountedValue(100, 9)).toBe(18);
  });
  it("keeps prices already at or under R$ 18", () => {
    expect(discountedValue(15, 3)).toBe(15);
  });
});
