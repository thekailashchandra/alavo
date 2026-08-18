"use client";

import { useState } from "react";
import { Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { TEAM_SEAT_LIMIT, formatInr, BILLING_CATALOG } from "@alavo/brand";
import { useAuth } from "@/components/providers/auth-provider";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { useCheckout } from "@/hooks/use-checkout";
import { cacheKeys, invalidateCache } from "@/lib/client-cache";
import { parseJson } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaywallDialog } from "@/components/billing/paywall-dialog";

type GroupPayload = {
  locked: boolean;
  groups: {
    id: string;
    name: string;
    inviteCode?: string;
    role: "OWNER" | "MEMBER";
    memberCount: number;
    seatLimit: number;
    challenges: { id: string; name: string; startDate: string; endDate: string }[];
    leaderboard: {
      userId: string;
      email: string;
      role: string;
      rate: number;
      done: number;
      due: number;
    }[];
  }[];
};

export default function TeamPage() {
  const { fetchWithAuth, user } = useAuth();
  const { checkout, pendingSku } = useCheckout();
  const { data, loading, reload } = useCachedQuery<GroupPayload>(
    cacheKeys.groups,
    "/api/groups"
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [paywall, setPaywall] = useState(false);

  const locked = data?.locked ?? !user?.billing?.features.teamGroups;

  const createGroup = async () => {
    if (locked) {
      setPaywall(true);
      return;
    }
    try {
      const res = await fetchWithAuth("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await parseJson(res);
      setName("");
      invalidateCache(cacheKeys.groups);
      await reload();
      toast.success("Group created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create group");
    }
  };

  const joinGroup = async () => {
    try {
      const res = await fetchWithAuth("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      await parseJson(res);
      setCode("");
      invalidateCache(cacheKeys.groups);
      await reload();
      toast.success("Joined group");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not join");
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="px-5 pt-8">
        <h1 className="brand-title text-2xl font-semibold tracking-tight text-gray-100">
          Team & family
        </h1>
        <p className="mt-1 text-sm text-gray-60/80">
          Shared groups, a 7-day leaderboard, and accountability challenges.
        </p>
      </header>

      {locked ? (
        <section className="px-5">
          <div className="rounded-2xl border border-primary-30 bg-primary-20/50 p-5">
            <Users className="h-6 w-6 text-primary-100" />
            <p className="mt-2 text-base font-semibold text-gray-100">
              Team is {formatInr(BILLING_CATALOG.TEAM_MONTHLY.amountInr)}/mo
            </p>
            <p className="mt-1 text-sm text-gray-60">
              Up to {TEAM_SEAT_LIMIT} people. You can still join with an invite
              from someone already on Team.
            </p>
            <Button
              className="mt-4"
              disabled={pendingSku != null}
              onClick={() => void checkout("TEAM_MONTHLY")}
            >
              {pendingSku === "TEAM_MONTHLY" ? "Redirecting…" : "Unlock Team"}
            </Button>
          </div>
        </section>
      ) : null}

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Join with a code
        </h2>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="INVITE CODE"
          />
          <Button onClick={() => void joinGroup()} disabled={!code.trim()}>
            Join
          </Button>
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Create a group
        </h2>
        <Label htmlFor="group-name">Group name</Label>
        <div className="flex gap-2">
          <Input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Family, roommates, gym crew"
          />
          <Button onClick={() => void createGroup()} disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </section>

      <section className="space-y-4 px-5">
        {loading && !data ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        ) : null}
        {(data?.groups ?? []).map((group) => (
          <div key={group.id} className="rounded-2xl border border-gray-20 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-gray-100">{group.name}</p>
                <p className="text-xs text-gray-60">
                  {group.memberCount}/{group.seatLimit} seats · {group.role.toLowerCase()}
                </p>
              </div>
              <Trophy className="h-5 w-5 text-primary-100" />
            </div>
            {group.inviteCode ? (
              <p className="mt-2 rounded-xl bg-primary-20 px-3 py-2 text-xs font-medium text-primary-120">
                Invite code: {group.inviteCode}
              </p>
            ) : null}
            <h3 className="mt-4 text-xs font-semibold uppercase text-gray-60">
              7-day leaderboard
            </h3>
            <ol className="mt-2 space-y-2">
              {group.leaderboard.map((row, index) => (
                <li
                  key={row.userId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-100">
                    {index + 1}. {row.email.split("@")[0]}
                  </span>
                  <span className="tabular-nums font-semibold text-primary-100">
                    {row.rate}%
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <PaywallDialog
        open={paywall}
        onOpenChange={setPaywall}
        feature="teamGroups"
      />
    </div>
  );
}
