"use client";

import { Suspense } from "react";
import { SiteNav } from "@/components/dashboard/SiteNav";
import { MetricBar } from "@/components/dashboard/MetricBar";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { BreakdownPanel } from "@/components/dashboard/BreakdownPanel";
import { CountryStatsBlock } from "@/components/dashboard/CountryStatsBlock";
import { LivePill } from "@/components/dashboard/LivePill";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import type { DashboardAnalytics } from "@/lib/analytics";
import type { Site } from "@/lib/types";

interface SiteDashboardProps {
  site: Site;
  analytics: DashboardAnalytics;
}

export function SiteDashboard({ site, analytics }: SiteDashboardProps) {
  const periodLabel =
    analytics.periodDays === 30 ? "30 days" : "7 days";

  return (
    <div className="relative pb-20">
      <SiteNav site={site} active="overview" />

      <Suspense fallback={null}>
        <PeriodSelector siteId={site.id} />
      </Suspense>

      <p className="mb-4 text-xs text-zinc-500">
        Last {periodLabel} · vs previous {periodLabel} · bounce per visit (1
        pageview = bounce)
      </p>

      <MetricBar metrics={analytics.metrics} />

      <div className="mt-6">
        <TrendChart series={analytics.series} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <CountryStatsBlock rows={analytics.countries} />
        <BreakdownPanel
          title="Acquisition"
          tabs={[
            { id: "channel", label: "Channel", rows: analytics.channels },
            { id: "referrer", label: "Referrer", rows: analytics.referrers },
            { id: "utm_source", label: "UTM Source", rows: analytics.utmSources },
            {
              id: "utm_campaign",
              label: "UTM Campaign",
              rows: analytics.utmCampaigns,
            },
          ]}
        />
        <BreakdownPanel
          title="Content"
          tabs={[
            {
              id: "pages",
              label: "Pages",
              rows: analytics.pages,
              hideIcons: true,
            },
            {
              id: "entry",
              label: "Entry",
              rows: analytics.entryPages,
              hideIcons: true,
            },
            {
              id: "exit",
              label: "Exit",
              rows: analytics.exitPages,
              hideIcons: true,
            },
          ]}
        />
        <BreakdownPanel
          title="Audience"
          tabs={[
            { id: "browser", label: "Browser", rows: analytics.browsers },
            { id: "device", label: "Device", rows: analytics.devices },
            { id: "platform", label: "OS", rows: analytics.platforms },
            { id: "language", label: "Language", rows: analytics.languages },
            { id: "screen", label: "Screen", rows: analytics.screens },
          ]}
        />
      </div>

      <LivePill siteId={site.id} count={analytics.liveCount} />
    </div>
  );
}
