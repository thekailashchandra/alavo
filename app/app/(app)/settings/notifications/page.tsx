"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Droplets, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { SettingsBackHeader } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { parseJson, type NotificationSettings } from "@/lib/api-client";

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
  emailReports: {
    daily: false,
    weekly: true,
    monthly: false,
    sendHour: 20,
  },
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

export default function NotificationsSettingsPage() {
  const { user, fetchWithAuth, setUser } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);

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
        emailReports: {
          ...DEFAULT_SETTINGS.emailReports!,
          ...(user.notificationSettings.emailReports ?? {}),
        },
      });
    }
    void loadPushStatus();
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

  const updateEmailReport = (
    key: "daily" | "weekly" | "monthly",
    value: boolean
  ) => {
    const next = {
      ...settings,
      emailReports: {
        daily: settings.emailReports?.daily ?? false,
        weekly: settings.emailReports?.weekly ?? true,
        monthly: settings.emailReports?.monthly ?? false,
        sendHour: settings.emailReports?.sendHour ?? 20,
        [key]: value,
      },
    };
    void saveSettings(next);
  };

  const sendTestReport = async (period: "daily" | "weekly" | "monthly") => {
    setSendingReport(true);
    try {
      const res = await fetchWithAuth("/api/cron/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      await parseJson(res);
      toast.success(`${period[0].toUpperCase()}${period.slice(1)} report emailed`);
    } catch {
      toast.error("Could not send report — check Gmail settings");
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <SettingsBackHeader
        title="Notifications"
        subtitle="Habit reminders, push alerts, and email reports"
      />

      <section className="space-y-4 px-5">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-60">
          <Bell className="h-4 w-4" />
          Habit reminders
        </h2>

        <div className="space-y-4 rounded-2xl border border-gray-20 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-100">Habit reminders</p>
              <p className="text-xs text-gray-60">
                Scheduled reminders at your habit times
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => {
                void saveSettings({ ...settings, enabled });
              }}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between border-t border-gray-10 pt-4">
            <div>
              <p className="text-sm font-medium text-gray-100">Push notifications</p>
              <p className="text-xs text-gray-60">
                Browser push when the app is closed
              </p>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={(v) => void togglePush(v)} />
          </div>
          <p className="border-t border-gray-10 pt-3 text-xs text-gray-60">
            Tip: install Alavo to your home screen, then open{" "}
            <a href="/widget" className="text-primary-100 underline-offset-2 hover:underline">
              /widget
            </a>{" "}
            for a compact today-at-a-glance view.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-gray-20 bg-white p-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-gray-60" />
            <p className="text-sm font-medium text-gray-100">Water reminder</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-60">Enabled</span>
            <Switch
              checked={settings.waterReminder?.enabled ?? false}
              onCheckedChange={(enabled) => {
                void saveSettings({
                  ...settings,
                  waterReminder: {
                    enabled,
                    startTime: settings.waterReminder?.startTime ?? "09:00",
                    endTime: settings.waterReminder?.endTime ?? "18:00",
                    intervalMinutes: settings.waterReminder?.intervalMinutes ?? 60,
                  },
                });
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
                    setSettings({
                      ...settings,
                      waterReminder: {
                        ...settings.waterReminder!,
                        startTime: e.target.value,
                      },
                    });
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
                    setSettings({
                      ...settings,
                      waterReminder: {
                        ...settings.waterReminder!,
                        endTime: e.target.value,
                      },
                    });
                  }}
                  onBlur={() => void saveSettings(settings)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-gray-20 bg-white p-4">
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

      <section className="space-y-4 px-5">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-60">
          <Mail className="h-4 w-4" />
          Email reports
        </h2>
        <div className="space-y-4 rounded-2xl border border-gray-20 bg-white p-4">
          <p className="text-xs text-gray-60">
            Habit summaries emailed to {user?.email} around{" "}
            {String(settings.emailReports?.sendHour ?? 20).padStart(2, "0")}:00 local time.
          </p>
          {(
            [
              ["daily", "Daily report", "Yesterday’s check-ins"],
              ["weekly", "Weekly report", "Previous Mon–Sun"],
              ["monthly", "Monthly report", "Previous calendar month"],
            ] as const
          ).map(([key, label, hint]) => (
            <div
              key={key}
              className="flex items-center justify-between border-t border-gray-10 pt-4 first:border-t-0 first:pt-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-100">{label}</p>
                <p className="text-xs text-gray-60">{hint}</p>
              </div>
              <Switch
                checked={settings.emailReports?.[key] ?? false}
                onCheckedChange={(v) => updateEmailReport(key, v)}
                disabled={saving}
              />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-10 pt-4">
            {(["daily", "weekly", "monthly"] as const).map((period) => (
              <Button
                key={period}
                type="button"
                variant="outline"
                size="sm"
                disabled={sendingReport}
                onClick={() => void sendTestReport(period)}
              >
                Send {period}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
