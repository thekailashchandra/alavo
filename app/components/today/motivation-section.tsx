"use client";

import { Quote, Sparkles } from "lucide-react";
import {
  getAchievementNotifications,
  getDailyQuote,
} from "@/lib/motivation";
import type { GamificationState } from "@/lib/gamification";

type MotivationSectionProps = {
  gamification: GamificationState;
  completionRate: number;
  dailyStreak: number;
};

export function MotivationSection({
  gamification,
  completionRate,
  dailyStreak,
}: MotivationSectionProps) {
  const quote = getDailyQuote();
  const notifications = getAchievementNotifications(
    gamification.badges,
    completionRate,
    dailyStreak
  );

  return (
    <section className="space-y-3 px-5 pb-4">
      <h2 className="text-sm font-semibold text-gray-100">
        Motivational messages
      </h2>

      <div className="rounded-2xl border border-gray-20 bg-gradient-to-br from-primary-20 to-primary-20 p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-100">
          <Quote className="h-3.5 w-3.5" />
          Daily motivational quote
        </p>
        <p className="text-sm leading-relaxed text-gray-100">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="mt-2 text-xs text-gray-60">— {quote.author}</p>
      </div>

      <div className="rounded-2xl border border-gray-20 bg-white p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-60">
          <Sparkles className="h-3.5 w-3.5" />
          Achievement & reward notifications
        </p>
        <ul className="space-y-2">
          {notifications.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-xl bg-primary-20/50 px-3 py-2.5"
            >
              <span className="text-lg">{item.emoji}</span>
              <span>
                <span className="block text-xs font-semibold text-gray-100">
                  {item.title}
                </span>
                <span className="block text-[11px] text-primary-100">
                  {item.message}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
