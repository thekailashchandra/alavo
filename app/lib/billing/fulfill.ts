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
    if (byLink && (!opts.userId || byLink.userId === opts.userId)) return byLink;
  }
  if (opts.notes?.paymentId) {
    return prisma.payment.findUnique({
      where: { id: opts.notes.paymentId },
      include: paymentInclude,
    });
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

  const sku = (opts.notes?.sku || payment.sku) as string;
  if (!isSku(sku)) return { ok: false as const, reason: "unknown-sku" };

  await applyPaidSku(payment.userId, sku as BillingSku);
  const paidAt = new Date();
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      razorpayPaymentId: opts.paymentId ?? payment.razorpayPaymentId,
      razorpayOrderId: opts.orderId ?? payment.razorpayOrderId,
      paidAt,
    },
  });
  if (payment.couponId) {
    await recordCouponRedemption({
      couponId: payment.couponId,
      userId: payment.userId,
      paymentId: payment.id,
    });
  }

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