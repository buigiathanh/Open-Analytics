import Link from "next/link";
import { ArrowRight, Globe, Radio } from "lucide-react";

import { Logo } from "@/components/Logo";
import { GridMarkers, OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingEyebrow } from "@/components/landing/landing-typography";

const metrics = [
  { label: "Visitors", value: "12,847" },
  { label: "Visits", value: "18,203" },
  { label: "Pageviews", value: "41,592" },
  { label: "Bounce rate", value: "38%" },
  { label: "Avg. visit time", value: "2m 14s" },
];

const channels = [
  { name: "Direct", pct: 42 },
  { name: "Organic", pct: 31 },
  { name: "Referral", pct: 18 },
  { name: "Social", pct: 9 },
];

export function DashboardPreview() {
  return (
    <section id="demo" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative border border-zinc-200 dark:border-zinc-800">
          <OuterCornerMarkers />

          <div className="border-b border-zinc-200 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-zinc-800">
            <p className={landingEyebrow}>Dashboard</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
              One screen — the metrics you need every day
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Visitors, visits, channel breakdown, and a realtime globe when you
              need to see who is online.
            </p>
          </div>

          <div className="relative p-4 sm:p-6">
            <GridMarkers columns={1} rows={1} />
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center gap-2">
                  <Logo size="sm" showText={false} link={false} className="gap-0" />
                  <div className="text-left">
                    <p className="text-xs font-semibold">my-startup.com</p>
                    <p className="text-[10px] text-muted-foreground">
                      Last 30 days
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Radio className="size-3" />
                  3 online
                </span>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-5">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 border-t border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800">
                <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="text-xs font-semibold">Channels</p>
                  <ul className="mt-3 space-y-2">
                    {channels.map((c) => (
                      <li key={c.name} className="flex items-center gap-2 text-xs">
                        <span className="w-16 text-muted-foreground">{c.name}</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <span
                            className="block h-full rounded-full bg-emerald-500"
                            style={{ width: `${c.pct}%` }}
                          />
                        </span>
                        <span className="w-8 text-right tabular-nums">{c.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-gradient-to-b from-emerald-50/80 to-white dark:border-zinc-800 dark:from-emerald-950/30 dark:to-zinc-950">
                  <Globe className="size-10 text-emerald-600/60 dark:text-emerald-400/50" />
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Realtime globe · COBE 3D
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Open live dashboard
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
