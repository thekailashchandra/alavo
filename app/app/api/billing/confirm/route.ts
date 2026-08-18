import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { applyPaidSku } from "@/lib/billing/apply-purchase";
import { isSku } from "@/lib/billing/entitlements";
import { getEntitlementSnapshot } from "@/lib/billing/access";
import { verifyPaymentLinkCallback } from "@/lib/billing/razorpay";
import { recordCouponRedemption } from "@/lib/billing/redeem";
import type { BillingSku } from "@alavo/brand";

const confirmSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_payment_link_id: z.string().min(1),
  razorpay_payment_link_reference_id: z.string().min(1),
  razorpay_payment_link_status: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const params = confirmSchema.parse(await req.json());
    const valid = verifyPaymentLinkCallback({
      paymentLinkId: params.razorpay_payment_link_id,
      paymentLinkRef: params.razorpay_payment_link_reference_id,
      paymentLinkStatus: params.razorpay_payment_link_status,
      paymentId: params.razorpay_payment_id,
      signature: params.razorpay_signature,
    });
    if (!valid) return jsonError("Invalid payment signature", 400);

    const payment = await prisma.payment.findFirst({
      where: {
        userId: user!.id,
        OR: [
          { razorpayPaymentLinkId: params.razorpay_payment_link_id },
          { id: params.razorpay_payment_link_reference_id },
        ],
      },
    });
    if (!payment) return jsonError("Payment not found", 404);
    if (payment.status !== "PAID") {
      const sku = payment.sku as BillingSku;
      if (!isSku(sku)) return jsonError("Unknown SKU", 400);
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          razorpayPaymentId: params.razorpay_payment_id,
          paidAt: new Date(),
        },
      });
      await applyPaidSku(user!.id, sku);
      if (payment.couponId) {
        await recordCouponRedemption({
          couponId: payment.couponId,
          userId: user!.id,
          paymentId: payment.id,
        });
      }
    }

    return jsonOk({ billing: await getEntitlementSnapshot(user!.id) });
  } catch (error) {
    return handleApiError(error);
  }
}
