import { NextRequest } from "next/server";
import { z } from "zod";
import { BILLING_CATALOG, BILLING_SKUS, type BillingSku } from "@alavo/brand";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { enforceRateLimit } from "@/lib/with-rate-limit";
import { prisma } from "@/lib/prisma";
import { applyPaidSku, amountPaiseForSku } from "@/lib/billing/apply-purchase";
import { isSku } from "@/lib/billing/entitlements";
import {
  createPaymentLink,
  razorpayConfigured,
} from "@/lib/billing/razorpay";
import { discountedAmountPaise, grantSkuForCoupon } from "@/lib/billing/coupons";
import { loadRedeemableCoupon, recordCouponRedemption } from "@/lib/billing/redeem";
import { getEntitlementSnapshot } from "@/lib/billing/access";

const checkoutSchema = z.object({
  sku: z.enum(BILLING_SKUS as unknown as [BillingSku, ...BillingSku[]]),
  couponCode: z.string().max(24).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "billing:checkout", 10, 60_000);
    if (limited) return limited;

    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { sku, couponCode } = checkoutSchema.parse(await req.json());
    if (!isSku(sku)) return jsonError("Unknown plan", 400);

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
      /\/$/,
      ""
    );

    let couponId: string | null = null;
    let amountPaise = amountPaiseForSku(sku);
    let grantNow: BillingSku | null = null;

    if (couponCode?.trim()) {
      const loaded = await loadRedeemableCoupon(couponCode, user!.id);
      if (loaded.error || !loaded.coupon) {
        return jsonError(loaded.error ?? "Invalid coupon", 400);
      }
      couponId = loaded.coupon.id;
      const grant = grantSkuForCoupon(loaded.coupon);
      if (grant) {
        grantNow = grant;
        amountPaise = 0;
      } else {
        amountPaise = discountedAmountPaise(amountPaise, loaded.coupon);
        if (amountPaise === 0) grantNow = sku;
      }
    }

    if (grantNow) {
      await applyPaidSku(user!.id, grantNow);
      if (couponId) {
        await recordCouponRedemption({
          couponId,
          userId: user!.id,
        });
      }
      return jsonOk({
        url: `${appUrl}/settings/subscription?paid=1&sku=${grantNow}`,
        granted: true,
        billing: await getEntitlementSnapshot(user!.id),
      });
    }

    if (!razorpayConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return jsonError("Payments are not configured yet.", 503);
      }
      await applyPaidSku(user!.id, sku);
      if (couponId) {
        await recordCouponRedemption({ couponId, userId: user!.id });
      }
      return jsonOk({
        url: `${appUrl}/settings/subscription?paid=1&sku=${sku}&dev=1`,
        dev: true,
      });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: user!.id,
        sku,
        amountPaise,
        currency: "INR",
        status: "CREATED",
        couponId,
      },
    });

    const link = await createPaymentLink({
      sku,
      paymentId: payment.id,
      userId: user!.id,
      email: user!.email,
      callbackUrl: `${appUrl}/settings/subscription`,
      amountPaise,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { razorpayPaymentLinkId: link.id },
    });

    return jsonOk({
      url: link.shortUrl,
      paymentId: payment.id,
      amountInr: amountPaise / 100,
      listAmountInr: BILLING_CATALOG[sku].amountInr,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
