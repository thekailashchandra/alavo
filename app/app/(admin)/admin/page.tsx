"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { BILLING_CATALOG, BILLING_SKUS, formatInr, type BillingSku } from "@alavo/brand";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseJson, type BillingSnapshot } from "@/lib/api-client";

type Overview = {
  users: {
    total: number;
    verified: number;
    trial: number;
    paid: number;
    lifetime: number;
    pro: number;
    team: number;
  };
  revenue: { totalPaise: number; monthPaise: number; payments: number };
  coupons: { total: number; redemptions: number };
  habits: number;
};

type AdminUser = {
  id: string;
  email: string;
  emailVerified: string | null;
  createdAt: string;
  plan: string;
  planExpiresAt: string | null;
  lifetime: boolean;
  trialEndsAt: string | null;
  habitCount: number;
  paymentCount: number;
  addons: string[];
  billing: BillingSnapshot;
};

type CouponRow = {
  id: string;
  code: string;
  kind: "PERCENT" | "AMOUNT" | "GRANT";
  percentOff: number | null;
  amountOffPaise: number | null;
  grantSku: BillingSku | null;
  maxRedemptions: number | null;
  expiresAt: string | null;
  active: boolean;
  note: string | null;
  description: string;
  redemptionCount: number;
};

type PaymentRow = {
  id: string;
  email: string;
  name: string;
  amountInr: number;
  paidAt: string | null;
  coupon: string | null;
};

const GRANT_OPTIONS: { sku: BillingSku; label: string }[] = BILLING_SKUS.map((sku) => ({
  sku,
  label: BILLING_CATALOG[sku].name,
}));

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-20 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-60">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-100">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const { fetchWithAuth } = useAuth();
  const [tab, setTab] = useState<"overview" | "users" | "coupons" | "payments">(
    "overview"
  );
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newGrant, setNewGrant] = useState<BillingSku | "">("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    kind: "PERCENT" as CouponRow["kind"],
    percentOff: "20",
    amountOffInr: "50",
    grantSku: "LIFETIME" as BillingSku,
    maxRedemptions: "",
    expiresAt: "",
    note: "",
  });

  const loadOverview = useCallback(async () => {
    const res = await fetchWithAuth("/api/admin/overview");
    setOverview(await parseJson<Overview>(res));
  }, [fetchWithAuth]);

  const loadUsers = useCallback(
    async (nextPage = page, q = query) => {
      const res = await fetchWithAuth(
        `/api/admin/users?page=${nextPage}&q=${encodeURIComponent(q)}`
      );
      const json = await parseJson<{ users: AdminUser[]; total: number }>(res);
      setUsers(json.users);
      setUserTotal(json.total);
    },
    [fetchWithAuth, page, query]
  );

  const loadCoupons = useCallback(async () => {
    const res = await fetchWithAuth("/api/admin/coupons");
    const json = await parseJson<{ coupons: CouponRow[] }>(res);
    setCoupons(json.coupons);
  }, [fetchWithAuth]);

  const loadPayments = useCallback(async () => {
    const res = await fetchWithAuth("/api/admin/payments");
    const json = await parseJson<{ payments: PaymentRow[] }>(res);
    setPayments(json.payments);
  }, [fetchWithAuth]);

  useEffect(() => {
    void loadOverview().catch(() => toast.error("Could not load overview"));
  }, [loadOverview]);

  useEffect(() => {
    if (tab === "users") void loadUsers().catch(() => toast.error("Could not load users"));
    if (tab === "coupons") void loadCoupons().catch(() => toast.error("Could not load coupons"));
    if (tab === "payments") {
      void loadPayments().catch(() => toast.error("Could not load payments"));
    }
  }, [tab, loadUsers, loadCoupons, loadPayments]);

  const patchUser = async (id: string, action: "make_free" | "grant", sku?: BillingSku) => {
    try {
      const res = await fetchWithAuth(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sku }),
      });
      await parseJson(res);
      toast.success(action === "make_free" ? "User set to Free" : "Plan granted");
      await loadUsers();
      await loadOverview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  const createUser = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          grantSku: newGrant || null,
        }),
      });
      const json = await parseJson<{ temporaryPassword: string }>(res);
      setTempPassword(json.temporaryPassword);
      setNewEmail("");
      toast.success("User created");
      await loadUsers(1, "");
      await loadOverview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create user");
    }
  };

  const createCoupon = async () => {
    try {
      const res = await fetchWithAuth("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponForm.code,
          kind: couponForm.kind,
          percentOff:
            couponForm.kind === "PERCENT" ? Number(couponForm.percentOff) : null,
          amountOffInr:
            couponForm.kind === "AMOUNT" ? Number(couponForm.amountOffInr) : null,
          grantSku: couponForm.kind === "GRANT" ? couponForm.grantSku : null,
          maxRedemptions: couponForm.maxRedemptions
            ? Number(couponForm.maxRedemptions)
            : null,
          expiresAt: couponForm.expiresAt
            ? new Date(couponForm.expiresAt).toISOString()
            : null,
          note: couponForm.note || null,
        }),
      });
      await parseJson(res);
      toast.success("Coupon created");
      setCouponForm((f) => ({ ...f, code: "", note: "" }));
      await loadCoupons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create coupon");
    }
  };

  const toggleCoupon = async (id: string, active: boolean) => {
    try {
      const res = await fetchWithAuth(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      await parseJson(res);
      await loadCoupons();
    } catch {
      toast.error("Could not update coupon");
    }
  };

  const tabs = [
    ["overview", "Overview"],
    ["users", "Users"],
    ["coupons", "Coupons"],
    ["payments", "Payments"],
  ] as const;

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={tab === id ? "default" : "outline"}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </nav>

      {tab === "overview" && overview ? (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total users" value={overview.users.total} />
          <Stat label="Paid plans" value={overview.users.paid} />
          <Stat
            label="Total revenue"
            value={formatInr(overview.revenue.totalPaise / 100)}
          />
          <Stat
            label="This month"
            value={formatInr(overview.revenue.monthPaise / 100)}
          />
          <Stat label="Lifetime" value={overview.users.lifetime} />
          <Stat label="Pro" value={overview.users.pro} />
          <Stat label="Team" value={overview.users.team} />
          <Stat label="Trials" value={overview.users.trial} />
          <Stat label="Verified" value={overview.users.verified} />
          <Stat label="Paid checkouts" value={overview.revenue.payments} />
          <Stat label="Coupons" value={overview.coupons.total} />
          <Stat label="Active habits" value={overview.habits} />
        </section>
      ) : null}

      {tab === "users" ? (
        <section className="space-y-5">
          <div className="rounded-2xl border border-gray-20 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-100">Add a user</h2>
            <p className="text-xs text-gray-60">
              Creates a confirmed account. Leave grant on Free, or comp Pro / Lifetime.
            </p>
            <div className="grid gap-2 md:grid-cols-[1fr_12rem_auto]">
              <Input
                type="email"
                placeholder="name@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <select
                className="h-11 rounded-xl border border-input bg-white px-3 text-sm"
                value={newGrant}
                onChange={(e) => setNewGrant(e.target.value as BillingSku | "")}
              >
                <option value="">Free</option>
                {GRANT_OPTIONS.map((opt) => (
                  <option key={opt.sku} value={opt.sku}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button onClick={() => void createUser()} disabled={!newEmail.trim()}>
                Add user
              </Button>
            </div>
            {tempPassword ? (
              <p className="rounded-xl bg-primary-20 px-3 py-2 text-sm text-primary-120">
                Temporary password (share once):{" "}
                <span className="font-mono font-semibold">{tempPassword}</span>
              </p>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  void loadUsers(1, query);
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                setPage(1);
                void loadUsers(1, query);
              }}
            >
              Search
            </Button>
          </div>

          <p className="text-xs text-gray-60">{userTotal} users</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-20 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-10 text-xs uppercase text-gray-60">
                <tr>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Habits</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id} className="border-b border-gray-10 last:border-0">
                    <td className="px-3 py-3">
                      <p className="font-medium text-gray-100">{row.email}</p>
                      <p className="text-xs text-gray-60">
                        {format(new Date(row.createdAt), "d MMM yyyy")}
                        {row.emailVerified ? "" : " · unverified"}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p>{row.billing.displayPlan}</p>
                      <p className="text-xs text-gray-60">
                        {row.lifetime
                          ? "lifetime"
                          : row.planExpiresAt
                            ? `until ${format(new Date(row.planExpiresAt), "d MMM")}`
                            : row.billing.status}
                      </p>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{row.habitCount}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void patchUser(row.id, "make_free")}
                        >
                          Make free
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void patchUser(row.id, "grant", "LIFETIME")}
                        >
                          Lifetime
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void patchUser(row.id, "grant", "PRO_MONTHLY")}
                        >
                          Pro 30d
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void patchUser(row.id, "grant", "TEAM_MONTHLY")}
                        >
                          Team
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => {
                const next = page - 1;
                setPage(next);
                void loadUsers(next);
              }}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page * 25 >= userTotal}
              onClick={() => {
                const next = page + 1;
                setPage(next);
                void loadUsers(next);
              }}
            >
              Next
            </Button>
          </div>
        </section>
      ) : null}

      {tab === "coupons" ? (
        <section className="space-y-5">
          <div className="rounded-2xl border border-gray-20 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold">Create coupon</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Code</Label>
                <Input
                  value={couponForm.code}
                  onChange={(e) =>
                    setCouponForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="LAUNCH50"
                />
              </div>
              <div className="space-y-1">
                <Label>Type</Label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                  value={couponForm.kind}
                  onChange={(e) =>
                    setCouponForm((f) => ({
                      ...f,
                      kind: e.target.value as CouponRow["kind"],
                    }))
                  }
                >
                  <option value="PERCENT">Percent off</option>
                  <option value="AMOUNT">Amount off (₹)</option>
                  <option value="GRANT">Unlock a plan / add-on</option>
                </select>
              </div>
              {couponForm.kind === "PERCENT" ? (
                <div className="space-y-1">
                  <Label>Percent</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={couponForm.percentOff}
                    onChange={(e) =>
                      setCouponForm((f) => ({ ...f, percentOff: e.target.value }))
                    }
                  />
                </div>
              ) : null}
              {couponForm.kind === "AMOUNT" ? (
                <div className="space-y-1">
                  <Label>Amount off (₹)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={couponForm.amountOffInr}
                    onChange={(e) =>
                      setCouponForm((f) => ({ ...f, amountOffInr: e.target.value }))
                    }
                  />
                </div>
              ) : null}
              {couponForm.kind === "GRANT" ? (
                <div className="space-y-1">
                  <Label>Unlock</Label>
                  <select
                    className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                    value={couponForm.grantSku}
                    onChange={(e) =>
                      setCouponForm((f) => ({
                        ...f,
                        grantSku: e.target.value as BillingSku,
                      }))
                    }
                  >
                    {GRANT_OPTIONS.map((opt) => (
                      <option key={opt.sku} value={opt.sku}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="space-y-1">
                <Label>Max redemptions</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={couponForm.maxRedemptions}
                  onChange={(e) =>
                    setCouponForm((f) => ({ ...f, maxRedemptions: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Expires</Label>
                <Input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={(e) =>
                    setCouponForm((f) => ({ ...f, expiresAt: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Note</Label>
                <Input
                  value={couponForm.note}
                  onChange={(e) =>
                    setCouponForm((f) => ({ ...f, note: e.target.value }))
                  }
                  placeholder="Internal note"
                />
              </div>
            </div>
            <Button onClick={() => void createCoupon()} disabled={!couponForm.code.trim()}>
              Create coupon
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-20 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-10 text-xs uppercase text-gray-60">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Offer</th>
                  <th className="px-3 py-2">Uses</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-10 last:border-0">
                    <td className="px-3 py-3 font-mono font-semibold">{coupon.code}</td>
                    <td className="px-3 py-3">
                      {coupon.description}
                      {coupon.note ? (
                        <p className="text-xs text-gray-60">{coupon.note}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {coupon.redemptionCount}
                      {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void toggleCoupon(coupon.id, !coupon.active)}
                      >
                        {coupon.active ? "Disable" : "Enable"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "payments" ? (
        <section className="overflow-x-auto rounded-2xl border border-gray-20 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-10 text-xs uppercase text-gray-60">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-10 last:border-0">
                  <td className="px-3 py-3 text-xs text-gray-60">
                    {payment.paidAt
                      ? format(new Date(payment.paidAt), "d MMM yyyy HH:mm")
                      : "—"}
                  </td>
                  <td className="px-3 py-3">{payment.email}</td>
                  <td className="px-3 py-3">
                    {payment.name}
                    {payment.coupon ? (
                      <span className="ml-2 text-xs text-primary-100">{payment.coupon}</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 font-semibold tabular-nums">
                    {formatInr(payment.amountInr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
