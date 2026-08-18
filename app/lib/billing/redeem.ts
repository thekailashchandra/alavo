import { prisma } from "@/lib/prisma";
import { couponError } from "@/lib/billing/coupons";
import { normalizeCouponCode } from "@/lib/billing/coupons";

export async function recordCouponRedemption(opts: {
  couponId: string;
  userId: string;
  paymentId?: string;
}) {
  await prisma.couponRedemption.upsert({
    where: { couponId_userId: { couponId: opts.couponId, userId: opts.userId } },
    update: { paymentId: opts.paymentId ?? undefined },
    create: {
      couponId: opts.couponId,
      userId: opts.userId,
      paymentId: opts.paymentId,
    },
  });
}

export async function loadRedeemableCoupon(code: string, userId: string) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { coupon: null, error: "Enter a coupon code" as const };

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalized },
    include: { _count: { select: { redemptions: true } } },
  });
  const invalid = couponError(coupon);
  if (invalid || !coupon) return { coupon: null, error: invalid ?? "Unknown coupon" };

  const already = await prisma.couponRedemption.findUnique({
    where: { couponId_userId: { couponId: coupon.id, userId } },
  });
  if (already) return { coupon: null, error: "You already used this coupon" };

  if (
    coupon.maxRedemptions != null &&
    coupon._count.redemptions >= coupon.maxRedemptions
  ) {
    return { coupon: null, error: "This coupon has been fully redeemed" };
  }

  return { coupon, error: null };
}
