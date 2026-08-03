import { createClient } from "@/lib/supabase/server";
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
  emailVerified?: boolean | Date | string | null;
  appMetadata?: Record<string, unknown> | null;
}): Promise<AppUser> {
  const email = sessionUser.email.toLowerCase();
  const verifiedAt =
    sessionUser.emailVerified === true
      ? new Date()
      : typeof sessionUser.emailVerified === "string"
        ? new Date(sessionUser.emailVerified)
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
    if (!verifiedAt && existing.emailVerified) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { emailVerified: null },
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

  const provider =
    sessionUser.appMetadata?.provider === "google" ? "GOOGLE" : "EMAIL";

  return prisma.user.create({
    data: {
      id: sessionUser.id,
      email,
      emailVerified: verifiedAt,
      passwordHash: null,
      provider,
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
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error(
      "Supabase env vars are missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;

  return ensureAppUser({
    id: data.user.id,
    email: data.user.email,
    emailVerified: data.user.email_confirmed_at,
    appMetadata: data.user.app_metadata as Record<string, unknown> | null,
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

export async function verifyPassword(_password: string, _hash: string) {
  return false;
}
