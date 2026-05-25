"use client";

import { Check, Minus } from "lucide-react";
import { useState, type ReactNode } from "react";

import { GridMarkers, OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingBody, landingEyebrow } from "@/components/landing/landing-typography";
import { cn } from "@/lib/utils";

type CellValue = boolean;
type CompetitorId = "plausible" | "umami" | "datafast" | "ga";

type ComparisonRow = {
  feature: string;
  oa: CellValue;
  other: CellValue;
};

type CompetitorConfig = {
  id: CompetitorId;
  label: string;
  tagline: string;
  footnote: string;
  rows: ComparisonRow[];
};

const FEATURE_ROWS = {
  ownership: "Data ownership (DB / self-host)",
  openSource: "Open source",
  selfHost: "Self-host — no mandatory SaaS fee",
  tracker: "Lightweight tracker, one script",
  privacy: "Privacy-friendly / minimal cookies",
  visits: "Visits & bounce rate per visit",
  realtime: "Realtime globe / live visitors",
  sql: "Direct SQL / Postgres (Supabase)",
  revenue: "Revenue attribution (Stripe, LTV…)",
  funnel: "Full funnel & ads attribution",
  free: "Free long-term (no subscription)",
} as const;

const competitors: CompetitorConfig[] = [
  {
    id: "plausible",
    label: "Plausible",
    tagline: "Privacy analytics SaaS — AGPL self-host available.",
    footnote:
      "Plausible Cloud is paid SaaS; self-host is free under the license but you run the server.",
    rows: [
      { feature: FEATURE_ROWS.ownership, oa: true, other: true },
      { feature: FEATURE_ROWS.openSource, oa: true, other: true },
      { feature: FEATURE_ROWS.selfHost, oa: true, other: true },
      { feature: FEATURE_ROWS.tracker, oa: true, other: true },
      { feature: FEATURE_ROWS.privacy, oa: true, other: true },
      { feature: FEATURE_ROWS.visits, oa: true, other: true },
      { feature: FEATURE_ROWS.realtime, oa: true, other: false },
      { feature: FEATURE_ROWS.sql, oa: true, other: false },
      { feature: FEATURE_ROWS.revenue, oa: false, other: false },
      { feature: FEATURE_ROWS.funnel, oa: false, other: false },
      { feature: FEATURE_ROWS.free, oa: true, other: false },
    ],
  },
  {
    id: "umami",
    label: "Umami",
    tagline: "Open-source analytics — cloud or self-host.",
    footnote:
      "Umami self-host uses your Postgres/MySQL; OA ships a Supabase-first flow and its own tracker.",
    rows: [
      { feature: FEATURE_ROWS.ownership, oa: true, other: true },
      { feature: FEATURE_ROWS.openSource, oa: true, other: true },
      { feature: FEATURE_ROWS.selfHost, oa: true, other: true },
      { feature: FEATURE_ROWS.tracker, oa: true, other: true },
      { feature: FEATURE_ROWS.privacy, oa: true, other: true },
      { feature: FEATURE_ROWS.visits, oa: true, other: true },
      { feature: FEATURE_ROWS.realtime, oa: true, other: false },
      { feature: FEATURE_ROWS.sql, oa: true, other: true },
      { feature: FEATURE_ROWS.revenue, oa: false, other: false },
      { feature: FEATURE_ROWS.funnel, oa: false, other: false },
      { feature: FEATURE_ROWS.free, oa: true, other: true },
    ],
  },
  {
    id: "datafast",
    label: "DataFast",
    tagline: "Hosted revenue analytics — Stripe, funnel, live visitors.",
    footnote:
      "DataFast is hosted (datafa.st), 14-day trial, paid by events — not self-hostable.",
    rows: [
      { feature: FEATURE_ROWS.ownership, oa: true, other: false },
      { feature: FEATURE_ROWS.openSource, oa: true, other: false },
      { feature: FEATURE_ROWS.selfHost, oa: true, other: false },
      { feature: FEATURE_ROWS.tracker, oa: true, other: true },
      { feature: FEATURE_ROWS.privacy, oa: true, other: true },
      { feature: FEATURE_ROWS.visits, oa: true, other: false },
      { feature: FEATURE_ROWS.realtime, oa: true, other: true },
      { feature: FEATURE_ROWS.sql, oa: true, other: false },
      { feature: FEATURE_ROWS.revenue, oa: false, other: true },
      { feature: FEATURE_ROWS.funnel, oa: false, other: true },
      { feature: FEATURE_ROWS.free, oa: true, other: false },
    ],
  },
  {
    id: "ga",
    label: "Google Analytics",
    tagline: "Enterprise analytics — funnel, ads, free GA4 tier.",
    footnote:
      "GA is free but data lives on Google; better for complex marketing than simple traffic.",
    rows: [
      { feature: FEATURE_ROWS.ownership, oa: true, other: false },
      { feature: FEATURE_ROWS.openSource, oa: true, other: false },
      { feature: FEATURE_ROWS.selfHost, oa: true, other: false },
      { feature: FEATURE_ROWS.tracker, oa: true, other: true },
      { feature: FEATURE_ROWS.privacy, oa: true, other: false },
      { feature: FEATURE_ROWS.visits, oa: true, other: false },
      { feature: FEATURE_ROWS.realtime, oa: true, other: false },
      { feature: FEATURE_ROWS.sql, oa: true, other: false },
      { feature: FEATURE_ROWS.revenue, oa: false, other: false },
      { feature: FEATURE_ROWS.funnel, oa: false, other: true },
      { feature: FEATURE_ROWS.free, oa: true, other: true },
    ],
  },
];

const COL_COUNT = 3;

function ValueCell({ value }: { value: CellValue }) {
  if (value) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
        <Check
          className="size-3.5 text-emerald-600 dark:text-emerald-400"
          strokeWidth={2.5}
        />
      </span>
    );
  }
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
      <Minus className="size-3.5 text-muted-foreground" strokeWidth={2} />
    </span>
  );
}

function ComparisonCell({
  children,
  className,
  row,
  col,
  rowCount,
  isHeader = false,
}: {
  children: ReactNode;
  className?: string;
  row: number;
  col: number;
  rowCount: number;
  isHeader?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center border-zinc-200 px-4 py-3.5 sm:px-6 sm:py-4 dark:border-zinc-800",
        row < rowCount - 1 && "border-b",
        col < COL_COUNT - 1 && "border-r",
        isHeader && "bg-zinc-50/50 dark:bg-zinc-900/50",
        className
      )}
    >
      {children}
    </div>
  );
}

function ComparisonTable({ config }: { config: CompetitorConfig }) {
  const totalRows = config.rows.length + 1;

  return (
    <div>
      <p className={`border-b border-zinc-200 px-4 py-3 text-center dark:border-zinc-800 sm:px-6 ${landingBody}`}>
        {config.tagline}
      </p>

      <div className="relative">
        <GridMarkers columns={COL_COUNT} rows={totalRows} />
        <div className="grid w-full grid-cols-[1.4fr_1fr_1fr]">
          <ComparisonCell row={0} col={0} rowCount={totalRows} isHeader>
            <span className="text-sm font-medium text-muted-foreground">
              Criteria
            </span>
          </ComparisonCell>
          <ComparisonCell
            row={0}
            col={1}
            rowCount={totalRows}
            isHeader
            className="justify-center"
          >
            <span className="text-sm font-semibold text-foreground">
              Open Analytics
            </span>
          </ComparisonCell>
          <ComparisonCell
            row={0}
            col={2}
            rowCount={totalRows}
            isHeader
            className="justify-center"
          >
            <span className="text-sm font-medium text-muted-foreground">
              {config.label}
            </span>
          </ComparisonCell>

          {config.rows.map((row, i) => {
            const rowIndex = i + 1;
            return (
              <div key={row.feature} className="contents">
                <ComparisonCell row={rowIndex} col={0} rowCount={totalRows}>
                  <span className="text-sm font-medium leading-snug text-foreground">
                    {row.feature}
                  </span>
                </ComparisonCell>
                <ComparisonCell
                  row={rowIndex}
                  col={1}
                  rowCount={totalRows}
                  className="justify-center"
                >
                  <ValueCell value={row.oa} />
                </ComparisonCell>
                <ComparisonCell
                  row={rowIndex}
                  col={2}
                  rowCount={totalRows}
                  className="justify-center"
                >
                  <ValueCell value={row.other} />
                </ComparisonCell>
              </div>
            );
          })}
        </div>
      </div>

      <p className={`border-t border-zinc-200 px-4 py-3 text-center dark:border-zinc-800 sm:px-6 ${landingBody}`}>
        {config.footnote}
      </p>
    </div>
  );
}

export function LandingComparison() {
  const [activeId, setActiveId] = useState<CompetitorId>("plausible");
  const active = competitors.find((c) => c.id === activeId) ?? competitors[0];

  return (
    <section id="comparison" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative border border-zinc-200 dark:border-zinc-800">
          <OuterCornerMarkers />

          <div className="border-b border-zinc-200 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-zinc-800">
            <p className={landingEyebrow}>Compare</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
              Open Analytics vs other tools
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
              Pick a competitor to see a 3-column table: criteria · Open
              Analytics · competitor.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
            {competitors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  activeId === c.id
                    ? "bg-emerald-600 text-white"
                    : "border border-zinc-200 text-muted-foreground hover:border-zinc-300 hover:text-foreground dark:border-zinc-700 dark:hover:border-zinc-600"
                )}
              >
                vs {c.label}
              </button>
            ))}
          </div>

          <ComparisonTable key={active.id} config={active} />
        </div>
      </div>
    </section>
  );
}
