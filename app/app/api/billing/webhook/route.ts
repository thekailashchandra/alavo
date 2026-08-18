import { NextRequest } from "next/server";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { applyPaidSku } from "@/lib/billing/apply-purchase";
import { isSku } from "@/lib/billing/entitlements";
import { verifyWebhookSignature } from "@/lib/billing/razorpay";
import { recordCouponRedemption } from "@/lib/billing/redeem";
import type { BillingSku } from "@alavo/brand";

export const runtime = "nodejs";

type RazorpayEntity = {
  id?: string;
  status?: string;
  reference_id?: string;
  notes?: Record<string, string>;
  order_id?: string;
};

async function fulfill(opts: {
  paymentLinkId?: string;
  paymentId?: string;
  orderId?: string;
  notes?: Record<string, string>;
}) {
  const payment = opts.paymentLinkId
    ? await prisma.payment.findUnique({
        where: { razorpayPaymentLinkId: opts.paymentLinkId },
      })
    : opts.notes?.paymentId
      ? await prisma.payment.findUnique({ where: { id: opts.notes.paymentId } })
      : null;

  if (!payment) return false;
  if (payment.status === "PAID") return true;

  const sku = (opts.notes?.sku || payment.sku) as string;
  if (!isSku(sku)) return false;

  await applyPaidSku(payment.userId, sku as BillingSku);
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      razorpayPaymentId: opts.paymentId ?? payment.razorpayPaymentId,
      razorpayOrderId: opts.orderId ?? payment.razorpayOrderId,
      paidAt: new Date(),
    },
  });
  if (payment.couponId) {
    await recordCouponRedemption({
      couponId: payment.couponId,
      userId: payment.userId,
      paymentId: payment.id,
    });
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    if (!verifyWebhookSignature(raw, signature)) {
      return jsonError("Invalid webhook signature", 400);
    }

    const event = JSON.parse(raw) as {
      event?: string;
      payload?: {
        payment_link?: { entity?: RazorpayEntity };
        payment?: { entity?: RazorpayEntity };
      };
    };

    const link = event.payload?.payment_link?.entity;
    const payment = event.payload?.payment?.entity;
    const notes = link?.notes ?? {};

    if (event.event === "payment_link.paid" || link?.status === "paid") {
      await fulfill({
        paymentLinkId: link?.id,
        paymentId: payment?.id,
        orderId: payment?.order_id,
        notes,
      });
    }

    return jsonOk({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
