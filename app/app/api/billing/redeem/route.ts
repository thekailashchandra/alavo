import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { enforceRateLimit } from "@/lib/with-rate-limit";
import { applyPaidSku } from "@/lib/billing/apply-purchase";
import { grantSkuForCoupon } from "@/lib/billing/coupons";
import { loadRedeemableCoupon, recordCouponRedemption } from "@/lib/billing/redeem";
import { getEntitlementSnapshot } from "@/lib/billing/access";
import { isSku } from "@/lib/billing/entitlements";

const redeemSchema = z.object({
  code: z.string().min(4).max(24),
});

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "billing:redeem", 10, 60_000);
    if (limited) return limited;

    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { code } = redeemSchema.parse(await req.json());
    const loaded = await loadRedeemableCoupon(code, user!.id);
    if (loaded.error || !loaded.coupon) {
      return jsonError(loaded.error ?? "Invalid coupon", 400);
    }

    const grant = grantSkuForCoupon(loaded.coupon);
    if (!grant || !isSku(grant)) {
      return jsonError("This coupon is for checkout discounts, not a free unlock.", 400);
    }

    await applyPaidSku(user!.id, grant);
    await recordCouponRedemption({ couponId: loaded.coupon.id, userId: user!.id });

    return jsonOk({
      billing: await getEntitlementSnapshot(user!.id),
      granted: grant,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
