import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { getEntitlementSnapshot } from "@/lib/billing/access";
import { fulfillPaidPayment } from "@/lib/billing/fulfill";
import { verifyPaymentLinkCallback } from "@/lib/billing/razorpay";

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

    const result = await fulfillPaidPayment({
      paymentLinkId: params.razorpay_payment_link_id,
      paymentId: params.razorpay_payment_id,
      userId: user!.id,
      referenceId: params.razorpay_payment_link_reference_id,
    });
    if (!result.ok && result.reason === "not-found") {
      return jsonError("Payment not found", 404);
    }
    if (!result.ok) return jsonError("Could not confirm payment", 400);

    return jsonOk({ billing: await getEntitlementSnapshot(user!.id) });
  } catch (error) {
    return handleApiError(error);
  }
}
