import { BILLING_CATALOG, type BillingSku } from "@alavo/brand";
import { sendMail } from "@/lib/email";
import { adminEmails } from "@/lib/admin-emails";
import { getEntitlementSnapshot } from "@/lib/billing/access";
import {
  renderAdminSaleHtml,
  renderUserReceiptHtml,
  type ReceiptInput,
} from "@/lib/billing/receipt";

export type SubscriptionNoticeInput = {
  userId: string;
  userEmail: string;
  sku: BillingSku;
  amountPaise: number;
  currency?: string;
  paidAt?: Date;
  paymentId?: string | null;
  razorpayPaymentId?: string | null;
  couponCode?: string | null;
  source: ReceiptInput["source"];
};

export async function notifySubscription(input: SubscriptionNoticeInput) {
  const billing = await getEntitlementSnapshot(input.userId);
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://app.alavo.cc"
  ).replace(/\/$/, "");
  const paidAt = input.paidAt ?? new Date();
  const receipt: ReceiptInput = {
    userEmail: input.userEmail,
    sku: input.sku,
    amountPaise: input.amountPaise,
    currency: input.currency || "INR",
    paidAt,
    paymentId: input.paymentId,
    razorpayPaymentId: input.razorpayPaymentId,
    couponCode: input.couponCode,
    validUntil: billing.planExpiresAt,
    lifetime: billing.lifetime,
    displayPlan: billing.displayPlan,
    source: input.source,
    appUrl,
  };

  const item = BILLING_CATALOG[input.sku];
  const userResult = await sendMail({
    to: input.userEmail,
    subject: `Your Alavo receipt — ${item.name}`,
    html: renderUserReceiptHtml(receipt),
  });
  if (!userResult.ok) {
    console.warn("[Alavo] User subscription email failed:", userResult.error);
  }

  const admins = [...adminEmails()].filter(
    (email) => email !== input.userEmail.trim().toLowerCase()
  );
  if (admins.length > 0) {
    const adminResult = await sendMail({
      to: admins.join(", "),
      subject: `New subscription: ${input.userEmail} · ${item.name}`,
      html: renderAdminSaleHtml(receipt),
    });
    if (!adminResult.ok) {
      console.warn("[Alavo] Admin subscription email failed:", adminResult.error);
    }
    return { user: userResult.ok, admin: adminResult.ok };
  }

  return { user: userResult.ok, admin: true };
}
