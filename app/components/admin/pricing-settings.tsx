"use client";

import { useEffect, useState } from "react";
import {
  BILLING_CATALOG,
  BILLING_MARKETS,
  BILLING_SKUS,
  defaultBillingSettings,
  formatMoney,
  type BillingMarket,
  type BillingSettings,
  type BillingSku,
} from "@alavo/brand";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { parseJson } from "@/lib/api-client";

function featuresToText(features: string[]) {
  return features.join("\n");
}

function textToFeatures(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function PackageEditor({
  sku,
  market,
  settings,
  onChange,
}: {
  sku: BillingSku;
  market: BillingMarket;
  settings: BillingSettings;
  onChange: (sku: BillingSku, patch: Partial<BillingSettings["markets"]["IN"]["packages"][BillingSku]>) => void;
}) {
  const pkg = settings.markets[market].packages[sku];
  const currency = settings.markets[market].currency;
  const item = BILLING_CATALOG[sku];

  return (
    <div className="space-y-3 rounded-2xl border border-gray-20 bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-100">{pkg.name}</p>
          <p className="text-xs text-gray-60">
            {sku} · {item.interval}
            {item.interval !== "once" ? "ly access" : " payment"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-gray-60">
            <Switch
              checked={pkg.recommended}
              onCheckedChange={(recommended) => onChange(sku, { recommended })}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-60">
            <Switch
              checked={pkg.enabled}
              onCheckedChange={(enabled) => onChange(sku, { enabled })}
            />
            Visible
          </label>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Display name</Label>
          <Input
            value={pkg.name}
            onChange={(e) => onChange(sku, { name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Price ({currency})</Label>
          <Input
            type="number"
            min={0}
            value={pkg.amount}
            onChange={(e) => onChange(sku, { amount: Number(e.target.value || 0) })}
          />
          <p className="text-xs text-gray-60">
            Shows as {formatMoney(pkg.amount, currency)}
            {item.interval === "month" ? "/mo" : item.interval === "year" ? "/year" : ""}
          </p>
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Tagline</Label>
          <Input
            value={pkg.tagline}
            onChange={(e) => onChange(sku, { tagline: e.target.value })}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Price hint</Label>
          <Input
            value={pkg.hint}
            onChange={(e) => onChange(sku, { hint: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Sort order</Label>
          <Input
            type="number"
            min={0}
            value={pkg.sortOrder}
            onChange={(e) => onChange(sku, { sortOrder: Number(e.target.value || 0) })}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Features (one per line)</Label>
          <textarea
            className="min-h-28 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
            value={featuresToText(pkg.features)}
            onChange={(e) => onChange(sku, { features: textToFeatures(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}

export function AdminPricingSettings() {
  const { fetchWithAuth } = useAuth();
  const [market, setMarket] = useState<BillingMarket>("IN");
  const [settings, setSettings] = useState<BillingSettings>(defaultBillingSettings);
  const [defaults, setDefaults] = useState<BillingSettings>(defaultBillingSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchWithAuth("/api/admin/pricing")
      .then((res) =>
        parseJson<{ settings: BillingSettings; defaults: BillingSettings }>(res)
      )
      .then((json) => {
        setSettings(json.settings);
        setDefaults(json.defaults);
      })
      .catch(() => toast.error("Could not load pricing"))
      .finally(() => setLoading(false));
  }, [fetchWithAuth]);

  const updateMarket = (
    patch: Partial<BillingSettings["markets"][BillingMarket]>
  ) => {
    setSettings((current) => ({
      ...current,
      markets: {
        ...current.markets,
        [market]: { ...current.markets[market], ...patch },
      },
    }));
  };

  const updatePackage = (
    sku: BillingSku,
    patch: Partial<BillingSettings["markets"]["IN"]["packages"][BillingSku]>
  ) => {
    setSettings((current) => ({
      ...current,
      markets: {
        ...current.markets,
        [market]: {
          ...current.markets[market],
          packages: {
            ...current.markets[market].packages,
            [sku]: { ...current.markets[market].packages[sku], ...patch },
          },
        },
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await parseJson<{ settings: BillingSettings }>(res);
      setSettings(json.settings);
      toast.success("Pricing saved for India and international");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-20 bg-card p-6 text-sm text-gray-60">
        Loading pricing…
      </div>
    );
  }

  const current = settings.markets[market];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-100">Pricing & packages</h2>
          <p className="text-xs text-gray-60">
            Edit prices, copy, and which plans appear for each country/currency.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BILLING_MARKETS.map((id) => (
            <Button
              key={id}
              size="sm"
              variant={market === id ? "default" : "outline"}
              onClick={() => setMarket(id)}
            >
              {id === "IN" ? "India · INR" : "International · USD"}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-gray-20 bg-card p-4">
        <div className="space-y-1">
          <Label>Market label</Label>
          <Input
            value={current.label}
            onChange={(e) => updateMarket({ label: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Intro copy</Label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
            value={current.intro}
            onChange={(e) => updateMarket({ intro: e.target.value })}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Free plan name</Label>
            <Input
              value={current.free.name}
              onChange={(e) =>
                updateMarket({ free: { ...current.free, name: e.target.value } })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Free plan tagline</Label>
            <Input
              value={current.free.tagline}
              onChange={(e) =>
                updateMarket({ free: { ...current.free, tagline: e.target.value } })
              }
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Free plan features (one per line)</Label>
          <textarea
            className="min-h-28 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
            value={featuresToText(current.free.features)}
            onChange={(e) =>
              updateMarket({
                free: { ...current.free, features: textToFeatures(e.target.value) },
              })
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        {BILLING_SKUS.map((sku) => (
          <PackageEditor
            key={sku}
            sku={sku}
            market={market}
            settings={settings}
            onChange={updatePackage}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save pricing"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setSettings((current) => ({
              ...current,
              markets: {
                ...current.markets,
                [market]: defaults.markets[market],
              },
            }));
            toast.message("Restored defaults for this market — save to apply");
          }}
        >
          Reset {market === "IN" ? "India" : "international"} to defaults
        </Button>
      </div>
    </section>
  );
}
