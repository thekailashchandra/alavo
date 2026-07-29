import { NextRequest } from "next/server";
import { getAuthUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const timezone = req.headers.get("x-timezone");
    if (timezone && timezone !== user.timezone) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { timezone },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          timezone: true,
          provider: true,
          createdAt: true,
          notificationSettings: true,
        },
      });
      return jsonOk(publicUser(updated));
    }

    return jsonOk(publicUser(user));
  } catch (error) {
    return handleApiError(error);
  }
}
