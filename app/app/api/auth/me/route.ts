import { NextRequest } from "next/server";
import { getAuthUser, publicUser, USER_SELECT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { enforceRateLimit } from "@/lib/with-rate-limit";
import { getEntitlementSnapshot } from "@/lib/billing/access";
import { z } from "zod";

const timezoneSchema = z.string().min(1).max(64);

export async function GET(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "auth:me", 120, 60_000);
    if (limited) return limited;

    const user = await getAuthUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const rawTimezone = req.headers.get("x-timezone");
    const parsed = rawTimezone ? timezoneSchema.safeParse(rawTimezone) : null;
    const timezone = parsed?.success ? parsed.data : null;
    if (timezone && timezone !== user.timezone) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { timezone },
        select: USER_SELECT,
      });
      return jsonOk({
        ...publicUser(updated),
        billing: await getEntitlementSnapshot(updated.id),
      });
    }

    return jsonOk({
      ...publicUser(user),
      billing: await getEntitlementSnapshot(user.id),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
