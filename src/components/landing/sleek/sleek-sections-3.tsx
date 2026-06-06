"use client";

import { Check, Minus } from "lucide-react";

import { SleekStackSection } from "@/components/landing/sleek/sleek-shared";
import { cn } from "@/lib/utils";

type CellValue = boolean | string;

const columns = [
  { id: "oa", label: "Open Analytics", highlight: true },
  { id: "plausible", label: "Plausible", highlight: false },
  { id: "umami", label: "Umami", highlight: false },
  { id: "ga", label: "Google", highlight: false },
] as const;

const rows: { feature: string; values: Record<(typeof columns)[number]["id"], CellValue> }[] = [
  {
    feature: "Data ownership (DB / self-host)",
    values: { oa: true, plausible: true, umami: true, ga: false },
  },
  {
    feature: "Open source",
    values: { oa: true, plausible: true, umami: true, ga: false },
  },
  {
    feature: "Self-host — no mandatory SaaS fee",
    values: { oa: true, plausible: true, umami: true, ga: false },
  },
  {
    feature: "Lightweight tracker, one script",
    values: { oa: true, plausible: true, umami: true, ga: true },
  },
  {
    feature: "Privacy-friendly / minimal cookies",
    values: { oa: true, plausible: true, umami: true, ga: false },
  },
  {
    feature: "Visits & bounce rate per visit",
    values: { oa: true, plausible: true, umami: true, ga: false },
  },
  {
    feature: "Realtime globe / live visitors",
    values: { oa: true, plausible: false, umami: false, ga: false },
  },
  {
    feature: "Direct SQL / PostgreSQL",
    values: { oa: true, plausible: false, umami: true, ga: false },
  },
  {
    feature: "Bot crawl tracking",
    values: { oa: true, plausible: false, umami: false, ga: false },
  },
  {
    feature: "Domain Authority (DA) tracking",
    values: { oa: true, plausible: false, umami: false, ga: false },
  },
  {
    feature: "Google Search Console integration",
    values: { oa: true, plausible: false, umami: false, ga: true },
  },
  {
    feature: "SimilarWeb data integration",
    values: { oa: true, plausible: false, umami: false, ga: false },
  },
  {
    feature: "Free long-term (no subscription)",
    values: { oa: true, plausible: false, umami: true, ga: true },
  },
];

const oaColumnClass =
  "bg-emerald-50 dark:bg-emerald-950/40 border-x border-emerald-200/80 dark:border-emerald-800/60";

const oaHeaderClass =
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-x border-emerald-200 dark:border-emerald-800";

function ValueCell({
  value,
  highlight = false,
}: {
  value: CellValue;
  highlight?: boolean;
}) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-foreground">{value}</span>;
  }
  if (value) {
    return (
      <span
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full",
          highlight
            ? "bg-white shadow-sm dark:bg-emerald-900/80"
            : "bg-emerald-50 dark:bg-emerald-950"
        )}
      >
        <Check
          className="size-3.5 text-emerald-600 dark:text-emerald-400"
          strokeWidth={2.5}
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full",
        highlight ? "bg-white/70 dark:bg-emerald-900/50" : "bg-zinc-100 dark:bg-zinc-800"
      )}
    >
      <Minus className="size-3.5 text-muted-foreground" strokeWidth={2} />
    </span>
  );
}

export function SleekComparison({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekStackSection
      id="comparison"
      eyebrow="Comparison"
      title="Why teams choose Open Analytics"
      description="An honest look at what each analytics tool actually delivers."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-4 text-sm font-medium text-muted-foreground sm:px-6">
                Feature
              </th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "px-4 py-4 text-center text-sm font-semibold sm:px-6",
                    col.highlight
                      ? oaHeaderClass
                      : "text-muted-foreground"
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.feature}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/80"
              >
                <td className="px-4 py-3.5 text-sm font-medium text-foreground sm:px-6">
                  {row.feature}
                </td>
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "px-4 py-3.5 text-center sm:px-6",
                      col.highlight && oaColumnClass
                    )}
                  >
                    <div className="flex justify-center">
                      <ValueCell value={row.values[col.id]} highlight={col.highlight} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-zinc-200 px-6 py-4 text-center text-sm text-muted-foreground dark:border-zinc-800">
        * Google monetizes visitor data through its advertising ecosystem.
      </p>
    </SleekStackSection>
  );
}

const plans = [
  {
    name: "Self-hosted",
    price: "Free",
    description: "Perfect for indie makers and small sites.",
    highlight: true,
    features: [
      "MIT license",
      "Unlimited events*",
      "Your PostgreSQL",
      "Forever retention",
      "Realtime analytics",
      "Live globe",
      "Public share page",
      "Core metrics",
    ],
  },
  {
    name: "Hosting cost",
    price: "$0–25",
    description: "You only pay for the server and database you run.",
    highlight: false,
    features: [
      "Free tier on many hosts",
      "Managed or self-hosted Postgres",
      "Direct SQL access",
      "Your data, your region",
      "Export anytime",
      "No vendor lock-in",
      "Scale when you need",
      "Full schema control",
    ],
  },
  {
    name: "Hosted demo",
    price: "$0",
    description: "Try the dashboard before you self-host.",
    highlight: false,
    features: [
      "Live demo link",
      "Public realtime view",
      "No sign-in to view",
      "Same UI as dashboard",
      "Open source code",
      "Docs & guides",
      "Community support",
      "GitHub issues",
    ],
  },
];

export function SleekPricing({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekStackSection
      id="pricing"
      eyebrow="Pricing"
      title="Premium analytics, founder-friendly pricing"
      description="Get high-end analytics capabilities without paying enterprise-level costs — because you host it yourself."
    >
      <div className="grid grid-cols-1 md:grid-cols-3">
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col p-6 sm:p-8",
              index < plans.length - 1 &&
                "border-b border-zinc-200 md:border-b-0 dark:border-zinc-800",
              index < 2 && "md:border-r md:border-zinc-200 dark:md:border-zinc-800",
              plan.highlight && "bg-emerald-50/40 dark:bg-emerald-950/20"
            )}
          >
            {plan.highlight ? (
              <span className="mb-4 inline-flex w-fit rounded-full bg-emerald-600 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Most popular
              </span>
            ) : (
              <span className="mb-4 inline-flex h-[22px]" aria-hidden />
            )}
            <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            <p className="mt-5 text-4xl font-bold tracking-tight text-foreground">
              {plan.price}
              {plan.price.includes("/") ? (
                <span className="text-base font-normal text-muted-foreground">/mo</span>
              ) : null}
            </p>
            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-zinc-200 px-6 py-4 text-center text-sm text-muted-foreground dark:border-zinc-800">
        * Unlimited events subject to your PostgreSQL capacity and server resources.
      </p>
    </SleekStackSection>
  );
}
