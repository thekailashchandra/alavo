"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  History,
  Settings2,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { userIsAdmin } from "@/lib/admin-emails";
import { SettingsHubLink, SettingsSection } from "@/components/settings/settings-nav";
import {
  displayNameFromEmail,
  parseAccountSettings,
  userInitials,
} from "@/lib/account-settings";
import { parseJson } from "@/lib/api-client";
import type { AccountSettings } from "@/lib/api-client";

export default function SettingsHubPage() {
  const { user, fetchWithAuth } = useAuth();
  const [account, setAccount] = useState<AccountSettings>(
    parseAccountSettings(user?.accountSettings)
  );

  useEffect(() => {
    if (user?.accountSettings) {
      setAccount(parseAccountSettings(user.accountSettings));
      return;
    }
    void fetchWithAuth("/api/settings/profile")
      .then((res) => parseJson<{ accountSettings: AccountSettings }>(res))
      .then((json) => setAccount(parseAccountSettings(json.accountSettings)))
      .catch(() => {});
  }, [user, fetchWithAuth]);

  const displayName =
    account.displayName?.trim() ||
    (user?.email ? displayNameFromEmail(user.email) : "Your profile");

  return (
    <div className="space-y-8 pb-8">
      <header className="px-5 pt-8">
        <h1 className="brand-title text-2xl font-semibold tracking-tight text-gray-100">
          Personal account
        </h1>
        <p className="mt-1 text-sm text-gray-60/80">
          Profile, activity, rewards, and app preferences
        </p>
      </header>

      <section className="px-5">
        <Link
          href="/settings/profile"
          className="flex items-center gap-4 rounded-2xl border border-gray-20 bg-white p-4 transition hover:border-primary-30 hover:bg-primary-20/40"
        >
          {account.avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={account.avatarDataUrl}
              alt=""
              className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-20"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-30 text-lg font-semibold text-primary-120">
              {userInitials(displayName)}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-semibold text-gray-100">
              {displayName}
            </span>
            <span className="block truncate text-sm text-gray-60">
              {user?.email}
            </span>
          </span>
        </Link>
      </section>

      <SettingsSection title="User profile">
        <SettingsHubLink
          href="/settings/profile"
          icon={User}
          title="View & edit profile"
          description="Name, photo, timezone, log out, switch account"
        />
      </SettingsSection>

      <SettingsSection title="Activity history">
        <SettingsHubLink
          href="/settings/activity"
          icon={History}
          title="Habit activity"
          description="Completed and incomplete habits, link to analytics"
        />
        <SettingsHubLink
          href="/analytics"
          icon={BarChart3}
          title="Statistics & analytics"
          description="Charts, streaks, and progress insights"
        />
      </SettingsSection>

      <SettingsSection title="Rewards & achievements">
        <SettingsHubLink
          href="/settings/rewards"
          icon={Award}
          title="Rewards and achievements"
          description="XP, levels, badges, and milestones"
        />
      </SettingsSection>

      <SettingsSection title="Notifications">
        <SettingsHubLink
          href="/settings/notifications"
          icon={Bell}
          title="Habit reminders & push"
          description="Scheduled reminders, water alerts, email reports"
        />
      </SettingsSection>

      <SettingsSection title="Subscription">
        <SettingsHubLink
          href="/settings/subscription"
          icon={CreditCard}
          title="Plans & billing"
          description="Free forever, Pro, Team, lifetime, and add-ons"
        />
        <SettingsHubLink
          href="/team"
          icon={Users}
          title="Team & family"
          description="Shared groups, challenges, and leaderboard"
        />
      </SettingsSection>

      {userIsAdmin(user) ? (
        <SettingsSection title="Admin">
          <SettingsHubLink
            href="/admin"
            icon={Shield}
            title="Admin dashboard"
            description="Users, revenue, coupons, complimentary access"
          />
        </SettingsSection>
      ) : null}

      <SettingsSection title="Settings">
        <SettingsHubLink
          href="/settings/preferences"
          icon={Settings2}
          title="General settings"
          description="Support, language, themes, privacy, and data"
        />
        <SettingsHubLink
          href="/settings/preferences#integrations"
          icon={Calendar}
          title="Integrations"
          description="Google Calendar sync"
        />
      </SettingsSection>
    </div>
  );
}
