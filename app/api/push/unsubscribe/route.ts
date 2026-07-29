import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

const unsubscribeSchema = z.object({
  endpoint: z.string().url().max(2048),
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const { endpoint } = unsubscribeSchema.parse(body);

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: user!.id,
        endpoint,
      },
    });

    return jsonOk({ message: "Unsubscribed" });
  } catch (error) {
    return handleApiError(error);
  }
}
