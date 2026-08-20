"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartColors, type ChartDataPoint } from "@/lib/chart-theme";

function AreaTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
}) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  const colors = chartColors();
  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
      }}
    >
      <p className="font-semibold text-gray-100">{data.label}</p>
      <p className="text-gray-60">
        {data.done}/{data.due} · {data.rate}%
      </p>
    </div>
  );
}

export function ModernAreaChart({
  data,
  title,
  subtitle,
}: {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const CHART = chartColors();
  const todayPoint = data.find((d) => d.isToday);

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
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.fillTop} stopOpacity={0.55} />
                <stop offset="85%" stopColor={CHART.fillBottom} stopOpacity={0.08} />
                <stop offset="100%" stopColor={CHART.fillBottom} stopOpacity={0} />
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
              interval={data.length > 14 ? Math.floor(data.length / 7) : 0}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tick={{ fontSize: 10, fill: CHART.axis }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={<AreaTooltip />}
              cursor={{ stroke: CHART.lineLight, strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            {todayPoint ? (
              <ReferenceLine
                x={todayPoint.label}
                stroke={CHART.todayLine}
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            ) : null}
            <Area
              type="monotone"
              dataKey="rate"
              stroke={CHART.line}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: CHART.line,
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
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
