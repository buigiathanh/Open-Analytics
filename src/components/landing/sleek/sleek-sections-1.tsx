import {
  Activity,
  BarChart3,
  Code,
  Code2,
  Filter,
  Globe2,
  LayoutDashboard,
  Radio,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  SleekStackHeader,
  SleekStackSection,
} from "@/components/landing/sleek/sleek-shared";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    icon: LayoutDashboard,
    title: "Create a project",
    description:
      "Sign in with Google or GitHub, then create a website in the dashboard. Each project gets a site key — no separate analytics database to provision.",
  },
  {
    step: "02",
    icon: Code,
    title: "Add the script",
    description:
      "Copy one script tag into your HTML or Next.js layout. Events POST to your Open Analytics server and land in PostgreSQL.",
  },
  {
    step: "03",
    icon: Activity,
    title: "View stats & realtime",
    description:
      "Pageviews, UTM, device, geo — breakdowns and globe when visitors are online.",
  },
];

function StepCell({
  step,
  icon: Icon,
  title,
  description,
  index,
}: (typeof steps)[number] & { index: number }) {
  return (
    <div
      className={cn(
        "flex flex-col p-6 sm:p-8",
        index < steps.length - 1 && "border-b border-zinc-200 md:border-b-0 dark:border-zinc-800",
        index < 2 && "md:border-r md:border-zinc-200 dark:md:border-zinc-800"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {step}
        </span>
        <Icon className="size-5 text-muted-foreground/70" strokeWidth={1.5} />
      </div>
      <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function SleekHowItWorks({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekStackSection
      id="how-it-works"
      eyebrow="How it works"
      title="Three steps. That is all."
      description="Sign in, create a project, paste the embed — events flow straight into your PostgreSQL database."
    >
      <div className="grid grid-cols-1 md:grid-cols-3">
        {steps.map((item, index) => (
          <StepCell key={item.step} {...item} index={index} />
        ))}
      </div>
    </SleekStackSection>
  );
}

type FeatureTheme = "emerald" | "blue" | "teal" | "amber" | "cyan" | "rose";

const featureThemes: Record<
  FeatureTheme,
  { iconBg: string; iconColor: string }
> = {
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  teal: {
    iconBg: "bg-teal-50 dark:bg-teal-950/50",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  cyan: {
    iconBg: "bg-cyan-50 dark:bg-cyan-950/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-950/50",
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
    theme: "emerald",
    title: "Lightweight tracker",
    description:
      "One JS file, visitor fingerprinting, events via fetch — POST to /api/events on your instance.",
  },
  {
    icon: BarChart3,
    theme: "blue",
    title: "Clear metrics",
    description:
      "Visitors, visits, pageviews, bounce rate (per visit), session duration — Umami-style definitions.",
  },
  {
    icon: Filter,
    theme: "teal",
    title: "Full breakdowns",
    description:
      "Channel, referrer, UTM, pages, entry/exit, country, browser, device, OS — 7 or 30 days.",
  },
  {
    icon: Radio,
    theme: "amber",
    title: "Realtime map",
    description: "3D globe + live visitor list via WebSocket — no polling.",
  },
  {
    icon: Code2,
    theme: "cyan",
    title: "Custom events & SPA",
    description:
      "track(), identify(), click tracking; hooks pushState/replaceState for Next.js and SPAs.",
  },
  {
    icon: Globe2,
    theme: "rose",
    title: "Geo & bot filter",
    description:
      "Lat/lng cached in localStorage; bot filter by User-Agent; optional Do Not Track.",
  },
];

const FEATURE_COLS = 3;

function FeatureCell({
  icon: Icon,
  title,
  description,
  theme,
  index,
}: (typeof features)[number] & { index: number }) {
  const styles = featureThemes[theme];
  const col = index % FEATURE_COLS;

  return (
    <div
      className={cn(
        "flex h-full flex-col px-6 py-8 sm:px-8 sm:py-10",
        "border-b border-zinc-200 dark:border-zinc-800",
        col < FEATURE_COLS - 1 && "md:border-r"
      )}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-xl border border-zinc-200/80 dark:border-zinc-700/80",
          styles.iconBg
        )}
      >
        <Icon className={cn("size-[18px]", styles.iconColor)} strokeWidth={2} />
      </span>
      <h3 className="mt-5 text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function SleekFeatures({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekStackSection
      id="features"
      eyebrow="Features"
      title="Everything you need. Nothing you don't."
      description="From tracker to dashboard and realtime — Next.js + PostgreSQL, you own the schema and the data."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2">
        {features.map((feature, index) => (
          <FeatureCell key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </SleekStackSection>
  );
}
