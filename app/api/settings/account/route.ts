import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { auth } from "@/lib/auth/server";
import { z } from "zod";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

const deleteAccountSchema = z.object({
  confirm: z.literal("DELETE"),
});

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    const body = await req.json();
    deleteAccountSchema.parse(body);

    await prisma.user.delete({ where: { id: user.id } });

    try {
      await auth.signOut();
    } catch {
      // local data already removed
    }

    return jsonOk({ message: "Account deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
