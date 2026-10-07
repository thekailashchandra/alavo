import { prisma } from "@/lib/prisma";
import { applyPaidSku } from "@/lib/billing/apply-purchase";
import { isSku } from "@/lib/billing/entitlements";
import { notifySubscription } from "@/lib/billing/notify";
import { recordCouponRedemption } from "@/lib/billing/redeem";
import type { BillingSku } from "@alavo/brand";

const paymentInclude = {
  user: { select: { email: true } },
  coupon: { select: { code: true } },
} as const;

async function findPayment(opts: {
  paymentLinkId?: string;
  notes?: Record<string, string>;
  userId?: string;
  referenceId?: string;
}) {
  if (opts.paymentLinkId) {
    const byLink = await prisma.payment.findUnique({
      where: { razorpayPaymentLinkId: opts.paymentLinkId },
      include: paymentInclude,
    });
    if (byLink) {
      if (opts.userId && byLink.userId !== opts.userId) return null;
      return byLink;
    }
  }
  if (opts.notes?.paymentId) {
    const byNote = await prisma.payment.findUnique({
      where: { id: opts.notes.paymentId },
      include: paymentInclude,
    });
    if (byNote && (!opts.userId || byNote.userId === opts.userId)) return byNote;
  }
  if (opts.userId && opts.referenceId) {
    return prisma.payment.findFirst({
      where: {
        userId: opts.userId,
        OR: [
          { id: opts.referenceId },
          { razorpayPaymentLinkId: opts.paymentLinkId },
        ],
      },
      include: paymentInclude,
    });
  }
  return null;
}

/**
 * The product is the SKU stored when checkout created the payment row.
 * Webhook notes are not allowed to upgrade that SKU.
 */
export function fulfillmentSku(paymentSku: string, notes?: Record<string, string>) {
  void notes;
  return paymentSku;
}

export async function fulfillPaidPayment(opts: {
  paymentLinkId?: string;
  paymentId?: string;
  orderId?: string;
  notes?: Record<string, string>;
  userId?: string;
  referenceId?: string;
}) {
  const payment = await findPayment(opts);
  if (!payment) return { ok: false as const, reason: "not-found" };
  if (payment.status === "PAID") return { ok: true as const, alreadyPaid: true };

  const sku = fulfillmentSku(payment.sku, opts.notes);
  if (!isSku(sku)) return { ok: false as const, reason: "unknown-sku" };

  const paidAt = new Date();
  const claimed = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: "CREATED" },
      data: {
        status: "PAID",
        razorpayPaymentId: opts.paymentId ?? payment.razorpayPaymentId,
        razorpayOrderId: opts.orderId ?? payment.razorpayOrderId,
        paidAt,
      },
    });
    if (updated.count !== 1) return false;
    await applyPaidSku(payment.userId, sku as BillingSku, tx);
    if (payment.couponId) {
      await recordCouponRedemption(
        {
          couponId: payment.couponId,
          userId: payment.userId,
          paymentId: payment.id,
        },
        tx
      );
    }
    return true;
  });

  if (!claimed) return { ok: true as const, alreadyPaid: true };

  await notifySubscription({
    userId: payment.userId,
    userEmail: payment.user.email,
    sku: sku as BillingSku,
    amountPaise: payment.amountPaise,
    currency: payment.currency,
    paidAt,
    paymentId: payment.id,
    razorpayPaymentId: opts.paymentId ?? payment.razorpayPaymentId,
    couponCode: payment.coupon?.code ?? null,
    source: "payment",
  }).catch((error) => {
    console.warn("[Alavo] Subscription notify failed:", error);
  });

  return { ok: true as const, alreadyPaid: false };
}
