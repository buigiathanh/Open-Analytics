"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { BreakdownRow } from "@/lib/analytics";

const SLICE_COLORS = [
  "#059669",
  "#10b981",
  "#34d399",
  "#047857",
  "#18181b",
  "#3f3f46",
  "#71717a",
  "#a1a1aa",
  "#d4d4d8",
];

type ChartSlice = {
  key: string;
  name: string;
  value: number;
  pct: number;
  iconUrl?: string;
};

function buildChartData(rows: BreakdownRow[]): ChartSlice[] {
  const top = rows.slice(0, 8);
  const rest = rows.slice(8);
  const slices: ChartSlice[] = top.map((r) => ({
    key: r.key,
    name: r.label,
    value: r.count,
    pct: r.pct,
    iconUrl: r.iconUrl,
  }));

  if (rest.length > 0) {
    const restCount = rest.reduce((s, r) => s + r.count, 0);
    const total = rows.reduce((s, r) => s + r.count, 0);
    slices.push({
      key: "__other__",
      name: "Khác",
      value: restCount,
      pct: total > 0 ? Math.round((restCount / total) * 1000) / 10 : 0,
    });
  }

  return slices;
}

function CountryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartSlice }[];
}) {
  if (!active || !payload?.[0]) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-medium text-zinc-800 dark:text-zinc-200">{item.name}</p>
      <p className="mt-0.5 tabular-nums text-zinc-600 dark:text-zinc-300">
        {item.value.toLocaleString()} visitors ({item.pct}%)
      </p>
    </div>
  );
}

export function CountryStatsBlock({ rows }: { rows: BreakdownRow[] }) {
  const totalVisitors = rows.reduce((sum, r) => sum + r.count, 0);
  const chartData = buildChartData(rows);
  const top = rows[0];

  if (rows.length === 0) {
    return (
      <section className="flex min-h-[320px] flex-col rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="shrink-0 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          By country
        </h3>
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          No country data for this period
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-h-[320px] flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="shrink-0 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800 sm:px-5">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          By country
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          {rows.length} countries · {totalVisitors.toLocaleString()} visitors
          {top ? (
            <>
              {" "}
              · Top:{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {top.label}
              </span>
            </>
          ) : null}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5">
        <div className="relative mx-auto h-[180px] w-full max-w-[200px] shrink-0 sm:mx-0 sm:h-[200px] sm:max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={chartData.length > 1 ? 2 : 0}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CountryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wide text-zinc-400">
              Visitors
            </span>
            <span className="text-lg font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
              {totalVisitors.toLocaleString()}
            </span>
          </div>
        </div>

        <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {chartData.map((item, index) => (
            <li
              key={item.key}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length],
                }}
              />
              {item.iconUrl ? (
                <img
                  src={item.iconUrl}
                  alt=""
                  width={20}
                  height={14}
                  className="h-3.5 w-5 shrink-0 rounded-sm object-cover"
                  loading="lazy"
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate font-medium text-zinc-700 dark:text-zinc-300">
                {item.name}
              </span>
              <span className="shrink-0 tabular-nums text-zinc-500">
                {item.pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
