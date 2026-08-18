"use client";

import Link from "next/link";
import { Award, History, Share2, Users } from "lucide-react";
import type { GamificationState } from "@/lib/gamification";
import { GamificationStrip } from "@/components/today/gamification-strip";

type MainRewardsSectionProps = {
  state: GamificationState;
};

export function MainRewardsSection({ state }: MainRewardsSectionProps) {
  return (
    <section className="space-y-3 px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-100">
          Rewards & achievements
        </h2>
        <Link
          href="/settings/rewards"
          className="text-xs font-medium text-primary-100 hover:text-primary-120"
        >
          View all
        </Link>
      </div>

      <GamificationStrip state={state} />

      <div className="rounded-2xl border border-gray-20 bg-white p-4 space-y-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-60">
            <Award className="h-3.5 w-3.5" />
            Current rewards
          </p>
          {state.badges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {state.badges.map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-20 px-2.5 py-1 text-[11px] font-medium text-primary-120"
                >
                  <span>{badge.emoji}</span>
                  {badge.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-60">
              Complete habits to earn your first badge.
            </p>
          )}
        </div>

        <div className="border-t border-gray-10 pt-4">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-60">
            <Users className="h-3.5 w-3.5" />
            Social achievements
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-primary-20/60 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium text-gray-100">
                  Progress comparison with friends
                </p>
                <p className="text-[11px] text-gray-60">
                  Invite friends to compare streaks
                </p>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-primary-100">
                Soon
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-primary-20/60 px-3 py-2.5">
              <div>
                <p className="text-xs font-medium text-gray-100">
                  Shared achievements with friends
                </p>
                <p className="text-[11px] text-gray-60">
                  Celebrate milestones together
                </p>
              </div>
              <Share2 className="h-4 w-4 text-gray-30" />
            </div>
          </div>
        </div>

        <Link
          href="/settings/rewards"
          className="flex items-center gap-2 rounded-xl border border-gray-20 px-3 py-2.5 text-sm font-medium text-primary-100 transition hover:bg-primary-20"
        >
          <History className="h-4 w-4" />
          History of achievements and rewards
        </Link>
      </div>
    </section>
  );
}
