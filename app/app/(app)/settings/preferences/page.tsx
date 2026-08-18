"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Download,
  Globe,
  Mail,
  Palette,
  Trash2,
} from "lucide-react";
import { LEGAL } from "@alavo/brand";
import { clearLocalAppData } from "@/lib/compliance/consent";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { SettingsBackHeader } from "@/components/settings/settings-nav";
import { PrivacyDataRightsDialog } from "@/components/compliance/privacy-data-rights-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PaywallDialog } from "@/components/billing/paywall-dialog";
import { parseAccountSettings } from "@/lib/account-settings";
import { parseJson, ApiError, type AccountSettings } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function applyTheme(theme: "indigo" | "light") {
  document.documentElement.dataset.theme = theme;
}

export default function PreferencesSettingsPage() {
  const { user, fetchWithAuth, logout, setUser } = useAuth();
  const router = useRouter();

  const [account, setAccount] = useState<AccountSettings>(
    parseAccountSettings(user?.accountSettings)
  );
  const [saving, setSaving] = useState(false);
  const [paywall, setPaywall] = useState<"advancedExport" | "calendarSync" | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const parsed = parseAccountSettings(user?.accountSettings);
    setAccount(parsed);
    applyTheme(parsed.theme ?? "indigo");
  }, [user]);

  const saveAccount = async (patch: Partial<AccountSettings>) => {
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
      const next = parseAccountSettings(json.accountSettings);
      setAccount(next);
      if (json.user) setUser(json.user);
      if (patch.theme) applyTheme(patch.theme);
      toast.success("Preferences saved");
    } catch {
      toast.error("Could not save preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleIntegration = (enabled: boolean) => {
    if (enabled && !user?.billing?.features.calendarSync) {
      setPaywall("calendarSync");
      return;
    }
    if (enabled) {
      toast.message("Integration coming soon", {
        description: "Google Calendar sync will be available in a future update.",
      });
    }
    void saveAccount({
      integrations: {
        ...account.integrations,
        googleCalendar: enabled,
      },
    });
  };

  const handleExport = async (format: "json" | "csv" | "html") => {
    if (format !== "json" && !user?.billing?.features.advancedExport) {
      setPaywall("advancedExport");
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/settings/export?format=${format}`);
      if (format === "html") {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        toast.success("Opened printable PDF report");
        return;
      }
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alavo-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      if (error instanceof ApiError && error.code === "PAYWALL") {
        setPaywall("advancedExport");
        return;
      }
      toast.error("Export failed");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetchWithAuth("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: deleteConfirm }),
      });
      await parseJson(res);
      clearLocalAppData();
      await logout();
      toast.success("Account deleted");
      router.push("/");
    } catch {
      toast.error("Could not delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <SettingsBackHeader
        title="Settings"
        subtitle="General preferences, integrations, and privacy"
      />

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          General settings
        </h2>

        <div className="rounded-2xl border border-gray-20 bg-white p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-gray-60" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-100">User support</p>
              <p className="text-xs text-gray-60">
                Email our team for help with your account
              </p>
              <a
                href={`mailto:${LEGAL.supportEmail}`}
                className="mt-2 inline-block text-sm text-primary-100 underline-offset-2 hover:underline"
              >
                {LEGAL.supportEmail}
              </a>
            </div>
          </div>

          <div className="border-t border-gray-10 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-60" />
              <p className="text-sm font-medium text-gray-100">Language</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["en", "English"],
                  ["hi", "हिन्दी"],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  disabled={saving}
                  onClick={() => void saveAccount({ language: code })}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition",
                    account.language === code
                      ? "border-primary-100 bg-primary-100 text-white"
                      : "border-gray-20 bg-primary-20/40 text-primary-120 hover:bg-primary-20"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-10 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-60" />
              <p className="text-sm font-medium text-gray-100">Themes</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["indigo", "Purple"],
                  ["light", "Light"],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  disabled={saving}
                  onClick={() => void saveAccount({ theme: code })}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-sm font-medium transition",
                    account.theme === code
                      ? "border-primary-100 bg-primary-100 text-white"
                      : "border-gray-20 bg-primary-20/40 text-primary-120 hover:bg-primary-20"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="integrations" className="scroll-mt-24 space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Integration with other apps
        </h2>
        <div className="rounded-2xl border border-gray-20 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-gray-60" />
              <div>
                <p className="text-sm font-medium text-gray-100">Calendars</p>
                <p className="text-xs text-gray-60">
                  Sync habit times with Google Calendar
                </p>
              </div>
            </div>
            <Switch
              checked={account.integrations?.googleCalendar ?? false}
              onCheckedChange={(v) => toggleIntegration(v)}
              disabled={saving}
            />
          </div>
        </div>
      </section>

      <section className="px-5">
        <PrivacyDataRightsDialog privacyConsent={user?.privacyConsent} />
      </section>

      <section className="space-y-3 px-5">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-60">
          <Download className="h-4 w-4" />
          Export data
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => void handleExport("json")}>
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => void handleExport("csv")}>
            CSV report
          </Button>
          <Button
            variant="outline"
            className="col-span-2"
            onClick={() => void handleExport("html")}
          >
            Printable PDF report
          </Button>
        </div>
        <p className="text-xs text-gray-60">
          JSON stays free for data rights. Formatted CSV/PDF is an add-on.
        </p>
      </section>

      <section className="mt-8 border-t border-dashed border-gray-20 px-5 pt-8">
        <div className="space-y-3 rounded-2xl border border-red-200/70 bg-red-50/30 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-800">Delete account</p>
            <p className="text-xs leading-relaxed text-red-700/75">
              Permanently erase your account and all habit data. This cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  All habits, logs, and journal entries will be permanently removed. Type
                  DELETE to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm">Type DELETE</Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => void handleDeleteAccount()}
                  disabled={deleting || deleteConfirm !== "DELETE"}
                >
                  Delete forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      <PaywallDialog
        open={paywall != null}
        onOpenChange={(open) => {
          if (!open) setPaywall(null);
        }}
        feature={paywall ?? "advancedExport"}
      />
    </div>
  );
}
