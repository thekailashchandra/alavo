import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, publicUser, USER_SELECT } from "@/lib/auth";
import { notificationSettingsSchema } from "@/lib/validations";
import { jsonOk, handleApiError } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const settings = notificationSettingsSchema.parse(body);

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
