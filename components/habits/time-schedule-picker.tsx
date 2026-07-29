"use client";

import { useMemo } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export type ScheduleMode = "range";

export type TimeScheduleValue = {
  mode: ScheduleMode;
  targetTime: string;
  endTime: string;
  durationMinutes: number | null;
};

type TimeSchedulePickerProps = {
  value: TimeScheduleValue;
  onChange: (value: TimeScheduleValue) => void;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseTime(value: string) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return { hour12: 7, minute: 0, period: "AM" as const };
  }
  const [h24, minute] = value.split(":").map(Number);
  const period = h24 >= 12 ? ("PM" as const) : ("AM" as const);
  const hour12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hour12, minute, period };
}

function toHHmm(hour12: number, minute: number, period: "AM" | "PM") {
  let h24 = hour12 % 12;
  if (period === "PM") h24 += 12;
  return `${pad(h24)}:${pad(minute)}`;
}

function minutesFromMidnight(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number) {
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${pad(h)}:${pad(m)}`;
}

function addMinutes(time: string, mins: number) {
  return fromMinutes(minutesFromMidnight(time) + mins);
}

function diffMinutes(start: string, end: string) {
  let diff = minutesFromMidnight(end) - minutesFromMidnight(start);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

function formatDisplay(value: string) {
  const { hour12, minute, period } = parseTime(value || "07:00");
  return `${hour12}:${pad(minute)} ${period}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return h === 1 ? "1 hour" : `${h} hours`;
  return `${h}h ${m}m`;
}

function nearestMinute(minute: number) {
  return MINUTES.reduce((prev, curr) =>
    Math.abs(curr - minute) < Math.abs(prev - minute) ? curr : prev
  );
}

function cycle(list: number[], current: number, direction: 1 | -1) {
  const idx = list.indexOf(current);
  const safeIdx = idx === -1 ? 0 : idx;
  return list[(safeIdx + direction + list.length) % list.length]!;
}

function TimeStepper({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const parsed = parseTime(value || "07:00");
  const minute = nearestMinute(parsed.minute);

  const setPart = (
    patch: Partial<{ hour12: number; minute: number; period: "AM" | "PM" }>
  ) => {
    const next = {
      hour12: parsed.hour12,
      minute,
      period: parsed.period,
      ...patch,
    };
    onChange(toHHmm(next.hour12, next.minute, next.period));
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-3xl font-semibold tracking-tight tabular-nums text-zinc-900">
        {formatDisplay(value || "07:00")}
      </p>

      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            aria-label="Increase hour"
            onClick={() => setPart({ hour12: cycle(HOURS_12, parsed.hour12, 1) })}
            className="flex h-8 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <span className="text-2xl font-semibold tabular-nums text-zinc-900">
            {parsed.hour12}
          </span>
          <button
            type="button"
            aria-label="Decrease hour"
            onClick={() => setPart({ hour12: cycle(HOURS_12, parsed.hour12, -1) })}
            className="flex h-8 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        <span className="pb-1 text-2xl font-semibold text-zinc-300">:</span>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            aria-label="Increase minutes"
            onClick={() => setPart({ minute: cycle(MINUTES, minute, 1) })}
            className="flex h-8 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <span className="text-2xl font-semibold tabular-nums text-zinc-900">
            {pad(minute)}
          </span>
          <button
            type="button"
            aria-label="Decrease minutes"
            onClick={() => setPart({ minute: cycle(MINUTES, minute, -1) })}
            className="flex h-8 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[220px] grid-cols-2 gap-2">
        {(["AM", "PM"] as const).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => setPart({ period })}
            className={cn(
              "h-10 rounded-full text-sm font-semibold transition",
              parsed.period === period
                ? "bg-primary text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            )}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TimeSchedulePicker({ value, onChange }: TimeSchedulePickerProps) {
  const start = value.targetTime || "07:00";
  const end = value.endTime || addMinutes(start, 30);
  const duration = useMemo(() => diffMinutes(start, end), [start, end]);

  const setStart = (targetTime: string) => {
    const nextEnd =
      minutesFromMidnight(end) <= minutesFromMidnight(targetTime)
        ? addMinutes(targetTime, 30)
        : end;
    onChange({
      mode: "range",
      targetTime,
      endTime: nextEnd,
      durationMinutes: diffMinutes(targetTime, nextEnd),
    });
  };

  const setEnd = (endTime: string) => {
    onChange({
      mode: "range",
      targetTime: start,
      endTime,
      durationMinutes: diffMinutes(start, endTime),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-zinc-900">Schedule</p>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          Set start and end — duration updates automatically
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-5">
        <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
          Start time
        </p>
        <TimeStepper value={start} onChange={setStart} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-5">
        <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
          End time
        </p>
        <TimeStepper value={end} onChange={setEnd} />
      </div>

      <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
          Duration
        </p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-900">
          {formatDuration(duration)}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {formatDisplay(start)} → {formatDisplay(end)}
        </p>
      </div>
    </div>
  );
}
