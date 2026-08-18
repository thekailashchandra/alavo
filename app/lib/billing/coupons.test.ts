import { describe, expect, it } from "vitest";
import {
  discountedAmountPaise,
  normalizeCouponCode,
  describeCoupon,
} from "./coupons";

describe("coupons", () => {
  it("normalizes codes", () => {
    expect(normalizeCouponCode("  launch 50 ")).toBe("LAUNCH50");
  });

  it("applies percent and amount discounts", () => {
    expect(
      discountedAmountPaise(149900, {
        kind: "PERCENT",
        percentOff: 50,
        amountOffPaise: null,
      })
    ).toBe(74950);
    expect(
      discountedAmountPaise(9900, {
        kind: "AMOUNT",
        percentOff: null,
        amountOffPaise: 2000,
      })
    ).toBe(7900);
    expect(
      discountedAmountPaise(9900, {
        kind: "GRANT",
        percentOff: null,
        amountOffPaise: null,
      })
    ).toBe(0);
  });

  it("describes coupons", () => {
    expect(
      describeCoupon({
        kind: "PERCENT",
        percentOff: 20,
        amountOffPaise: null,
        grantSku: null,
      })
    ).toBe("20% off");
  });
});
