import { NextRequest } from "next/server";
import { z } from "zod";
import { BILLING_SKUS, type BillingSku } from "@alavo/brand";
import { audit, requireAdmin } from "@/lib/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { describeCoupon, normalizeCouponCode } from "@/lib/billing/coupons";

const createSchema = z
  .object({
    code: z.string().min(4).max(24),
    kind: z.enum(["PERCENT", "AMOUNT", "GRANT"]),
    percentOff: z.number().int().min(1).max(100).optional().nullable(),
    amountOffInr: z.number().int().min(1).max(20000).optional().nullable(),
    grantSku: z
      .enum(BILLING_SKUS as unknown as [BillingSku, ...BillingSku[]])
      .optional()
      .nullable(),
    maxRedemptions: z.number().int().min(1).max(100000).optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    note: z.string().max(200).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "PERCENT" && !value.percentOff) {
      ctx.addIssue({ code: "custom", message: "Percent is required", path: ["percentOff"] });
    }
    if (value.kind === "AMOUNT" && !value.amountOffInr) {
      ctx.addIssue({
        code: "custom",
        message: "Amount in ₹ is required",
        path: ["amountOffInr"],
      });
    }
    if (value.kind === "GRANT" && !value.grantSku) {
      ctx.addIssue({ code: "custom", message: "Choose what to unlock", path: ["grantSku"] });
    }
  });

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { redemptions: true } } },
    });

    return jsonOk({
      coupons: coupons.map((coupon) => ({
        ...coupon,
        description: describeCoupon(coupon),
        redemptionCount: coupon._count.redemptions,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: admin, error } = await requireAdmin(req);
    if (error) return error;

    const body = createSchema.parse(await req.json());
    const code = normalizeCouponCode(body.code);
    if (!/^[A-Z0-9_-]{4,24}$/.test(code)) {
      return jsonError("Use 4–24 letters, numbers, _ or -", 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        kind: body.kind,
        percentOff: body.kind === "PERCENT" ? body.percentOff : null,
        amountOffPaise: body.kind === "AMOUNT" ? (body.amountOffInr ?? 0) * 100 : null,
        grantSku: body.kind === "GRANT" ? body.grantSku : null,
        maxRedemptions: body.maxRedemptions ?? null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        note: body.note ?? null,
      },
    });

    await audit({
      actorEmail: admin!.email,
      action: "coupon.create",
      detail: { code, kind: body.kind },
    });

    return jsonOk({ coupon: { ...coupon, description: describeCoupon(coupon) } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
