import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, publicUser, USER_SELECT } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { parseAccountSettings } from "@/lib/account-settings";

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  avatarDataUrl: z.string().max(500_000).nullable().optional(),
  theme: z.enum(["indigo", "light"]).optional(),
  language: z.enum(["en", "hi"]).optional(),
  integrations: z
    .object({
      googleCalendar: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const dbUser = await prisma.user.findUnique({
      where: { id: user!.id },
      select: { accountSettings: true },
    });

    return jsonOk({
      accountSettings: parseAccountSettings(dbUser?.accountSettings),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = profileSchema.parse(await req.json());
    const current = parseAccountSettings(
      (
        await prisma.user.findUnique({
          where: { id: user!.id },
          select: { accountSettings: true },
        })
      )?.accountSettings
    );

    const next = {
      ...current,
      ...body,
      integrations: {
        ...current.integrations,
        ...body.integrations,
      },
    };

    next.integrations = {
      ...next.integrations,
      googleCalendar: false,
    };

    if (body.avatarDataUrl === null) {
      delete next.avatarDataUrl;
    }

    const updated = await prisma.user.update({
      where: { id: user!.id },
      data: { accountSettings: next },
      select: USER_SELECT,
    });

    return jsonOk({
      accountSettings: parseAccountSettings(updated.accountSettings),
      user: publicUser(updated),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
