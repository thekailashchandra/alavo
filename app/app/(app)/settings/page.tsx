"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Download,
  Droplets,
  LogOut,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
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
import {
  parseJson,
  type NotificationSettings,
} from "@/lib/api-client";

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  waterReminder: {
    enabled: false,
    startTime: "09:00",
    endTime: "18:00",
    intervalMinutes: 60,
  },
  workoutTime: null,
  journalingTime: "21:00",
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsPage() {
  const { user, fetchWithAuth, logout, setUser } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadPushStatus = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setPushEnabled(Boolean(sub));
    } catch {
      setPushEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (user?.notificationSettings) {
      setSettings({
        ...DEFAULT_SETTINGS,
        ...user.notificationSettings,
        waterReminder: {
          ...DEFAULT_SETTINGS.waterReminder!,
          ...(user.notificationSettings.waterReminder ?? {}),
        },
      });
    }
    void loadPushStatus();
    setLoading(false);
  }, [user, loadPushStatus]);

  const saveSettings = async (next: NotificationSettings) => {
    setSaving(true);
    try {
      const res = await fetchWithAuth("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const json = await parseJson<{ user: typeof user }>(res);
      if (json.user) setUser(json.user);
      setSettings(next);
      toast.success("Settings saved");
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const togglePush = async (enabled: boolean) => {
    if (enabled) {
      if (!("Notification" in window)) {
        toast.error("Notifications not supported");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const keyRes = await fetch("/api/push/vapid-public-key");
      const { publicKey } = await parseJson<{ publicKey: string }>(keyRes);

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = subscription.toJSON();
      const res = await fetchWithAuth("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      await parseJson(res);
      setPushEnabled(true);
      toast.success("Push notifications enabled");
    } else {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetchWithAuth("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setPushEnabled(false);
      toast.success("Push notifications disabled");
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    try {
      const res = await fetchWithAuth(`/api/settings/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alavo-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
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
      await logout();
      toast.success("Account deleted");
      router.push("/");
    } catch {
      toast.error("Could not delete account");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="px-5 pt-8">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="px-5 pt-8">
        <h1 className="brand-title text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      </header>

      <section className="space-y-4 px-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="h-4 w-4 text-muted-foreground" />
          Reminders
        </h2>

        <div className="rounded-2xl border border-border bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-xs text-muted-foreground">
                Habit and journal reminders
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => {
                const next = { ...settings, enabled };
                void saveSettings(next);
              }}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium">Push notifications</p>
              <p className="text-xs text-muted-foreground">
                Browser push when app is closed
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={(v) => void togglePush(v)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Water reminder</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Enabled</span>
            <Switch
              checked={settings.waterReminder?.enabled ?? false}
              onCheckedChange={(enabled) => {
                const next = {
                  ...settings,
                  waterReminder: {
                    enabled,
                    startTime: settings.waterReminder?.startTime ?? "09:00",
                    endTime: settings.waterReminder?.endTime ?? "18:00",
                    intervalMinutes: settings.waterReminder?.intervalMinutes ?? 60,
                  },
                };
                void saveSettings(next);
              }}
              disabled={saving}
            />
          </div>
          {settings.waterReminder?.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Start</Label>
                <Input
                  type="time"
                  value={settings.waterReminder.startTime}
                  onChange={(e) => {
                    const next = {
                      ...settings,
                      waterReminder: {
                        ...settings.waterReminder!,
                        startTime: e.target.value,
                      },
                    };
                    setSettings(next);
                  }}
                  onBlur={() => void saveSettings(settings)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End</Label>
                <Input
                  type="time"
                  value={settings.waterReminder.endTime}
                  onChange={(e) => {
                    const next = {
                      ...settings,
                      waterReminder: {
                        ...settings.waterReminder!,
                        endTime: e.target.value,
                      },
                    };
                    setSettings(next);
                  }}
                  onBlur={() => void saveSettings(settings)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 space-y-2">
          <Label htmlFor="journal-time">Journaling reminder</Label>
          <Input
            id="journal-time"
            type="time"
            value={settings.journalingTime ?? ""}
            onChange={(e) =>
              setSettings((s) => ({ ...s, journalingTime: e.target.value }))
            }
            onBlur={() => void saveSettings(settings)}
          />
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Download className="h-4 w-4 text-muted-foreground" />
          Export data
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => void handleExport("json")}>
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => void handleExport("csv")}>
            Export CSV
          </Button>
        </div>
      </section>

      <section className="space-y-3 px-5 pb-2">
        <Button variant="outline" className="w-full" onClick={() => void handleLogout()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </section>

      {/* Keep destructive actions visually far from Sign out */}
      <div className="min-h-28" aria-hidden />

      <section className="mt-16 border-t border-dashed border-border/50 px-5 pb-12 pt-12">
        <details className="group">
          <summary className="cursor-pointer list-none text-center text-[11px] tracking-wide text-muted-foreground/80 underline-offset-2 hover:text-muted-foreground hover:underline [&::-webkit-details-marker]:hidden">
            Advanced account options
          </summary>
          <div className="mt-10 space-y-3 rounded-2xl border border-red-200/70 bg-red-50/30 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-800">Danger zone</p>
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
                    All habits, logs, and journal entries will be permanently removed.
                    Type DELETE to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="delete-confirm">Type DELETE</Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>
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
        </details>
      </section>
    </div>
  );
}
