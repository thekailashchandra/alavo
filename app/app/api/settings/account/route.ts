import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const authUserId = authData.user?.id;

    await prisma.user.delete({ where: { id: user.id } });

    if (authUserId) {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.deleteUser(authUserId);
      } catch {
        // App data already removed
      }
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // local data already removed
    }

    return jsonOk({ message: "Account deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
