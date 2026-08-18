"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { cacheKeys } from "@/lib/client-cache";
import { parseJson, type JournalEntry } from "@/lib/api-client";
import { getTodayInTimezone } from "@/lib/habits";
import { cn } from "@/lib/utils";

type JournalResponse = { entries: JournalEntry[] };

function emptyEntry(date: string): JournalEntry {
  return {
    id: `local-${date}`,
    date,
    wentWell: "",
    stressedAbout: "",
    tomorrowFocus: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function JournalPage() {
  const { fetchWithAuth, user } = useAuth();
  const today = getTodayInTimezone(
    user?.timezone ??
      (typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
        : "UTC")
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [wentWell, setWentWell] = useState("");
  const [stressedAbout, setStressedAbout] = useState("");
  const [tomorrowFocus, setTomorrowFocus] = useState("");
  const hydratedDate = useRef("");

  const { data, loading, setCachedData } = useCachedQuery<JournalResponse>(
    cacheKeys.journal,
    "/api/journal"
  );

  const entries = data?.entries ?? [];

  useEffect(() => {
    if (hydratedDate.current === selectedDate) return;
    const entry = entries.find((item) => item.date === selectedDate);
    if (loading && !entry) return;
    setWentWell(entry?.wentWell ?? "");
    setStressedAbout(entry?.stressedAbout ?? "");
    setTomorrowFocus(entry?.tomorrowFocus ?? "");
    hydratedDate.current = selectedDate;
  }, [selectedDate, entries, loading]);

  const stacked = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  );

  const selectDate = (next: string) => {
    hydratedDate.current = "";
    setSelectedDate(next);
  };

  const handleSave = useCallback(async () => {
    if (!selectedDate) {
      toast.error("Pick a date first");
      return;
    }
    setSaving(true);
    const payload = {
      date: selectedDate,
      wentWell,
      stressedAbout,
      tomorrowFocus,
    };
    const optimistic: JournalEntry = {
      ...(entries.find((entry) => entry.date === selectedDate) ?? emptyEntry(selectedDate)),
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    setCachedData((prev) => {
      const current = prev?.entries ?? [];
      const next = current.filter((entry) => entry.date !== selectedDate);
      next.push(optimistic);
      next.sort((a, b) => b.date.localeCompare(a.date));
      return { entries: next };
    });

    try {
      const res = await fetchWithAuth("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await parseJson<{ entry: JournalEntry }>(res);
      if (json.entry) {
        setCachedData((prev) => {
          const current = prev?.entries ?? [];
          const next = current.filter((entry) => entry.date !== json.entry.date);
          next.push(json.entry);
          next.sort((a, b) => b.date.localeCompare(a.date));
          return { entries: next };
        });
      }
      toast.success("Journal saved");
    } catch {
      toast.error("Could not save journal");
    } finally {
      setSaving(false);
    }
  }, [
    entries,
    fetchWithAuth,
    selectedDate,
    setCachedData,
    stressedAbout,
    tomorrowFocus,
    wentWell,
  ]);

  return (
    <div className="space-y-6 pb-4">
      <header className="px-5 pt-8">
        <h1 className="brand-title text-2xl font-semibold tracking-tight">
          Journal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reflect on your day — what worked, what didn&apos;t, what&apos;s next.
        </p>
      </header>

      <form
        className="space-y-4 px-5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="journal-date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Date
          </Label>
          <Input
            id="journal-date"
            type="date"
            value={selectedDate}
            onChange={(e) => selectDate(e.target.value)}
          />
        </div>

        {loading && !data ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="went-well">What went well?</Label>
              <Textarea
                id="went-well"
                placeholder="Wins, gratitude, progress…"
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                rows={4}
                maxLength={2000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stressed">What felt stressful?</Label>
              <Textarea
                id="stressed"
                placeholder="Friction, worries, blockers…"
                value={stressedAbout}
                onChange={(e) => setStressedAbout(e.target.value)}
                rows={4}
                maxLength={2000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tomorrow">Tomorrow&apos;s focus</Label>
              <Textarea
                id="tomorrow"
                placeholder="One or two priorities for tomorrow…"
                value={tomorrowFocus}
                onChange={(e) => setTomorrowFocus(e.target.value)}
                rows={4}
                maxLength={2000}
              />
            </div>

            <Button className="w-full" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save entry"}
            </Button>
          </>
        )}
      </form>

      <section className="px-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          Previous entries
        </h2>

        {stacked.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Saved reflections will stack here by date.
          </p>
        ) : (
          <ul className="space-y-3">
            {stacked.map((entry) => {
              const active = entry.date === selectedDate;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => selectDate(entry.date)}
                    className={cn(
                      "w-full rounded-3xl border bg-white p-4 text-left shadow-[0_10px_28px_rgba(17,17,17,0.05)] transition-colors",
                      active
                        ? "border-primary/40 ring-2 ring-primary/15"
                        : "border-border/80"
                    )}
                  >
                    <p className="text-sm font-semibold">
                      {format(parseISO(entry.date), "EEEE, MMM d, yyyy")}
                    </p>
                    {entry.wentWell ? (
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-700">
                        <span className="font-medium text-zinc-500">Went well · </span>
                        {entry.wentWell}
                      </p>
                    ) : null}
                    {entry.stressedAbout ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        Stress · {entry.stressedAbout}
                      </p>
                    ) : null}
                    {entry.tomorrowFocus ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        Tomorrow · {entry.tomorrowFocus}
                      </p>
                    ) : null}
                    {!entry.wentWell && !entry.stressedAbout && !entry.tomorrowFocus ? (
                      <p className="mt-2 text-xs text-muted-foreground">Empty entry</p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
