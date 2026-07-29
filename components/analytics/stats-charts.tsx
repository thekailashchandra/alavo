"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { rateToStatus } from "@/lib/habits";
import { statusFill } from "@/lib/status";

export type ChartDataPoint = {
  label: string;
  rate: number;
  due: number;
  done: number;
};

type StatsChartsProps = {
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
};

function CustomBar(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartDataPoint;
}) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload) return null;
  const fill = statusFill[rateToStatus(payload.rate)];

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={6}
      ry={6}
      fill={fill}
    />
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartDataPoint }[];
}) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{data.label}</p>
      <p className="text-muted-foreground">
        {data.done}/{data.due} completed · {data.rate}%
      </p>
    </div>
  );
}

function RateChart({ data, title }: { data: ChartDataPoint[]; title: string }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold">{title}</h3>
        <p className="py-8 text-center text-sm text-muted-foreground">
          Not enough data yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e4e4e7"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={{ stroke: "#d4d4d8" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="rate" shape={<CustomBar />} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function StatsCharts({ weekly, monthly }: StatsChartsProps) {
  return (
    <div className="space-y-4">
      <RateChart data={weekly} title="Weekly completion" />
      <RateChart data={monthly} title="Monthly completion" />
    </div>
  );
}
