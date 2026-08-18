import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { trialWindow } from "@/lib/billing/entitlements";
import { isSuperAdminEmail } from "@/lib/admin-emails";

export type AppUser = {
  id: string;
  email: string;
  emailVerified: Date | null;
  timezone: string;
  provider: string;
  createdAt: Date;
  notificationSettings: unknown;
  accountSettings: unknown;
  privacyConsent: unknown;
};

export const USER_SELECT = {
  id: true,
  email: true,
  emailVerified: true,
  timezone: true,
  provider: true,
  createdAt: true,
  notificationSettings: true,
  accountSettings: true,
  privacyConsent: true,
} as const;

const AUTH_MEMO_TTL_MS = 12_000;
let authMemo: { key: string; user: AppUser; expiresAt: number } | null = null;

export function publicUser(user: AppUser) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    timezone: user.timezone,
    provider: user.provider,
    createdAt: user.createdAt,
    notificationSettings: user.notificationSettings ?? null,
    accountSettings: user.accountSettings ?? null,
    privacyConsent: user.privacyConsent ?? null,
    isAdmin: isSuperAdminEmail(user.email),
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
    select: USER_SELECT,
  });

  if (existing) {
    if (verifiedAt && !existing.emailVerified) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { emailVerified: verifiedAt },
        select: USER_SELECT,
      });
    }
    if (!verifiedAt && existing.emailVerified) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { emailVerified: null },
        select: USER_SELECT,
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
      ...trialWindow(),
    },
    select: USER_SELECT,
  });
}

async function sessionMemoKey() {
  const cookieStore = await cookies();
  const token = cookieStore
    .getAll()
    .filter((cookie) => cookie.name.includes("-auth-token"))
    .map((cookie) => cookie.value)
    .join(":");
  return token.slice(-120);
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

  const memoKey = await sessionMemoKey();
  if (
    memoKey &&
    authMemo &&
    authMemo.key === memoKey &&
    authMemo.expiresAt > Date.now()
  ) {
    return authMemo.user;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) {
    authMemo = null;
    return null;
  }

  const user = await ensureAppUser({
    id: data.user.id,
    email: data.user.email,
    emailVerified: data.user.email_confirmed_at,
    appMetadata: data.user.app_metadata as Record<string, unknown> | null,
  });

  if (memoKey) {
    authMemo = {
      key: memoKey,
      user,
      expiresAt: Date.now() + AUTH_MEMO_TTL_MS,
    };
  }

  return user;
}

export function rememberAuthUser(user: AppUser) {
  if (!authMemo) return;
  authMemo = { ...authMemo, user };
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
