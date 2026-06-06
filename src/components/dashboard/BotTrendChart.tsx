"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BotTimeSeriesPoint } from "@/lib/bot-analytics";
import { botSeriesMeta } from "@/lib/bot-analytics";
import type { BotId } from "@/lib/bots";
import { BOT_OTHER, botIconUrl, PRIMARY_BOT_IDS } from "@/lib/bots";

const DEFAULT_VISIBLE_BOTS = PRIMARY_BOT_IDS;

/** Aggregated visits from bots not individually selected in the picker. */
const OTHER_BOTS_SERIES_KEY = "_restBots";
const OTHER_BOTS_LABEL = "Other bots";

function storageKey(siteId: string) {
  return `oa-bot-series-v2-${siteId}`;
}

function defaultVisibility(botIds: BotId[]): Record<string, boolean> {
  return Object.fromEntries(
    botIds.map((id) => [id, DEFAULT_VISIBLE_BOTS.includes(id)])
  );
}

function readVisibility(
  siteId: string,
  botIds: BotId[]
): Record<string, boolean> {
  const defaults = defaultVisibility(botIds);
  if (typeof window === "undefined") return defaults;
  try {
    const raw = sessionStorage.getItem(storageKey(siteId));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    const merged = { ...defaults };
    for (const id of botIds) {
      if (parsed[id] != null) merged[id] = parsed[id];
    }
    return merged;
  } catch {
    return defaults;
  }
}

function BotPickerItem({
  id,
  label,
  color,
  checked,
  onChange,
}: {
  id: BotId;
  label: string;
  color: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
      />
      <img
        src={botIconUrl(id)}
        alt=""
        width={16}
        height={16}
        className="size-4 shrink-0 rounded-sm object-contain"
        loading="lazy"
      />
      <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
      <span
        className="inline-block h-0.5 w-4 shrink-0 rounded"
        style={{ backgroundColor: color }}
      />
    </label>
  );
}

export function BotTrendChart({
  siteId,
  series,
  botIds,
  periodDays,
}: {
  siteId: string;
  series: BotTimeSeriesPoint[];
  botIds: BotId[];
  periodDays: number;
}) {
  const meta = useMemo(() => botSeriesMeta(botIds), [botIds]);
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    defaultVisibility(botIds)
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredMeta = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return meta;
    return meta.filter(
      (m) =>
        m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
    );
  }, [meta, search]);

  useEffect(() => {
    setVisible(readVisibility(siteId, botIds));
  }, [siteId, botIds]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    searchRef.current?.focus();
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      setVisible(next);
      sessionStorage.setItem(storageKey(siteId), JSON.stringify(next));
    },
    [siteId]
  );

  function toggle(id: BotId, checked: boolean) {
    const next = { ...visible, [id]: checked };
    const anyOn = botIds.some((k) => next[k]);
    if (!anyOn) return;
    persist(next);
  }

  const selectedCount = botIds.filter((id) => visible[id]).length;
  const anyVisible = botIds.some((k) => visible[k]);

  const chartData = useMemo(() => {
    return series.map((point) => {
      let rest = 0;
      for (const id of botIds) {
        if (!visible[id]) {
          rest += (point[id] as number) ?? 0;
        }
      }
      return { ...point, [OTHER_BOTS_SERIES_KEY]: rest };
    });
  }, [series, botIds, visible]);

  const hasRestData = useMemo(
    () => chartData.some((p) => (p[OTHER_BOTS_SERIES_KEY] as number) > 0),
    [chartData]
  );

  const showChart = anyVisible || hasRestData;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">Daily bot visits</p>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            Bots
            <span className="tabular-nums text-zinc-400">({selectedCount})</span>
            <svg
              className={`size-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {open && (
            <div
              className="absolute right-0 z-20 mt-1.5 w-56 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
              role="listbox"
              aria-label="Select bots to display"
            >
              <div className="border-b border-zinc-100 p-2 dark:border-zinc-800">
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bots…"
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-64 overflow-y-auto px-1 py-1">
                {filteredMeta.length === 0 ? (
                  <p className="px-2.5 py-3 text-center text-xs text-zinc-500">
                    No bots match &ldquo;{search.trim()}&rdquo;
                  </p>
                ) : (
                  filteredMeta.map((m) => (
                    <BotPickerItem
                      key={m.id}
                      id={m.id}
                      label={m.label}
                      color={m.color}
                      checked={visible[m.id] ?? false}
                      onChange={(checked) => toggle(m.id, checked)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!showChart ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-zinc-500">
          Select at least one bot to display
        </div>
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
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
                width={36}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e4e4e7",
                  fontSize: 12,
                }}
              />
              {meta.map((m) =>
                visible[m.id] ? (
                  <Line
                    key={m.id}
                    type="monotone"
                    dataKey={m.id}
                    name={m.label}
                    stroke={m.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ) : null
              )}
              {hasRestData ? (
                <Line
                  key={OTHER_BOTS_SERIES_KEY}
                  type="monotone"
                  dataKey={OTHER_BOTS_SERIES_KEY}
                  name={OTHER_BOTS_LABEL}
                  stroke={BOT_OTHER.color}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
