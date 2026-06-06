import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { GetStartedButton } from "@/components/auth/GetStartedButton";
import { SleekBlockSection } from "@/components/landing/sleek/sleek-shared";
import { SleekHeroGlobe } from "@/components/landing/sleek/sleek-hero-globe";
import { DEMO_SHARE_REALTIME_URL } from "@/lib/constants";
import { HERO_DEMO_VISITORS } from "@/lib/hero-demo-visitors";

const trustedLogos = [
  { name: "Next.js", className: "font-semibold tracking-tight" },
  { name: "PostgreSQL", className: "font-semibold tracking-tight" },
  { name: "Node.js", className: "font-medium tracking-tight" },
  { name: "MIT License", className: "font-mono text-xs uppercase tracking-wider" },
];

const featuredTestimonial = HERO_DEMO_VISITORS[0];

export function SleekHero({ embedded = false }: { embedded?: boolean }) {
  const content = (
    <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left column */}
            <div className="flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-1 pr-3 text-sm transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
                >
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                    New
                  </span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    Visits, bounce rate &amp; realtime map
                  </span>
                  <ArrowRight className="size-3.5 text-emerald-500" />
                </a>

                <h1 className="mt-8 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-foreground sm:text-[2.35rem] lg:text-[2.65rem] lg:leading-[1.1]">
                  Website analytics that are{" "}
                  <span className="text-foreground">transparent and lightweight</span>
                  {" — "}
                  with data in{" "}
                  <span className="text-foreground">your own PostgreSQL</span>.
                </h1>

                <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
                  Track visitors, visits, pageviews, and bounce rate. Sign in, create a
                  project, add one script — open source, self-hosted, built for startups and
                  side projects.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <GetStartedButton
                    showArrow
                    size="md"
                    className="rounded-xl px-6 shadow-none"
                  />
                  <Link
                    href={DEMO_SHARE_REALTIME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  >
                    View live demo
                  </Link>
                </div>
              </div>

              <div className="mt-10 lg:mt-12">
                <p className="text-sm text-muted-foreground">
                  Trusted by every type of business
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
                  {trustedLogos.map((logo) => (
                    <span
                      key={logo.name}
                      className={`text-sm text-zinc-400 grayscale dark:text-zinc-500 ${logo.className}`}
                    >
                      {logo.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex min-h-[420px] flex-col border-t border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/40 lg:min-h-[560px] lg:border-l lg:border-t-0">
              <p className="px-6 pt-6 text-sm leading-relaxed text-muted-foreground sm:px-8 sm:pt-8">
                Watch visitors arrive from around the world. And it&apos;s just one of
                Open Analytics&apos; powerful features.
              </p>

              <div className="relative min-h-[320px] flex-1 sm:min-h-[380px]">
                <SleekHeroGlobe />
              </div>

              <div className="flex flex-col gap-4 border-t border-zinc-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-zinc-800">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src={featuredTestimonial.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
                  />
                  <p className="text-sm leading-snug text-foreground">
                    <span className="font-medium">
                      &ldquo;{featuredTestimonial.displayName} is live on{" "}
                      {featuredTestimonial.path} from {featuredTestimonial.country}.&rdquo;
                    </span>
                    <span className="mt-1 block text-muted-foreground">
                      — Demo visitor · {featuredTestimonial.source}
                    </span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950 sm:self-center">
                  <span className="text-lg leading-none text-emerald-600">★</span>
                  <div className="text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Open source
                    </p>
                    <p className="text-xs font-semibold text-foreground">MIT License</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  );

  return (
    <SleekBlockSection embedded={embedded}>{content}</SleekBlockSection>
  );
}
