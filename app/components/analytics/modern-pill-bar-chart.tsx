"use client";

import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, type ChartDataPoint } from "@/lib/chart-theme";

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
}) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: CHART.tooltipBg,
        borderColor: CHART.tooltipBorder,
      }}
    >
      <p className="font-semibold text-gray-100">{data.label}</p>
      <p className="text-gray-60">
        {data.done}/{data.due} · {data.rate}%
      </p>
    </div>
  );
}

export function ModernPillBarChart({
  data,
  title,
  subtitle,
}: {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
}) {
  const gradientId = useId().replace(/:/g, "");

  if (data.length === 0) {
    return (
      <ChartShell title={title} subtitle={subtitle}>
        <p className="py-12 text-center text-sm text-gray-60">Not enough data yet.</p>
      </ChartShell>
    );
  }

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.barTop} />
                <stop offset="100%" stopColor={CHART.barBottom} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 6"
              vertical={false}
              stroke={CHART.grid}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: CHART.axis, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              interval={data.length > 10 ? Math.floor(data.length / 6) : 0}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tick={{ fontSize: 10, fill: CHART.axis }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(123,8,224,0.04)" }} />
            <Bar
              dataKey="rate"
              maxBarSize={28}
              radius={[999, 999, 999, 999]}
              fill={`url(#${gradientId})`}
              background={{ fill: CHART.barTrack, radius: 999 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-20 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-gray-60">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
