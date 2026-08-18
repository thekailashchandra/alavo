export const SUPER_ADMIN_EMAIL = "alavoapp@gmail.com";

export function adminEmails() {
  const extra = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return new Set([SUPER_ADMIN_EMAIL, ...extra]);
}

export function isSuperAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return adminEmails().has(email.trim().toLowerCase());
}

export function userIsAdmin(user: {
  email?: string | null;
  isAdmin?: boolean;
} | null | undefined) {
  if (!user) return false;
  return Boolean(user.isAdmin) || isSuperAdminEmail(user.email);
}
