import type { ReactNode } from "react";

import { LegalProse } from "@/components/legal/LegalProse";
import { OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingEyebrow, landingCaption } from "@/components/landing/landing-typography";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";

const HERO_GRID_MASK =
  "radial-gradient(ellipse 90% 72% at 50% 40%, transparent 0%, transparent 38%, rgba(0,0,0,0.25) 58%, black 100%)";

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  lastUpdated?: string;
  children: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  description,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <LandingNavbar />
      <main className="bg-background">
        <section className="relative overflow-hidden pt-8 pb-6 sm:pt-10 sm:pb-8">
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
            <p className={landingEyebrow}>{eyebrow}</p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl sm:leading-tight">
              {title}
            </h1>
            {description ? (
              <div className="mx-auto mt-3 max-w-2xl">{description}</div>
            ) : null}
            {lastUpdated ? (
              <p className={`mt-3 ${landingCaption}`}>Last updated: {lastUpdated}</p>
            ) : null}
          </div>
        </section>

        <section className="pb-14 sm:pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative border border-zinc-200 dark:border-zinc-800">
              <OuterCornerMarkers />
              <div className="px-5 py-8 sm:px-8 sm:py-10">
                <div className="mx-auto max-w-3xl">
                  <LegalProse>{children}</LegalProse>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
