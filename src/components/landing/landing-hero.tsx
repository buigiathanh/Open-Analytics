import Link from "next/link";
import { ArrowRight, Code2, Shield } from "lucide-react";

import { GetStartedButton } from "@/components/auth/GetStartedButton";
import { landingCaption } from "@/components/landing/landing-typography";
import type { ReactNode } from "react";

function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="bg-[linear-gradient(transparent_62%,rgba(16,185,129,0.35)_62%)] text-foreground">
      {children}
    </span>
  );
}

const HERO_GRID_MASK =
  "radial-gradient(ellipse 90% 72% at 50% 40%, transparent 0%, transparent 38%, rgba(0,0,0,0.25) 58%, black 100%)";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-14 sm:pt-12 sm:pb-20">
      <div
        className="pointer-events-none absolute inset-0 [mask-image:var(--hero-grid-mask)] [-webkit-mask-image:var(--hero-grid-mask)]"
        style={{ ["--hero-grid-mask" as string]: HERO_GRID_MASK }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:56px_56px] dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_58%_at_50%_38%,var(--background)_0%,var(--background)_28%,transparent_72%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(16,185,129,0.08),transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-background py-1 pl-1 pr-3 text-sm shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
          >
            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
              New
            </span>
            <span className="text-sm font-medium text-foreground">
              Visits, bounce rate &amp; realtime map
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </a>
        </div>

        <h1 className="mx-auto mt-8 w-full max-w-5xl text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          <span className="block text-foreground">
            Website analytics that are{" "}
            <Highlight>transparent and lightweight</Highlight>
          </span>
          <span className="mt-1 block text-muted-foreground">
            — with data on your own Supabase.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Track visitors, visits, pageviews, and bounce rate. One script, no
          separate backend. Open source, self-hosted, built for startups and side
          projects.
        </p>

        <div className={`mt-4 flex flex-wrap items-center justify-center gap-4 ${landingCaption}`}>
          <span className="inline-flex items-center gap-1.5">
            <Code2 className="size-3.5" />
            MIT · Open source
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="size-3.5" />
            No complex cookie banners
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GetStartedButton showArrow size="md" />
          <Link
            href="/docs"
            className="inline-flex items-center rounded-xl border border-zinc-300 bg-background px-6 py-3 text-base font-medium shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            View docs
          </Link>
        </div>

        <p className={`mt-4 ${landingCaption}`}>
          Free · Self-hosted · No credit card required
        </p>
      </div>
    </section>
  );
}
