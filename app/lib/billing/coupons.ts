import { BILLING_CATALOG, type BillingSku } from "@alavo/brand";
import type { CouponKind } from "@prisma/client";
import { isSku } from "@/lib/billing/entitlements";

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function discountedAmountPaise(listPaise: number, coupon: {
  kind: CouponKind;
  percentOff: number | null;
  amountOffPaise: number | null;
}) {
  if (coupon.kind === "GRANT") return 0;
  if (coupon.kind === "PERCENT") {
    const pct = Math.min(100, Math.max(0, coupon.percentOff ?? 0));
    return Math.max(0, Math.round(listPaise * (1 - pct / 100)));
  }
  return Math.max(0, listPaise - (coupon.amountOffPaise ?? 0));
}

export function couponError(
  coupon: {
    active: boolean;
    expiresAt: Date | null;
  } | null,
  now = new Date()
) {
  if (!coupon || !coupon.active) return "This coupon is not active";
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime()) {
    return "This coupon has expired";
  }
  return null;
}

export function grantSkuForCoupon(coupon: {
  kind: CouponKind;
  grantSku: BillingSku | string | null;
  sku?: BillingSku;
}) {
  if (coupon.kind === "GRANT") {
    const sku = coupon.grantSku;
    return sku && isSku(sku) ? sku : null;
  }
  return null;
}

export function describeCoupon(coupon: {
  kind: CouponKind;
  percentOff: number | null;
  amountOffPaise: number | null;
  grantSku: BillingSku | string | null;
}) {
  if (coupon.kind === "PERCENT") return `${coupon.percentOff ?? 0}% off`;
  if (coupon.kind === "AMOUNT") {
    const inr = Math.round((coupon.amountOffPaise ?? 0) / 100);
    return `₹${inr.toLocaleString("en-IN")} off`;
  }
  const sku = coupon.grantSku && isSku(coupon.grantSku) ? coupon.grantSku : null;
  return sku ? `Unlock ${BILLING_CATALOG[sku].name}` : "Complimentary unlock";
}
