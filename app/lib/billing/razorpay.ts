import { createHmac, timingSafeEqual } from "crypto";
import { BILLING_CATALOG, type BillingSku } from "@alavo/brand";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function requireKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured");
  }
  return { keyId, keySecret };
}

export function razorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim()
  );
}

function authHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export type PaymentLinkResult = {
  id: string;
  shortUrl: string;
};

export async function createPaymentLink(input: {
  sku: BillingSku;
  paymentId: string;
  userId: string;
  email: string;
  callbackUrl: string;
  amountPaise?: number;
}): Promise<PaymentLinkResult> {
  const { keyId, keySecret } = requireKeys();
  const item = BILLING_CATALOG[input.sku];
  const amountPaise = input.amountPaise ?? item.amountInr * 100;

  const res = await fetch(`${RAZORPAY_API}/payment_links`, {
    method: "POST",
    headers: {
      Authorization: authHeader(keyId, keySecret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      accept_partial: false,
      reference_id: input.paymentId.slice(0, 40),
      description: `Alavo ${item.name}`,
      customer: { email: input.email },
      notify: { email: true, sms: false },
      reminder_enable: false,
      callback_url: input.callbackUrl,
      callback_method: "get",
      notes: {
        userId: input.userId,
        sku: input.sku,
        paymentId: input.paymentId,
      },
    }),
  });

  const data = (await res.json()) as {
    id?: string;
    short_url?: string;
    error?: { description?: string };
  };

  if (!res.ok || !data.id || !data.short_url) {
    throw new Error(data.error?.description || "Could not create payment link");
  }

  return { id: data.id, shortUrl: data.short_url };
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyPaymentLinkCallback(params: {
  paymentLinkId: string;
  paymentLinkRef: string;
  paymentLinkStatus: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret } = requireKeys();
  const payload = [
    params.paymentLinkId,
    params.paymentLinkRef,
    params.paymentLinkStatus,
    params.paymentId,
  ].join("|");
  const expected = createHmac("sha256", keySecret).update(payload).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(params.signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
