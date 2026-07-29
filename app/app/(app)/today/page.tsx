"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { parseJson, type TodayResponse } from "@/lib/api-client";
import { statusTextClass } from "@/lib/status";
import { getTodayInTimezone, rateToStatus } from "@/lib/habits";

export default function TodayPage() {
  const { fetchWithAuth, user } = useAuth();
  const { queueLog } = useOfflineSync();
  const timezone =
    user?.timezone ??
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      : "UTC");
  const [date, setDate] = useState(() => getTodayInTimezone(timezone));
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDate(getTodayInTimezone(timezone));
  }, [timezone]);

  const loadToday = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/habits/today?date=${date}`);
      const json = await parseJson<TodayResponse>(res);
      setData(json);
    } catch {
      toast.error("Could not load today’s habits");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, date]);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  const shiftDate = (days: number) => {
    const d = parseISO(date);
    d.setDate(d.getDate() + days);
    setDate(format(d, "yyyy-MM-dd"));
  };

  const summary = useMemo(() => {
    const habits = data?.habits ?? [];
    const total = habits.length;
    const completed = habits.filter((h) => h.log?.completed).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, rate };
  }, [data]);

  const handleToggle = async (
    habitId: string,
    completed: boolean,
    note?: string | null
  ) => {
    const previous = data;
    if (data) {
      setData({
        ...data,
        habits: data.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                log: {
                  id: h.log?.id ?? "temp",
                  habitId,
                  date,
                  completed,
                  note: note ?? h.log?.note ?? null,
                },
              }
            : h
        ),
      });
    }

    try {
      await queueLog({ habitId, date, completed, note });
      void loadToday();
    } catch {
      setData(previous);
      toast.error("Could not update habit");
    }
  };

  const rateStatus = rateToStatus(summary.rate);

  return (
    <div className="pb-4">
      <header className="px-5 pb-4 pt-8">
        <p className="text-sm text-muted-foreground">
          {format(parseISO(date), "EEEE, MMMM d")}
        </p>
        <h1 className="brand-title mt-1 text-2xl font-semibold tracking-tight">
          Today
        </h1>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(new Date().toISOString().slice(0, 10))}
          >
            Jump to today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => shiftDate(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="px-5 pb-5">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className={`text-2xl font-semibold ${statusTextClass[rateStatus]}`}>
                {summary.rate}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Done</p>
              <p className="text-2xl font-semibold text-foreground">
                {summary.completed}
                <span className="text-base font-normal text-muted-foreground">
                  /{summary.total}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <HabitChecklist
        habits={data?.habits ?? []}
        date={date}
        timezone={timezone}
        onToggle={handleToggle}
        loading={loading}
      />
    </div>
  );
}
