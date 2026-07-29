import { NextRequest } from "next/server";
import { getAuthUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { z } from "zod";

const bootstrapSchema = z.object({
  timezone: z.string().min(1).max(64).optional(),
  provider: z.enum(["EMAIL", "GOOGLE"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const body = await req.json().catch(() => ({}));
    const data = bootstrapSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        timezone: data.timezone || user.timezone,
        ...(data.provider ? { provider: data.provider } : {}),
        // OAuth providers mark email verified at Neon; mirror locally
        ...(data.provider === "GOOGLE" && !user.emailVerified
          ? { emailVerified: new Date() }
          : {}),
      },
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
  } catch (error) {
    return handleApiError(error);
  }
}
