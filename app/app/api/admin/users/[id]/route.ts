import { NextRequest } from "next/server";
import { z } from "zod";
import { BILLING_SKUS, type BillingSku } from "@alavo/brand";
import { audit, requireAdmin } from "@/lib/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { applyPaidSku, setUserFree } from "@/lib/billing/apply-purchase";
import { isSku } from "@/lib/billing/entitlements";
import { getEntitlementSnapshot } from "@/lib/billing/access";

type RouteContext = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  action: z.enum(["make_free", "grant"]),
  sku: z.enum(BILLING_SKUS as unknown as [BillingSku, ...BillingSku[]]).optional(),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { user: admin, error } = await requireAdmin(req);
    if (error) return error;

    const { id } = await context.params;
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });
    if (!target) return jsonError("User not found", 404);

    const body = patchSchema.parse(await req.json());
    if (body.action === "make_free") {
      await setUserFree(target.id);
    } else {
      if (!body.sku || !isSku(body.sku)) return jsonError("Choose a plan or add-on", 400);
      await applyPaidSku(target.id, body.sku);
    }

    await audit({
      actorEmail: admin!.email,
      action: body.action === "make_free" ? "user.make_free" : "user.grant",
      targetEmail: target.email,
      detail: { sku: body.sku ?? null },
    });

    return jsonOk({
      billing: await getEntitlementSnapshot(target.id),
      email: target.email,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
