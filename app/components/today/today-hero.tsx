"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/today/progress-ring";

export type WeekDaySummary = {
  date: string;
  label: string;
  rate: number;
  isToday: boolean;
  isFuture: boolean;
};

type TodayHeroProps = {
  userName: string;
  avatarUrl?: string | null;
  dailyStreak: number;
  weekDays: WeekDaySummary[];
  selectedDate: string;
  todayDate: string;
  completionRate: number;
  motivationMessage?: string;
  onSelectDate: (date: string) => void;
};

function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function WeekDayRing({
  day,
  selected,
  onSelect,
}: {
  day: WeekDaySummary;
  selected: boolean;
  onSelect: () => void;
}) {
  const active = selected || day.isToday;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={day.isFuture || !day.date}
      className={cn(
        "flex flex-col items-center gap-1 transition-opacity",
        day.isFuture && "cursor-default opacity-40"
      )}
      aria-label={`${day.label}, ${day.rate}% complete`}
      aria-current={selected ? "date" : undefined}
    >
      <div
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-full sm:h-11 sm:w-11",
          active && "ring-2 ring-primary-100/25 ring-offset-2 ring-offset-primary-10"
        )}
      >
        <ProgressRing
          value={day.isFuture ? 0 : day.rate}
          size={40}
          stroke={3}
          active={active}
          trackClassName="stroke-gray-20"
        />
        <span
          className={cn(
            "absolute text-[10px] font-semibold",
            active ? "text-primary-100" : "text-gray-60"
          )}
        >
          {day.label}
        </span>
      </div>
    </button>
  );
}

export function TodayHero({
  userName,
  avatarUrl,
  dailyStreak,
  weekDays,
  selectedDate,
  todayDate,
  completionRate,
  motivationMessage,
  onSelectDate,
}: TodayHeroProps) {
  const viewingToday = selectedDate === todayDate;
  const calendarWeek = weekDays.slice(0, 7);

  return (
    <section className="px-5 pb-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-80 to-primary-120 text-sm font-semibold text-white shadow-sm">
              {userInitials(userName)}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-primary-80" />
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-gray-20 bg-white px-3 py-1.5 shadow-sm">
          <Flame className="h-4 w-4 fill-primary-100 text-primary-100" />
          <span className="text-base font-bold tabular-nums text-gray-100">
            {dailyStreak}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1">
        {calendarWeek.map((day, index) => (
          <WeekDayRing
            key={day.date || `day-${index}`}
            day={day}
            selected={day.date === selectedDate}
            onSelect={() => day.date && onSelectDate(day.date)}
          />
        ))}
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-left text-2xl font-semibold tracking-tight text-gray-100">
          {viewingToday ? "Today" : "Your day"}
        </h1>

        <div className="relative mx-auto mt-4 inline-flex items-center justify-center">
          <ProgressRing
            value={completionRate}
            size={200}
            stroke={16}
            active
            showKnob
            trackClassName="stroke-gray-20"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="font-sans text-5xl font-bold tabular-nums leading-none text-gray-100">
              {completionRate}
              <span className="ml-0.5 text-2xl font-semibold text-gray-60">%</span>
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-gray-80">
          {motivationMessage ??
            (viewingToday
              ? "Keep your streak going"
              : "Tap a day above to jump back")}
        </p>
      </div>
    </section>
  );
}
