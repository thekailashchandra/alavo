"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseJson, type JournalEntry } from "@/lib/api-client";

export default function JournalPage() {
  const { fetchWithAuth } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [wentWell, setWentWell] = useState("");
  const [stressedAbout, setStressedAbout] = useState("");
  const [tomorrowFocus, setTomorrowFocus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);
  const [searching, setSearching] = useState(false);

  const loadEntry = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(
        `/api/journal?from=${date}&to=${date}`
      );
      const json = await parseJson<{ entries: JournalEntry[] }>(res);
      const entry = json.entries[0] ?? null;
      setWentWell(entry?.wentWell ?? "");
      setStressedAbout(entry?.stressedAbout ?? "");
      setTomorrowFocus(entry?.tomorrowFocus ?? "");
    } catch {
      toast.error("Could not load journal entry");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, date]);

  useEffect(() => {
    void loadEntry();
  }, [loadEntry]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          wentWell,
          stressedAbout,
          tomorrowFocus,
        }),
      });
      await parseJson(res);
      toast.success("Journal saved");
    } catch {
      toast.error("Could not save journal");
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchFrom) params.set("from", searchFrom);
      if (searchTo) params.set("to", searchTo);
      const res = await fetchWithAuth(`/api/journal?${params.toString()}`);
      const json = await parseJson<{ entries: JournalEntry[] }>(res);
      setSearchResults(json.entries ?? []);
      if ((json.entries ?? []).length === 0) {
        toast.info("No entries found in that range");
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-8 pb-6">
      <header className="px-5 pt-8">
        <h1 className="brand-title text-2xl font-semibold tracking-tight">
          Journal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reflect on your day — what worked, what didn&apos;t, what&apos;s next.
        </p>
      </header>

      <section className="space-y-4 px-5">
        <div className="space-y-2">
          <Label htmlFor="journal-date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Date
          </Label>
          <Input
            id="journal-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {loading ? (
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

            <Button
              className="w-full"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save entry"}
            </Button>
          </>
        )}
      </section>

      <section className="border-t border-border px-5 pt-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Search className="h-4 w-4 text-muted-foreground" />
          Search entries
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="search-from">From</Label>
            <Input
              id="search-from"
              type="date"
              value={searchFrom}
              onChange={(e) => setSearchFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-to">To</Label>
            <Input
              id="search-to"
              type="date"
              value={searchTo}
              onChange={(e) => setSearchTo(e.target.value)}
            />
          </div>
        </div>

        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => void handleSearch()}
          disabled={searching}
        >
          {searching ? "Searching…" : "Search"}
        </Button>

        {searchResults.length > 0 && (
          <ul className="mt-4 space-y-3">
            {searchResults.map((entry) => (
              <li
                key={entry.id}
                className="cursor-pointer rounded-2xl border border-border bg-white p-4 transition-colors hover:bg-muted/30"
                onClick={() => setDate(entry.date)}
              >
                <p className="text-sm font-medium">
                  {format(parseISO(entry.date), "MMM d, yyyy")}
                </p>
                {entry.wentWell && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {entry.wentWell}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
