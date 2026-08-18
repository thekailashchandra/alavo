"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { SettingsBackHeader } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  displayNameFromEmail,
  parseAccountSettings,
  userInitials,
} from "@/lib/account-settings";
import { parseJson, getTimezone, formatTimezoneLabel, type AccountSettings } from "@/lib/api-client";

export default function ProfileSettingsPage() {
  const { user, fetchWithAuth, logout, setUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [account, setAccount] = useState<AccountSettings>(
    parseAccountSettings(user?.accountSettings)
  );
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const parsed = parseAccountSettings(user?.accountSettings);
    setAccount(parsed);
    setDisplayName(
      parsed.displayName?.trim() ||
        (user?.email ? displayNameFromEmail(user.email) : "")
    );
  }, [user]);

  const saveProfile = async (
    patch: Partial<Omit<AccountSettings, "avatarDataUrl">> & {
      avatarDataUrl?: string | null;
    }
  ) => {
    setSaving(true);
    try {
      const res = await fetchWithAuth("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await parseJson<{
        accountSettings: AccountSettings;
        user: typeof user;
      }>(res);
      setAccount(parseAccountSettings(json.accountSettings));
      if (json.user) setUser(json.user);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file");
        return;
      }
      if (file.size > 400_000) {
        toast.error("Image must be under 400 KB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAccount((a) => ({ ...a, avatarDataUrl: dataUrl }));
        void saveProfile({ avatarDataUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchWithAuth, setUser]
  );

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleSwitchAccount = async () => {
    await logout();
    router.push("/login?switch=1");
  };

  const resolvedName =
    displayName.trim() ||
    (user?.email ? displayNameFromEmail(user.email) : "User");

  return (
    <div className="space-y-8 pb-8">
      <SettingsBackHeader
        title="User profile"
        subtitle="View and update your personal details"
      />

      <section className="px-5">
        <div className="rounded-2xl border border-gray-20 bg-white p-5 space-y-5">
          <div className="flex flex-col items-center gap-3 text-center">
            {account.avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={account.avatarDataUrl}
                alt=""
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary-20"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-30 text-2xl font-semibold text-primary-120">
                {userInitials(resolvedName)}
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePhoto(file);
              }}
            />
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={saving}
              >
                Add or change photo
              </Button>
              {account.avatarDataUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void saveProfile({ avatarDataUrl: null })}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-10 pt-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={() => {
                  if (displayName.trim() !== (account.displayName ?? "")) {
                    void saveProfile({ displayName: displayName.trim() });
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <p className="rounded-xl border border-gray-10 bg-primary-20/40 px-3 py-2 text-sm text-primary-120">
                {user?.email}
              </p>
            </div>
            <div className="space-y-1">
              <Label>Timezone</Label>
              <p className="rounded-xl border border-gray-10 bg-primary-20/40 px-3 py-2 text-sm text-primary-120">
                {formatTimezoneLabel(user?.timezone || getTimezone())}
              </p>
              <p className="text-xs text-gray-60">
                Detected automatically from this device
                {user?.timezone ? ` · ${user.timezone.replace(/_/g, " ")}` : ""}.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Member since</Label>
              <p className="rounded-xl border border-gray-10 bg-primary-20/40 px-3 py-2 text-sm text-primary-120">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Account actions
        </h2>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => void handleLogout()}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => void handleSwitchAccount()}
        >
          <RefreshCw className="h-4 w-4" />
          Switch profile to another account
        </Button>
        <p className="text-xs text-gray-60/80">
          Switching accounts signs you out so you can sign in with a different email.
        </p>
      </section>

      <section className="px-5">
        <div className="flex items-start gap-3 rounded-2xl border border-gray-20 bg-primary-20/30 p-4 text-sm text-primary-120">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Your profile photo and display name appear on the Today home screen and
            across your personal account.
          </p>
        </div>
      </section>
    </div>
  );
}
