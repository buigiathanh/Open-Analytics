import { Database, Eye, Gauge, Globe2, Radio, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  SleekBlockSection,
  SleekStackHeader,
  SleekStackSection,
} from "@/components/landing/sleek/sleek-shared";
import { DEMO_SHARE_REALTIME_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ReasonTheme = "emerald" | "blue" | "amber" | "teal" | "rose" | "cyan";

const reasonThemes: Record<
  ReasonTheme,
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
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  teal: {
    iconBg: "bg-teal-50 dark:bg-teal-950/50",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-950/50",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  cyan: {
    iconBg: "bg-cyan-50 dark:bg-cyan-950/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
};

const reasons: {
  icon: LucideIcon;
  title: string;
  description: string;
  theme: ReasonTheme;
}[] = [
  {
    icon: Gauge,
    theme: "emerald",
    title: "Google Analytics is overkill for small sites",
    description:
      "Complex dashboards, sampling, and cookie policies make daily traffic checks feel heavy.",
  },
  {
    icon: Radio,
    theme: "rose",
    title: "Realtime map without enterprise cost",
    description:
      "Watch visitors on a 3D globe. WebSocket updates keep the dashboard fresh without polling.",
  },
  {
    icon: Eye,
    theme: "blue",
    title: "SaaS analytics — data you do not own",
    description:
      "Plausible, Umami cloud… convenient but vendor-dependent. Hard to export, customize schema, or integrate deeply.",
  },
  {
    icon: Server,
    theme: "amber",
    title: "Self-hosting without the long setup",
    description:
      "Umami self-hosted, Matomo… need servers, Docker, DB migrations. Many teams only want a lean tracker + dashboard.",
  },
  {
    icon: Database,
    theme: "teal",
    title: "Direct SQL on your events",
    description:
      "With events in PostgreSQL, query, join, alert, or pipe into BI — standard SQL, no vendor API.",
  },
  {
    icon: Globe2,
    theme: "cyan",
    title: "Lightweight & privacy-friendly",
    description:
      "One script, minimal cookies, bot filtering. No consent banner complexity for simple sites.",
  },
];

const COLS = 3;

function ReasonItem({
  icon: Icon,
  title,
  description,
  theme,
}: (typeof reasons)[number]) {
  const styles = reasonThemes[theme];

  return (
    <div className="flex h-full flex-col px-6 py-8 sm:px-8 sm:py-10">
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
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function SleekWhy({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekBlockSection id="why" embedded>
      <SleekStackHeader
        eyebrow="Why Open Analytics"
        title="Simple analytics when you only need real numbers"
        description="Not an enterprise GA replacement — but enough for blogs, landing pages, small SaaS, and side projects that need data transparency."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2">
        {reasons.map((reason, index) => {
          const col = index % COLS;

          return (
            <div
              key={reason.title}
              className={cn(
                "h-full border-b border-zinc-200 dark:border-zinc-800",
                col < COLS - 1 && "md:border-r"
              )}
            >
              <ReasonItem {...reason} />
            </div>
          );
        })}
      </div>
    </SleekBlockSection>
  );
}

export function SleekDemo({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekStackSection
      id="demo"
      eyebrow="Product demo"
      title="See it in action"
      description="Live visitors on a 3D globe, country breakdown, and a rolling chart. This embed uses a public share link — no sign-in for viewers."
    >
      <div className="p-4 sm:p-6">
        <iframe
          src={DEMO_SHARE_REALTIME_URL}
          title="Open Analytics live realtime demo"
          className="block h-[min(70vh,640px)] w-full rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </SleekStackSection>
  );
}

const quote =
  "The one-line-of-code setup is what sold me on trying this. I have been looking for an analytics tool that does not require a PhD in configuration just to see who is visiting my site in real time.";

export function SleekQuote({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekBlockSection embedded>
      <div className="px-6 py-12 text-center sm:px-10 sm:py-14">
        <blockquote className="mx-auto max-w-3xl text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <p className="mt-6 text-sm text-muted-foreground">
          — Indie maker · self-hosted analytics user
        </p>
      </div>
    </SleekBlockSection>
  );
}
