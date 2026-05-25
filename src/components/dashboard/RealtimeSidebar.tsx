"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { BROWSER_LABEL, DEVICE_LABEL } from "@/lib/constants";
import { countryFlag, countryName, referrerHost } from "@/lib/countries";
import type { BreakdownRow } from "@/lib/analytics";
import type { LiveFeedItem } from "@/lib/analytics";

interface RealtimeSidebarProps {
  siteName: string;
  liveCount: number;
  minuteSeries: { label: string; pageviews: number }[];
  referrers: BreakdownRow[];
  countries: BreakdownRow[];
  devices: BreakdownRow[];
  feed: LiveFeedItem[];
}

export function RealtimeSidebar({
  siteName,
  liveCount,
  minuteSeries,
  referrers,
  countries,
  devices,
  feed,
}: RealtimeSidebarProps) {
  const total30 = minuteSeries.reduce((a, b) => a + b.pageviews, 0);
  const peak = minuteSeries.reduce(
    (best, p) => (p.pageviews > best.pageviews ? p : best),
    { label: "—", pageviews: 0 }
  );

  return (
    <aside className="flex h-full w-full max-w-md flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {liveCount} live on {siteName}
        </p>
      </div>

      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Last 30 min
        </p>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
          {total30} pageviews · peak {peak.pageviews} @ {peak.label}
        </p>
        <div className="mt-3 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={minuteSeries}>
              <defs>
                <linearGradient id="oaPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6 }}
                labelStyle={{ display: "none" }}
              />
              <Area
                type="monotone"
                dataKey="pageviews"
                stroke="#059669"
                fill="url(#oaPv)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <MiniSection title="Referrers" rows={referrers} />
      <MiniSection title="Countries" rows={countries} showFlag />
      <MiniSection title="Devices" rows={devices} />

      <div className="flex min-h-0 flex-1 flex-col border-t border-zinc-100 dark:border-zinc-800">
        <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Live feed
        </p>
        <ul className="flex-1 overflow-y-auto px-3 pb-4">
          {feed.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-zinc-500">
              No visitors online
            </li>
          ) : (
            feed.map((v) => (
              <li
                key={v.visitor_id}
                className="mb-2 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                <p className="truncate font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {v.path || "/"}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
                  {countryFlag(v.country_code)}{" "}
                  {countryName(v.country_code)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {BROWSER_LABEL[v.browser ?? 0]} ·{" "}
                  {DEVICE_LABEL[v.device ?? 0]} · via{" "}
                  {v.source?.trim() || referrerHost(v.referrer) || "Direct"}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}

function MiniSection({
  title,
  rows,
  showFlag,
}: {
  title: string;
  rows: BreakdownRow[];
  showFlag?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </p>
      <ul className="mt-2 space-y-1">
        {rows.map((r) => (
          <li
            key={r.key}
            className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300"
          >
            <span className="flex items-center gap-1.5 truncate">
              {showFlag && <span>{r.icon}</span>}
              {r.label}
            </span>
            <span className="tabular-nums text-zinc-500">({r.count})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
