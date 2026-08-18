import { describe, expect, it } from "vitest";
import {
  receiptNumber,
  renderAdminSaleHtml,
  renderUserReceiptHtml,
  validityLabel,
} from "./receipt";

describe("receipt helpers", () => {
  it("builds a stable receipt number", () => {
    expect(
      receiptNumber("clxyz123abcdef", new Date("2026-08-18T06:00:00.000Z"))
    ).toBe("ALV-20260818-ABCDEF");
  });

  it("describes lifetime and dated validity", () => {
    expect(validityLabel({ lifetime: true, validUntil: null })).toMatch(/Lifetime/);
    expect(
      validityLabel({
        lifetime: false,
        validUntil: "2026-09-17T06:00:00.000Z",
      })
    ).toMatch(/September 2026/);
  });

  it("renders user and admin emails with amount and plan", () => {
    const input = {
      userEmail: "buyer@example.com",
      sku: "PRO_MONTHLY" as const,
      amountPaise: 9900,
      paidAt: new Date("2026-08-18T06:00:00.000Z"),
      paymentId: "pay_abc123",
      razorpayPaymentId: "pay_RZP1",
      couponCode: null,
      validUntil: "2026-09-17T06:00:00.000Z",
      lifetime: false,
      displayPlan: "Pro",
      source: "payment" as const,
      appUrl: "https://app.alavo.cc",
    };
    const userHtml = renderUserReceiptHtml(input);
    const adminHtml = renderAdminSaleHtml(input);
    expect(userHtml).toContain("₹99");
    expect(userHtml).toContain("Pro monthly");
    expect(userHtml).toContain("pay_RZP1");
    expect(adminHtml).toContain("buyer@example.com");
    expect(adminHtml).toContain("New Alavo subscription");
  });
});
