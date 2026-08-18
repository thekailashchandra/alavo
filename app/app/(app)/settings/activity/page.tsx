"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, CheckCircle2, CircleDashed } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { SettingsBackHeader } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";
import { parseJson } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type ActivityItem = {
  id: string;
  habitId: string;
  habitName: string;
  habitIcon: string;
  date: string;
  completed: boolean;
  note: string | null;
};

type Filter = "all" | "completed" | "incomplete";

export default function ActivitySettingsPage() {
  const { fetchWithAuth } = useAuth();
  const [filter, setFilter] = useState<Filter>("completed");
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState({ completedCount: 0, incompleteCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchWithAuth(`/api/settings/activity?filter=${filter}&limit=40`)
      .then((res) =>
        parseJson<{
          items: ActivityItem[];
          stats: { completedCount: number; incompleteCount: number };
        }>(res)
      )
      .then((json) => {
        setItems(json.items as ActivityItem[]);
        setStats(json.stats);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter, fetchWithAuth]);

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "completed", label: "Completed", count: stats.completedCount },
    { id: "incomplete", label: "Incomplete", count: stats.incompleteCount },
    { id: "all", label: "All", count: stats.completedCount + stats.incompleteCount },
  ];

  return (
    <div className="space-y-6 pb-8">
      <SettingsBackHeader
        title="Activity history"
        subtitle="Review completed and missed habits"
      />

      <section className="px-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
                filter === tab.id
                  ? "bg-primary-100 text-white"
                  : "bg-primary-20 text-primary-100 hover:bg-primary-30"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </section>

      <section className="px-5">
        <Link
          href="/analytics"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-gray-20 bg-white p-4 transition hover:border-primary-30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-30 text-primary-100">
            <BarChart3 className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-gray-100">
              Statistics & analytics
            </span>
            <span className="block text-xs text-gray-60">
              Open charts and performance insights
            </span>
          </span>
        </Link>

        <div className="space-y-2">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-60">Loading…</p>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-20 py-10 text-center text-sm text-gray-60">
              No activity found for this filter.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-20 bg-white p-3"
              >
                <span className="text-xl">{item.habitIcon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-100">
                    {item.habitName}
                  </span>
                  <span className="block text-xs text-gray-60">
                    {item.date}
                    {item.note ? ` · ${item.note}` : ""}
                  </span>
                </span>
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <CircleDashed className="h-5 w-5 shrink-0 text-gray-30" />
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="px-5">
        <Button asChild variant="outline" className="w-full">
          <Link href="/today">Go to today&apos;s habits</Link>
        </Button>
      </section>
    </div>
  );
}
