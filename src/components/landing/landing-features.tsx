import {
  BarChart3,
  Code2,
  Filter,
  Globe2,
  Radio,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { GridMarkers, OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingBody, landingEyebrow } from "@/components/landing/landing-typography";
import { cn } from "@/lib/utils";

type FeatureTheme = "emerald" | "blue" | "violet" | "amber" | "cyan" | "rose";

const themeStyles: Record<
  FeatureTheme,
  { cell: string; icon: string; iconColor: string }
> = {
  emerald: {
    cell: "bg-emerald-50/80 dark:bg-emerald-950/30",
    icon: "bg-white dark:bg-zinc-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    cell: "bg-blue-50/80 dark:bg-blue-950/30",
    icon: "bg-white dark:bg-zinc-950",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  violet: {
    cell: "bg-violet-50/80 dark:bg-violet-950/30",
    icon: "bg-white dark:bg-zinc-950",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    cell: "bg-amber-50/80 dark:bg-amber-950/30",
    icon: "bg-white dark:bg-zinc-950",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  cyan: {
    cell: "bg-cyan-50/80 dark:bg-cyan-950/30",
    icon: "bg-white dark:bg-zinc-950",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  rose: {
    cell: "bg-rose-50/80 dark:bg-rose-950/30",
    icon: "bg-white dark:bg-zinc-950",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
};

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  theme: FeatureTheme;
}[] = [
  {
    icon: Zap,
    title: "Lightweight tracker",
    description:
      "One JS file, visitor fingerprinting, events via fetch — Supabase or a custom endpoint.",
    theme: "emerald",
  },
  {
    icon: BarChart3,
    title: "Clear metrics",
    description:
      "Visitors, visits, pageviews, bounce rate (per visit), session duration — Umami-style definitions.",
    theme: "blue",
  },
  {
    icon: Filter,
    title: "Full breakdowns",
    description:
      "Channel, referrer, UTM, pages, entry/exit, country, browser, device, OS — 7 or 30 days.",
    theme: "violet",
  },
  {
    icon: Radio,
    title: "Realtime map",
    description:
      "3D globe + live visitor list via Supabase Realtime.",
    theme: "amber",
  },
  {
    icon: Code2,
    title: "Custom events & SPA",
    description:
      "track(), identify(), click tracking; hooks pushState/replaceState for Next.js and SPAs.",
    theme: "cyan",
  },
  {
    icon: Globe2,
    title: "Geo & bot filter",
    description:
      "Lat/lng cached in localStorage; bot filter by User-Agent; optional Do Not Track.",
    theme: "rose",
  },
];

const COLS = 3;
const ROWS = Math.ceil(features.length / COLS);

function FeatureCell({
  icon: Icon,
  title,
  description,
  theme,
  index,
}: (typeof features)[number] & { index: number }) {
  const styles = themeStyles[theme];
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const isLastRow = row === ROWS - 1;
  const cellsInLastRow = features.length - row * COLS;

  return (
    <div
      className={cn(
        "group flex flex-col p-6 transition-colors duration-200 sm:p-7",
        styles.cell,
        "border-zinc-200 dark:border-zinc-800",
        index < features.length - 1 && "border-b",
        col < COLS - 1 && !(isLastRow && col >= cellsInLastRow - 1) && "md:border-r",
        row < ROWS - 1 && "md:border-b"
      )}
    >
      <div
        className={cn(
          "mb-4 flex size-9 items-center justify-center rounded-lg border border-white/80 shadow-sm dark:border-zinc-700",
          styles.icon
        )}
      >
        <Icon className={cn("size-4", styles.iconColor)} strokeWidth={2} />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className={`mt-1.5 ${landingBody}`}>
        {description}
      </p>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative border border-zinc-200 dark:border-zinc-800">
          <OuterCornerMarkers />

          <div className="border-b border-zinc-200 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-zinc-800">
            <p className={landingEyebrow}>
              Features
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
              Everything you need to understand traffic — nothing extra
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              From tracker to dashboard and realtime — Next.js + Supabase stack,
              you own the schema.
            </p>
          </div>

          <div className="relative">
            <GridMarkers
              columns={1}
              rows={features.length}
              className="md:hidden"
            />
            <GridMarkers columns={COLS} rows={ROWS} className="hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCell key={feature.title} {...feature} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
