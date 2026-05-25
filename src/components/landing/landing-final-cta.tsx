import Link from "next/link";

import { GetStartedButton } from "@/components/auth/GetStartedButton";
import { landingEyebrow } from "@/components/landing/landing-typography";

export function LandingFinalCTA() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-emerald-50/80 via-background to-background px-6 py-8 sm:px-10 sm:py-10 dark:border-zinc-800 dark:from-emerald-950/40">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <p className={landingEyebrow}>Get started</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
                Add the tracker in 5 minutes — data on your Supabase
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Free, open source, no credit card. Add a site in the Dashboard
                and copy the script.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <GetStartedButton showArrow size="md" />
              <Link
                href="/docs/installation"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-6 py-3 text-base font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Installation guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
