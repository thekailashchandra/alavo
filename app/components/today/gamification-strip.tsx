"use client";

import type { GamificationState } from "@/lib/gamification";

export function GamificationStrip({ state }: { state: GamificationState }) {
  return (
    <div className="mx-5 rounded-2xl border border-gray-20 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-60">
            Level {state.level}
          </p>
          <p className="text-sm font-semibold text-gray-100">
            {state.xp} XP total
          </p>
        </div>
        <div className="text-right text-xs text-gray-60">
          {state.xpToNextLevel} XP to level {state.level + 1}
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-80 to-primary-100 transition-all duration-500"
          style={{ width: `${state.xpIntoLevel}%` }}
        />
      </div>

      {state.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {state.badges.map((badge) => (
            <span
              key={badge.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary-20 px-2.5 py-1 text-[11px] font-medium text-primary-120"
              title={badge.label}
            >
              <span>{badge.emoji}</span>
              {badge.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
