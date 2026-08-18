import { NextRequest } from "next/server";
import { getAuthUser, publicUser, USER_SELECT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { enforceRateLimit } from "@/lib/with-rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  REGISTRATION_CLOSED_CODE,
  REGISTRATION_CLOSED_MESSAGE,
  isRegistrationClosed,
} from "@/lib/auth/registration";
import { z } from "zod";

const bootstrapSchema = z.object({
  timezone: z.string().min(1).max(64).optional(),
  provider: z.enum(["EMAIL", "GOOGLE"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "auth:bootstrap", 30, 60_000);
    if (limited) return limited;

    if (isRegistrationClosed()) {
      const supabase = await createClient();
      const { data: session } = await supabase.auth.getUser();
      const email = session.user?.email?.trim().toLowerCase();
      if (email) {
        const existing = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (!existing) {
          await supabase.auth.signOut();
          return jsonError(REGISTRATION_CLOSED_MESSAGE, 403, {
            code: REGISTRATION_CLOSED_CODE,
          });
        }
      }
    }

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
        // OAuth providers mark email verified at Supabase; mirror locally
        ...(data.provider === "GOOGLE" && !user.emailVerified
          ? { emailVerified: new Date() }
          : {}),
      },
      select: USER_SELECT,
    });

    return jsonOk(publicUser(updated));
  } catch (error) {
    return handleApiError(error);
  }
}
