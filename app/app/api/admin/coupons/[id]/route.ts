import { NextRequest } from "next/server";
import { z } from "zod";
import { audit, requireAdmin } from "@/lib/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  active: z.boolean().optional(),
  maxRedemptions: z.number().int().min(1).max(100000).nullable().optional(),
  note: z.string().max(200).nullable().optional(),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { user: admin, error } = await requireAdmin(req);
    if (error) return error;
    const { id } = await context.params;
    const body = patchSchema.parse(await req.json());

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.active !== undefined ? { active: body.active } : {}),
        ...(body.maxRedemptions !== undefined
          ? { maxRedemptions: body.maxRedemptions }
          : {}),
        ...(body.note !== undefined ? { note: body.note } : {}),
      },
    });

    await audit({
      actorEmail: admin!.email,
      action: "coupon.update",
      detail: { id, ...body },
    });

    return jsonOk({ coupon });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { user: admin, error } = await requireAdmin(req);
    if (error) return error;
    const { id } = await context.params;
    const coupon = await prisma.coupon.delete({ where: { id } });
    await audit({
      actorEmail: admin!.email,
      action: "coupon.delete",
      detail: { code: coupon.code },
    });
    return jsonOk({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
