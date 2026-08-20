import { format, parseISO } from "date-fns";
import { BILLING_CATALOG, formatMinorUnits, type BillingSku } from "@alavo/brand";

export type ReceiptInput = {
  userEmail: string;
  sku: BillingSku;
  amountPaise: number;
  currency?: string;
  paidAt: Date;
  paymentId?: string | null;
  razorpayPaymentId?: string | null;
  couponCode?: string | null;
  validUntil: string | null;
  lifetime: boolean;
  displayPlan: string;
  source: "payment" | "coupon" | "admin" | "dev";
  appUrl: string;
};

export function receiptNumber(paymentId: string | null | undefined, paidAt: Date) {
  const day = paidAt.toISOString().slice(0, 10).replace(/-/g, "");
  const tail = (paymentId || "XXXXXX").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return `ALV-${day}-${tail || "XXXXXX"}`;
}

export function validityLabel(input: {
  lifetime: boolean;
  validUntil: string | null;
}) {
  if (input.lifetime) return "Lifetime — no expiry";
  if (!input.validUntil) return "See Plans & billing in the app";
  const day = input.validUntil.slice(0, 10);
  return format(parseISO(`${day}T12:00:00`), "d MMMM yyyy");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatReceiptAmount(input: ReceiptInput) {
  return formatMinorUnits(
    input.amountPaise,
    input.currency === "USD" ? "USD" : "INR"
  );
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;color:#6B7280;font-size:13px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#111827;font-size:13px;text-align:right;font-weight:600;">${value}</td>
    </tr>`;
}

export function renderUserReceiptHtml(input: ReceiptInput) {
  const item = BILLING_CATALOG[input.sku];
  const invoice = receiptNumber(input.paymentId, input.paidAt);
  const amount = formatReceiptAmount(input);
  const validity = validityLabel(input);
  const sourceNote =
    input.source === "coupon"
      ? "Applied with a promotional coupon."
      : input.source === "admin"
        ? "Complimentary access granted by Alavo."
        : input.source === "dev"
          ? "Development unlock."
          : "Paid via Razorpay.";

  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111827;background:#FCF9FD;padding:24px;">
    <p style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7B08E0;margin:0 0 8px;">Alavo</p>
    <h1 style="font-size:22px;margin:0 0 8px;">Payment receipt</h1>
    <p style="color:#6B7280;font-size:14px;line-height:1.5;margin:0 0 20px;">
      Thanks for supporting Alavo. This is your receipt and plan validity.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #EDE4F6;border-radius:16px;padding:4px 18px;">
      ${row("Receipt no.", escapeHtml(invoice))}
      ${row("Date", escapeHtml(format(input.paidAt, "d MMM yyyy, h:mm a")))}
      ${row("Plan", escapeHtml(item.name))}
      ${row("Access", escapeHtml(input.displayPlan))}
      ${row("Valid until", escapeHtml(validity))}
      ${row("Amount paid", escapeHtml(`${amount} ${input.currency || "INR"}`))}
      ${input.razorpayPaymentId ? row("Razorpay payment", escapeHtml(input.razorpayPaymentId)) : ""}
      ${input.couponCode ? row("Coupon", escapeHtml(input.couponCode)) : ""}
    </table>
    <p style="color:#6B7280;font-size:13px;margin:16px 0 24px;">${escapeHtml(sourceNote)}</p>
    <p style="margin:0 0 24px;">
      <a href="${escapeHtml(input.appUrl)}/settings/subscription" style="background:#7B08E0;color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;display:inline-block;font-weight:600;">
        View billing
      </a>
    </p>
    <p style="color:#9CA3AF;font-size:12px;line-height:1.5;">
      This is a payment receipt from Alavo (hi@alavo.cc). Keep it for your records.
    </p>
  </div>`;
}

export function renderAdminSaleHtml(input: ReceiptInput) {
  const item = BILLING_CATALOG[input.sku];
  const invoice = receiptNumber(input.paymentId, input.paidAt);
  const amount = formatReceiptAmount(input);

  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111827;">
    <h1 style="font-size:20px;">New Alavo subscription</h1>
    <p style="color:#6B7280;font-size:14px;">A plan was activated just now.</p>
    <ul style="padding-left:18px;line-height:1.7;font-size:14px;">
      <li><strong>Customer:</strong> ${escapeHtml(input.userEmail)}</li>
      <li><strong>Plan:</strong> ${escapeHtml(item.name)} (${escapeHtml(input.displayPlan)})</li>
      <li><strong>Amount:</strong> ${escapeHtml(amount)}</li>
      <li><strong>Valid until:</strong> ${escapeHtml(validityLabel(input))}</li>
      <li><strong>Receipt:</strong> ${escapeHtml(invoice)}</li>
      <li><strong>Source:</strong> ${escapeHtml(input.source)}</li>
      ${input.razorpayPaymentId ? `<li><strong>Razorpay:</strong> ${escapeHtml(input.razorpayPaymentId)}</li>` : ""}
    </ul>
    <p><a href="${escapeHtml(input.appUrl)}/admin">Open admin dashboard</a></p>
  </div>`;
}
