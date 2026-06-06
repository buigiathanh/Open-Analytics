"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  BreakdownRow,
  CustomEventRecentItem,
  CustomEventSeriesPoint,
} from "@/lib/analytics";

function formatProps(source: string | null): string {
  if (!source) return "—";
  try {
    const obj = JSON.parse(source) as Record<string, unknown>;
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return Object.entries(obj)
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join(" · ");
    }
  } catch {
    /* plain string */
  }
  return source;
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventBreakdownList({ rows }: { rows: BreakdownRow[] }) {
  const max = rows[0]?.count ?? 1;

  if (rows.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-zinc-500">No events yet</p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-50 dark:divide-zinc-900">
      {rows.map((row) => (
        <li key={row.key} className="px-4 py-2.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
              {row.label}
            </span>
            <span className="shrink-0 tabular-nums text-zinc-600 dark:text-zinc-300">
              {row.count}{" "}
              <span className="text-zinc-400">({row.pct}%)</span>
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500/80"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RecentEventsList({ items }: { items: CustomEventRecentItem[] }) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-zinc-500">
        No recent events
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-50 dark:divide-zinc-900">
      {items.map((item) => (
        <li key={item.id} className="px-4 py-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                {item.event_name}
              </p>
              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {item.path || "/"}
              </p>
              <p className="mt-1 truncate text-xs text-zinc-400">
                {formatProps(item.source)}
              </p>
            </div>
            <time
              dateTime={item.created_at}
              className="shrink-0 text-xs tabular-nums text-zinc-400"
            >
              {formatEventTime(item.created_at)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CustomEventsTrendChart({
  series,
}: {
  series: CustomEventSeriesPoint[];
}) {
  const hasData = series.some((p) => p.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed border-zinc-200 text-sm text-zinc-500 dark:border-zinc-800">
        No custom events in this period
      </div>
    );
  }

  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={series}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
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
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #e4e4e7",
            }}
            formatter={(value) => [value ?? 0, "Events"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ r: 3, fill: "#fff", stroke: "#34d399", strokeWidth: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CustomEventsBlock({
  total,
  periodDays,
  breakdown,
  series,
  recent,
}: {
  total: number;
  periodDays: number;
  breakdown: BreakdownRow[];
  series: CustomEventSeriesPoint[];
  recent: CustomEventRecentItem[];
}) {
  const periodLabel = periodDays === 30 ? "30 days" : "7 days";

  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Custom events
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              Tracked via{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px] dark:bg-zinc-800">
                OpenAnalytics.track()
              </code>{" "}
              · last {periodLabel}
            </p>
          </div>
          <p className="text-sm text-zinc-500">
            <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {total.toLocaleString()}
            </span>{" "}
            total
          </p>
        </div>
      </div>

      <div className="border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 sm:px-5">
        <CustomEventsTrendChart series={series} />
      </div>

      <div className="grid min-h-[280px] divide-y divide-zinc-100 dark:divide-zinc-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="flex min-h-0 flex-col">
          <p className="shrink-0 border-b border-zinc-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            By event name
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EventBreakdownList rows={breakdown} />
          </div>
        </div>
        <div className="flex min-h-0 flex-col">
          <p className="shrink-0 border-b border-zinc-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            Recent
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <RecentEventsList items={recent} />
          </div>
        </div>
      </div>

      {total === 0 && (
        <div className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 sm:px-5">
          Example:{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
            OpenAnalytics.track(&quot;signup&quot;, {"{ plan: &quot;pro&quot; }"}
            )
          </code>
        </div>
      )}
    </section>
  );
}
