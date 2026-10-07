import { beforeEach, describe, expect, it, vi } from "vitest";

const applyPaidSku = vi.fn();
const notifySubscription = vi.fn();

let paymentStatus = "CREATED";
const payment = {
  id: "pay_1",
  userId: "user_1",
  sku: "PRO_MONTHLY",
  amountPaise: 500,
  currency: "USD",
  status: "CREATED",
  razorpayPaymentLinkId: "plink_1",
  razorpayPaymentId: null,
  razorpayOrderId: null,
  couponId: null,
  user: { email: "person@example.com" },
  coupon: null,
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    payment: {
      findUnique: vi.fn(async () => ({ ...payment, status: paymentStatus })),
      findFirst: vi.fn(),
      updateMany: vi.fn(async () => {
        if (paymentStatus !== "CREATED") return { count: 0 };
        paymentStatus = "PAID";
        return { count: 1 };
      }),
    },
    $transaction: async (fn: (tx: unknown) => Promise<boolean>) =>
      fn({
        payment: {
          updateMany: async () => {
            if (paymentStatus !== "CREATED") return { count: 0 };
            paymentStatus = "PAID";
            return { count: 1 };
          },
        },
      }),
  },
}));

vi.mock("@/lib/billing/apply-purchase", () => ({
  applyPaidSku: (...args: unknown[]) => applyPaidSku(...args),
}));

vi.mock("@/lib/billing/notify", () => ({
  notifySubscription: (...args: unknown[]) => notifySubscription(...args),
}));

vi.mock("@/lib/billing/redeem", () => ({
  recordCouponRedemption: vi.fn(),
}));

describe("fulfillPaidPayment", () => {
  beforeEach(() => {
    paymentStatus = "CREATED";
    applyPaidSku.mockReset();
    notifySubscription.mockReset();
    notifySubscription.mockResolvedValue(undefined);
  });

  it("grants the stored SKU once when the same payment is processed twice", async () => {
    const { fulfillPaidPayment } = await import("@/lib/billing/fulfill");
    const first = await fulfillPaidPayment({
      paymentLinkId: "plink_1",
      paymentId: "pay_rzp",
      notes: { sku: "LIFETIME" },
    });
    const second = await fulfillPaidPayment({
      paymentLinkId: "plink_1",
      paymentId: "pay_rzp",
      notes: { sku: "LIFETIME" },
    });

    expect(first).toMatchObject({ ok: true, alreadyPaid: false });
    expect(second).toMatchObject({ ok: true, alreadyPaid: true });
    expect(applyPaidSku).toHaveBeenCalledTimes(1);
    expect(applyPaidSku).toHaveBeenCalledWith("user_1", "PRO_MONTHLY", expect.anything());
  });

  it("does not let webhook notes replace the stored SKU", async () => {
    const { fulfillmentSku } = await import("@/lib/billing/fulfill");
    expect(fulfillmentSku("PRO_MONTHLY", { sku: "LIFETIME" })).toBe("PRO_MONTHLY");
  });
});
