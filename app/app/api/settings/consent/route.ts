import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser, publicUser, USER_SELECT } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { buildConsentRecord } from "@/lib/compliance/consent";

const consentSchema = z.object({
  ageConfirmed: z.literal(true),
  method: z.enum(["signup", "oauth", "settings", "consent_gate"]),
  pushNotifications: z.boolean().optional(),
  emailReports: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return jsonError("Unauthorized", 401);
    return jsonOk({ privacyConsent: user.privacyConsent ?? null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return jsonError("Unauthorized", 401);

    const body = consentSchema.parse(await req.json());
    const record = buildConsentRecord(body.method, {
      pushNotifications: body.pushNotifications,
      emailReports: body.emailReports,
    });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { privacyConsent: record },
      select: USER_SELECT,
    });

    return jsonOk(publicUser(updated));
  } catch (error) {
    return handleApiError(error);
  }
}
