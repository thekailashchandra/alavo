import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export type AppUser = {
  id: string;
  email: string;
  emailVerified: Date | null;
  timezone: string;
  provider: string;
  createdAt: Date;
  notificationSettings: unknown;
};

export function publicUser(user: AppUser) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    timezone: user.timezone,
    provider: user.provider,
    createdAt: user.createdAt,
    notificationSettings: user.notificationSettings ?? null,
  };
}

async function ensureAppUser(sessionUser: {
  id: string;
  email: string;
  emailVerified?: boolean | Date | null;
  name?: string | null;
}): Promise<AppUser> {
  const email = sessionUser.email.toLowerCase();
  const verifiedAt =
    sessionUser.emailVerified === true
      ? new Date()
      : sessionUser.emailVerified instanceof Date
        ? sessionUser.emailVerified
        : null;

  const existing = await prisma.user.findUnique({
    where: { email },
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

  if (existing) {
    if (verifiedAt && !existing.emailVerified) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { emailVerified: verifiedAt },
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
    }
    return existing;
  }

  return prisma.user.create({
    data: {
      id: sessionUser.id,
      email,
      emailVerified: verifiedAt,
      passwordHash: null,
      provider: "EMAIL",
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
}

export async function getAuthUser(): Promise<AppUser | null> {
  if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
    console.error("Neon Auth env vars are missing (NEON_AUTH_BASE_URL / NEON_AUTH_COOKIE_SECRET)");
    return null;
  }

  const { data: session } = await auth.getSession();
  if (!session?.user?.email) return null;

  return ensureAppUser({
    id: session.user.id,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    name: session.user.name,
  });
}

export async function requireAuth(_req?: Request) {
  const user = await getAuthUser();
  if (!user) {
    return {
      user: null as AppUser | null,
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null as Response | null };
}

/** Kept for account deletion password confirmation via Neon Auth where available */
export async function verifyPassword(_password: string, _hash: string) {
  return false;
}
