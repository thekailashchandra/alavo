import { jsonError } from "@/lib/api";
import type { AppUser } from "@/lib/auth";
import { requireAuth } from "@/lib/auth";
import { isSuperAdminEmail } from "@/lib/admin-emails";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export { SUPER_ADMIN_EMAIL, adminEmails, isSuperAdminEmail } from "@/lib/admin-emails";

export async function requireAdmin(_req?: Request) {
  const { user, error } = await requireAuth(_req);
  if (error) return { user: null as AppUser | null, error };
  if (!isSuperAdminEmail(user!.email)) {
    return {
      user: null as AppUser | null,
      error: jsonError("Forbidden", 403),
    };
  }
  return { user, error: null as Response | null };
}

export async function audit(input: {
  actorEmail: string;
  action: string;
  targetEmail?: string | null;
  detail?: Record<string, unknown>;
}) {
  await prisma.adminAuditLog.create({
    data: {
      actorEmail: input.actorEmail.toLowerCase(),
      action: input.action,
      targetEmail: input.targetEmail?.toLowerCase() ?? null,
      detail:
        input.detail === undefined
          ? undefined
          : (JSON.parse(JSON.stringify(input.detail)) as Prisma.InputJsonValue),
    },
  });
}
