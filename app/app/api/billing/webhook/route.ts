import { NextRequest } from "next/server";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { fulfillPaidPayment } from "@/lib/billing/fulfill";
import { verifyWebhookSignature } from "@/lib/billing/razorpay";

export const runtime = "nodejs";

type RazorpayEntity = {
  id?: string;
  status?: string;
  notes?: Record<string, string>;
  order_id?: string;
};

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
      await fulfillPaidPayment({
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
