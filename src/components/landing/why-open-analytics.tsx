import { Database, Eye, Gauge, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { GridMarkers, OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingBody, landingEyebrow } from "@/components/landing/landing-typography";
import { cn } from "@/lib/utils";

const reasons: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Gauge,
    title: "Google Analytics is overkill for small sites",
    description:
      "Complex dashboards, sampling, and cookie policies make daily traffic checks feel heavy.",
  },
  {
    icon: Eye,
    title: "SaaS analytics — data you do not own",
    description:
      "Plausible, Umami cloud… convenient but vendor-dependent. Hard to export, customize schema, or integrate deeply.",
  },
  {
    icon: Server,
    title: "Self-hosting without the long setup",
    description:
      "Umami self-hosted, Matomo… need servers, Docker, DB migrations. Many teams only want a lean tracker + dashboard.",
  },
  {
    icon: Database,
    title: "Direct SQL on your events",
    description:
      "With data on Supabase Postgres, query, join, alert, or pipe into BI — no middleware API.",
  },
];

function ReasonCell({
  icon: Icon,
  title,
  description,
  index,
}: (typeof reasons)[number] & { index: number }) {
  return (
    <div
      className={cn(
        "flex flex-col p-6 sm:p-7",
        "border-zinc-200 dark:border-zinc-800",
        index < reasons.length - 1 && "border-b",
        index % 2 === 0 && "md:border-r",
        index < 2 && "md:border-b"
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
        <Icon className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
      </span>
      <h3 className="mt-4 text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className={`mt-2 ${landingBody}`}>
        {description}
      </p>
    </div>
  );
}

export function WhyOpenAnalytics() {
  return (
    <section id="why" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative border border-zinc-200 dark:border-zinc-800">
          <OuterCornerMarkers />

          <div className="border-b border-zinc-200 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-zinc-800">
            <p className={landingEyebrow}>
              Why Open Analytics
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
              Simple analytics when you only need real numbers
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Not an enterprise GA replacement — but enough for blogs, landing
              pages, small SaaS, and side projects that need data transparency.
            </p>
          </div>

          <div className="relative">
            <GridMarkers columns={1} rows={4} className="md:hidden" />
            <GridMarkers columns={2} rows={2} className="hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-2">
              {reasons.map((reason, index) => (
                <ReasonCell key={reason.title} {...reason} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
