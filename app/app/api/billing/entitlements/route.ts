import { NextRequest } from "next/server";
import { BILLING_CATALOG } from "@alavo/brand";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { getEntitlementSnapshot } from "@/lib/billing/access";
import { razorpayConfigured } from "@/lib/billing/razorpay";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const billing = await getEntitlementSnapshot(user!.id);
    const payments = await prisma.payment.findMany({
      where: { userId: user!.id, status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 20,
      select: {
        id: true,
        sku: true,
        amountPaise: true,
        currency: true,
        paidAt: true,
        createdAt: true,
      },
    });

    return jsonOk({
      billing,
      payments: payments.map((payment) => ({
        ...payment,
        name: BILLING_CATALOG[payment.sku].name,
        amountInr: payment.amountPaise / 100,
      })),
      catalog: BILLING_CATALOG,
      paymentsReady: razorpayConfigured() || process.env.NODE_ENV !== "production",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
