import { headers } from "next/headers";
import { getAuthUser } from "@/lib/auth";
import { getEntitlementSnapshot } from "@/lib/billing/access";
import { hasCloudWorkspaceAccess } from "@/lib/billing/cloud-access";
import { isSelfHosted } from "@/lib/deployment-mode";
import AppClientLayout from "./client-layout";

const ACCOUNT_PATHS = [
  "/settings/subscription",
  "/settings/profile",
  "/settings/preferences",
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const accountPage = ACCOUNT_PATHS.some((path) => pathname.startsWith(path));
  let blocked = false;

  if (pathname && !accountPage) {
    const user = await getAuthUser();
    if (user?.emailVerified) {
      const billing = await getEntitlementSnapshot(user.id);
      blocked = !hasCloudWorkspaceAccess({
        createdAt: user.createdAt,
        lifetime: billing.lifetime,
        status: billing.status,
        selfHosted: isSelfHosted(),
      });
    }
  }

  return <AppClientLayout blocked={blocked}>{children}</AppClientLayout>;
}
