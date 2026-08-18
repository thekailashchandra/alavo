"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { GamificationStrip } from "@/components/today/gamification-strip";
import { SettingsBackHeader } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";
import { parseJson } from "@/lib/api-client";
import type { GamificationState } from "@/lib/gamification";

const ALL_BADGES = [
  { id: "first", label: "First win", emoji: "✨", hint: "Complete any habit" },
  { id: "streak-3", label: "3-day streak", emoji: "🔥", hint: "3-day daily streak" },
  { id: "streak-7", label: "Week warrior", emoji: "🏆", hint: "7-day daily streak" },
  { id: "perfect", label: "Perfect day", emoji: "💯", hint: "100% completion today" },
  { id: "streak-14", label: "Fortnight hero", emoji: "⭐", hint: "14-day best streak" },
  { id: "level-5", label: "Level 5", emoji: "🎯", hint: "Reach level 5" },
];

export default function RewardsSettingsPage() {
  const { fetchWithAuth } = useAuth();
  const [state, setState] = useState<GamificationState | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    dailyStreak: 0,
    completionRate: 0,
  });

  useEffect(() => {
    void fetchWithAuth("/api/settings/gamification")
      .then((res) =>
        parseJson<{
          gamification: GamificationState;
          stats: typeof stats;
        }>(res)
      )
      .then((json) => {
        setState(json.gamification);
        setStats(json.stats);
      })
      .catch(() => {});
  }, [fetchWithAuth]);

  const earned = new Set(state?.badges.map((b) => b.id) ?? []);

  return (
    <div className="space-y-6 pb-8">
      <SettingsBackHeader
        title="Rewards & achievements"
        subtitle="XP, levels, and badges earned from your habits"
      />

      {state ? (
        <GamificationStrip state={state} />
      ) : (
        <div className="mx-5 rounded-2xl border border-gray-20 bg-white p-6 text-center text-sm text-gray-60">
          Loading rewards…
        </div>
      )}

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Your stats
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            ["Total done", stats.totalCompleted],
            ["Daily streak", stats.dailyStreak],
            ["Today", `${stats.completionRate}%`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-20 bg-white p-3 text-center"
            >
              <p className="text-lg font-semibold text-gray-100">{value}</p>
              <p className="text-[11px] text-gray-60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          All achievements
        </h2>
        <div className="space-y-2">
          {ALL_BADGES.map((badge) => {
            const unlocked = earned.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  unlocked
                    ? "border-primary-30 bg-primary-20/60"
                    : "border-gray-20 bg-white opacity-70"
                }`}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <span className="flex-1">
                  <span className="block text-sm font-medium text-gray-100">
                    {badge.label}
                  </span>
                  <span className="block text-xs text-gray-60">{badge.hint}</span>
                </span>
                <span className="text-xs font-medium text-primary-100">
                  {unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5">
        <Button asChild variant="outline" className="w-full">
          <Link href="/today">Keep earning XP on Today</Link>
        </Button>
      </section>
    </div>
  );
}
