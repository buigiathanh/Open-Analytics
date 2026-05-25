"use client";

import { useState } from "react";
import type { BreakdownRow } from "@/lib/analytics";
import { ICON_GLOBE } from "@/lib/breakdown-icons";

interface Tab {
  id: string;
  label: string;
  rows: BreakdownRow[];
  /** Hide leading icon column (e.g. Content → Pages) */
  hideIcons?: boolean;
}

function BreakdownIcon({ row }: { row: BreakdownRow }) {
  if (row.iconUrl) {
    return (
      <img
        src={row.iconUrl}
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0 rounded object-contain"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fallback === "1") return;
          img.dataset.fallback = "1";
          img.src = ICON_GLOBE;
        }}
      />
    );
  }
  if (row.icon) {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center text-base leading-none">
        {row.icon}
      </span>
    );
  }
  return null;
}

export function BreakdownPanel({
  title,
  tabs,
}: {
  title: string;
  tabs: Tab[];
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];
  const rows = activeTab?.rows ?? [];
  const hideIcons = activeTab?.hideIcons ?? false;
  const max = rows[0]?.count ?? 1;

  return (
    <div className="flex min-h-[320px] flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                active === tab.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="flex-1 divide-y divide-zinc-50 overflow-y-auto dark:divide-zinc-900">
        {rows.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-zinc-500">
            No data
          </li>
        ) : (
          rows.map((row) => (
            <li
              key={row.key}
              className={`flex items-center px-4 py-2.5 text-sm ${
                hideIcons || (!row.iconUrl && !row.icon)
                  ? "gap-0"
                  : "gap-3"
              }`}
            >
              {!hideIcons && (row.iconUrl || row.icon) ? (
                <BreakdownIcon row={row} />
              ) : null}
              <div className="min-w-0 flex-1">
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
                    className="h-full rounded-full bg-zinc-800 dark:bg-zinc-300"
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
