import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { pushSubscriptionSchema } from "@/lib/validations";
import { jsonOk, handleApiError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const data = pushSubscriptionSchema.parse(body);

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        userId: user!.id,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      },
      update: {
        userId: user!.id,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      },
    });

    return jsonOk({ subscription });
  } catch (error) {
    return handleApiError(error);
  }
}
