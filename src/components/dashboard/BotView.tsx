"use client";

import { Suspense } from "react";
import { BotPagesTable } from "@/components/dashboard/BotPagesTable";
import { BotPeriodSelector } from "@/components/dashboard/BotPeriodSelector";
import { BotTrendChart } from "@/components/dashboard/BotTrendChart";
import type { BotDashboardAnalytics } from "@/lib/bot-analytics";
import type { Site } from "@/lib/types";

export function BotView({
  site,
  analytics,
  isDemo = false,
}: {
  site: Site;
  analytics: BotDashboardAnalytics;
  isDemo?: boolean;
}) {
  const periodLabel = analytics.periodDays === 30 ? "30 days" : "7 days";

  return (
    <div className="relative pb-20">
      {isDemo && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <span>Previewing sample bot data — not from your site.</span>
          <a
            href={`/app/${site.id}/bots${analytics.periodDays === 30 ? "?days=30" : ""}`}
            className="shrink-0 text-xs font-medium underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-100"
          >
            Exit preview
          </a>
        </div>
      )}
      <Suspense fallback={null}>
        <BotPeriodSelector siteId={site.id} />
      </Suspense>

      <p className="mb-4 text-xs text-zinc-500">
        Last {periodLabel} · crawler and preview bot pageviews
      </p>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
        {[
          { label: "Bot hits", value: analytics.totalHits },
          { label: "Unique bots", value: analytics.uniqueBots },
          { label: "Pages crawled", value: analytics.uniquePages },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white px-5 py-4 dark:bg-zinc-950"
          >
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {m.label}
            </span>
            <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
              {m.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <BotTrendChart
          siteId={site.id}
          series={analytics.series}
          botIds={analytics.botIds}
          periodDays={analytics.periodDays}
        />
      </div>

      <div className="mt-6">
        <BotPagesTable site={site} pages={analytics.pages} />
      </div>
    </div>
  );
}
