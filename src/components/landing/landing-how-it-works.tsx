import { Activity, Code, Database, type LucideIcon } from "lucide-react";

import { GridMarkers, OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingBody, landingEyebrow } from "@/components/landing/landing-typography";
import { cn } from "@/lib/utils";

const steps: {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
  preview: string;
  tags?: string;
}[] = [
  {
    step: "01",
    icon: Database,
    title: "Create Supabase & run schema",
    description:
      "Registry project + one events project per site. Enable Realtime on the events table.",
    preview: "schema-analytics.sql · your events",
    tags: "5 min",
  },
  {
    step: "02",
    icon: Code,
    title: "Add site & paste script",
    description:
      "Dashboard generates a site key; copy one script tag into HTML or your Next.js layout.",
    preview: 'data-site-key="..." · tracker.js',
    tags: "1 line",
  },
  {
    step: "03",
    icon: Activity,
    title: "View stats & realtime",
    description:
      "Pageviews, UTM, device, geo — breakdowns and globe when visitors are online.",
    preview: "visitors: 847 · visits: 1.2k",
    tags: "Live",
  },
];

function StepPreview({ preview, tags }: { preview: string; tags?: string }) {
  return (
    <div className="mt-8 flex items-center gap-2.5 rounded-lg bg-zinc-100 px-3 py-2.5 dark:bg-zinc-900">
      <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
        {preview}
      </span>
      {tags ? (
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground/80">
          {tags}
        </span>
      ) : null}
    </div>
  );
}

function StepCell({
  step,
  icon: Icon,
  title,
  description,
  preview,
  tags,
  index,
}: (typeof steps)[number] & { index: number }) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col p-6 sm:min-h-[240px] sm:p-7",
        "border-zinc-200 dark:border-zinc-800",
        index < steps.length - 1 && "border-b md:border-b-0",
        index < 2 && "md:border-r"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex size-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {step}
        </span>
        <Icon className="size-5 text-muted-foreground/70" strokeWidth={1.5} />
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className={`mt-2 ${landingBody}`}>
          {description}
        </p>
        <StepPreview preview={preview} tags={tags} />
      </div>
    </div>
  );
}

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative border border-zinc-200 dark:border-zinc-800">
          <OuterCornerMarkers />

          <div className="border-b border-zinc-200 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-zinc-800">
            <p className={landingEyebrow}>
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
              Three steps from zero to dashboard
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Events go through a Cloudflare Worker into Supabase — publishable key stays
              read-only for the dashboard.
            </p>
          </div>

          <div className="relative">
            <GridMarkers columns={1} rows={3} className="md:hidden" />
            <GridMarkers columns={3} rows={1} className="hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-3">
              {steps.map((item, index) => (
                <StepCell key={item.step} {...item} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
