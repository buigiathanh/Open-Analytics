"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TimeSeriesPoint } from "@/lib/analytics";

export type TrendSeriesKey = "pageviews" | "visitors" | "gscClicks";

export type TrendSeriesVisibility = Record<TrendSeriesKey, boolean>;

const SERIES_META: {
  key: TrendSeriesKey;
  label: string;
  color: string;
  dash?: string;
}[] = [
  { key: "pageviews", label: "Pageviews", color: "#a1a1aa" },
  { key: "visitors", label: "Visitors", color: "#18181b" },
  { key: "gscClicks", label: "Search clicks", color: "#4285F4", dash: "4 4" },
];

const DEFAULT_VISIBILITY: TrendSeriesVisibility = {
  pageviews: true,
  visitors: true,
  gscClicks: true,
};

function storageKey(siteId: string) {
  return `oa-trend-series-${siteId}`;
}

function readVisibility(siteId: string): TrendSeriesVisibility {
  if (typeof window === "undefined") return DEFAULT_VISIBILITY;
  try {
    const raw = sessionStorage.getItem(storageKey(siteId));
    if (!raw) return DEFAULT_VISIBILITY;
    const parsed = JSON.parse(raw) as Partial<TrendSeriesVisibility>;
    return { ...DEFAULT_VISIBILITY, ...parsed };
  } catch {
    return DEFAULT_VISIBILITY;
  }
}

function SeriesToggle({
  meta,
  checked,
  onChange,
}: {
  meta: (typeof SERIES_META)[number];
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        checked
          ? "border-zinc-300 bg-white text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          : "border-transparent bg-zinc-100/80 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span
        className="inline-block h-0.5 w-4 shrink-0 rounded"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </label>
  );
}

export function TrendChart({
  series,
  showSearchConsole = false,
  siteId,
}: {
  series: TimeSeriesPoint[];
  showSearchConsole?: boolean;
  siteId: string;
}) {
  const hasGscData =
    showSearchConsole && series.some((s) => s.gscClicks != null);

  const availableKeys = useMemo(() => {
    const keys: TrendSeriesKey[] = ["pageviews", "visitors"];
    if (hasGscData) keys.push("gscClicks");
    return keys;
  }, [hasGscData]);

  const [visible, setVisible] = useState<TrendSeriesVisibility>(DEFAULT_VISIBILITY);

  useEffect(() => {
    setVisible(readVisibility(siteId));
  }, [siteId]);

  const persist = useCallback(
    (next: TrendSeriesVisibility) => {
      setVisible(next);
      sessionStorage.setItem(storageKey(siteId), JSON.stringify(next));
    },
    [siteId]
  );

  function toggle(key: TrendSeriesKey, checked: boolean) {
    const next = { ...visible, [key]: checked };
    const anyOn = availableKeys.some((k) => next[k]);
    if (!anyOn) return;
    persist(next);
  }

  const showPageviews = visible.pageviews;
  const showVisitors = visible.visitors;
  const showGsc = hasGscData && visible.gscClicks;
  const showRightAxis = showGsc;
  const showLeftAxis = showPageviews || showVisitors;

  const hasAnalytics = series.some((s) => s.pageviews > 0 || s.visitors > 0);
  const anyVisible = availableKeys.some((k) => visible[k]);

  if (!hasAnalytics && !hasGscData) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        No data in the last 7 days
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">Show:</span>
        {SERIES_META.filter((m) => availableKeys.includes(m.key)).map((meta) => (
          <SeriesToggle
            key={meta.key}
            meta={meta}
            checked={visible[meta.key]}
            onChange={(checked) => toggle(meta.key, checked)}
          />
        ))}
      </div>

      {!anyVisible ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-zinc-500">
          Select at least one metric to display
        </div>
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={series}
              margin={{
                top: 8,
                right: showRightAxis ? 44 : 8,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e4e4e7"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              {showLeftAxis && (
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "#71717a" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
              )}
              {showRightAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#4285F4" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
              )}
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e4e4e7",
                  fontSize: 12,
                }}
              />
              {showPageviews && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="pageviews"
                  name="Pageviews"
                  stroke="#a1a1aa"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
              {showVisitors && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke="#3f3f46"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
              {showGsc && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="gscClicks"
                  name="Search clicks"
                  stroke="#4285F4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
