import { NextRequest } from "next/server";
import { BILLING_CATALOG } from "@alavo/brand";
import { requireAdmin } from "@/lib/admin";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const payments = await prisma.payment.findMany({
      where: { status: "PAID" },
      orderBy: { paidAt: "desc" },
      take: 50,
      include: {
        user: { select: { email: true } },
        coupon: { select: { code: true } },
      },
    });

    return jsonOk({
      payments: payments.map((payment) => ({
        id: payment.id,
        email: payment.user.email,
        sku: payment.sku,
        name: BILLING_CATALOG[payment.sku].name,
        amountInr: payment.amountPaise / 100,
        paidAt: payment.paidAt,
        coupon: payment.coupon?.code ?? null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
