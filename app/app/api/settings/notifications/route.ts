import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, publicUser, USER_SELECT } from "@/lib/auth";
import { notificationSettingsSchema } from "@/lib/validations";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { getEntitlementSnapshot } from "@/lib/billing/access";
import type { NotificationSettings } from "@/lib/api-client";

function usesCustomSchedule(settings: NotificationSettings) {
  const water = settings.waterReminder;
  if (water?.enabled) return true;
  if (settings.journalingTime && settings.journalingTime !== "21:00") return true;
  if (settings.emailReports && settings.emailReports.sendHour !== 20) return true;
  return false;
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const settings = notificationSettingsSchema.parse(body);

    if (usesCustomSchedule(settings as NotificationSettings)) {
      const entitlements = await getEntitlementSnapshot(user!.id);
      if (!entitlements.features.customNotifications) {
        return jsonError(
          "Custom reminder windows are a paid unlock. Basic habit reminders stay free.",
          402,
          { code: "PAYWALL", feature: "customNotifications" }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user!.id },
      data: { notificationSettings: settings },
      select: USER_SELECT,
    });

    return jsonOk({ user: publicUser(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}
