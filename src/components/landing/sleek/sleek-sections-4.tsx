"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { GetStartedButton } from "@/components/auth/GetStartedButton";
import { Logo } from "@/components/Logo";
import {
  SleekBlockSection,
  SleekStackSection,
} from "@/components/landing/sleek/sleek-shared";
import { GITHUB_REPO_URL } from "@/lib/github";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: "cost",
    question: "Is Open Analytics free?",
    answer:
      "MIT licensed, self-hosted. Open Analytics itself is free — you only pay for hosting and PostgreSQL if you self-deploy. No subscription fee from us.",
  },
  {
    id: "privacy",
    question: "Do I need a cookie banner?",
    answer:
      "The tracker uses fingerprinting + localStorage, not third-party cookies like GA. Still review local laws (GDPR) and your site privacy policy.",
  },
  {
    id: "data",
    question: "Where is my analytics data stored?",
    answer:
      "In your PostgreSQL database. One install can track multiple websites — sign in, create a project in the dashboard, and paste the embed code. Events, sessions, and pageviews stay in Postgres on your server.",
  },
  {
    id: "backend",
    question: "Do I need a separate tracking server?",
    answer:
      "No separate ingest service required. tracker.js POSTs to /api/events on your Open Analytics instance; the server validates the site key and writes to PostgreSQL. Optional Cloudflare Worker is supported if you want an edge proxy.",
  },
  {
    id: "spa",
    question: "Does it support Next.js / SPAs?",
    answer:
      "Yes. The tracker hooks pushState, replaceState, popstate, hashchange — page leave on the old URL, then pageview on the new one.",
  },
  {
    id: "vs-umami",
    question: "How is it different from Umami / Plausible?",
    answer:
      "Same privacy-friendly direction. OA stores everything in PostgreSQL with direct SQL and WebSocket realtime. Umami/Plausible offer hosted SaaS if you prefer not to self-host.",
  },
];

export function SleekFAQ({ embedded: _embedded = false }: { embedded?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <SleekStackSection
      id="faq"
      eyebrow="FAQ"
      title="Got questions?"
      description="Everything important before you start tracking your site with Open Analytics."
    >
      <div>
        {faqs.map((faq, index) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={cn(
                index < faqs.length - 1 && "border-b border-zinc-200 dark:border-zinc-800"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-zinc-50/80 sm:px-8 dark:hover:bg-zinc-900/50"
                aria-expanded={isOpen}
              >
                <span className="w-7 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 text-base font-semibold leading-snug text-foreground">
                  {faq.question}
                </span>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-background dark:border-zinc-700">
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>
              {isOpen ? (
                <div className="border-t border-zinc-200 px-5 pb-6 pt-4 pl-[4.25rem] text-sm leading-relaxed text-muted-foreground sm:px-8 sm:pb-7 sm:pl-[4.75rem] sm:pt-5 dark:border-zinc-800">
                  {faq.answer}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </SleekStackSection>
  );
}

export function SleekFinalCTA({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekBlockSection embedded>
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,255,255,0.15),transparent_60%)]"
          aria-hidden
        />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Understand your traffic in one clean dashboard
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-emerald-50 sm:text-lg">
            Start with one script, keep every important signal in your PostgreSQL —
            free, open source, no credit card.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GetStartedButton
              showArrow
              size="md"
              className="rounded-full bg-white px-7 text-emerald-700 shadow-lg hover:bg-emerald-50"
            />
            <Link
              href="/docs/installation"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Installation guide
            </Link>
          </div>
        </div>
      </div>
    </SleekBlockSection>
  );
}

export function SleekFooter({ embedded: _embedded = false }: { embedded?: boolean }) {
  return (
    <SleekBlockSection embedded>
      <div className="px-6 py-10 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div className="text-center sm:text-left">
            <Logo size="sm" link={false} />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Privacy-friendly analytics for the modern web. Open source, self-hosted,
              PostgreSQL-backed.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground">
              Docs
            </Link>
            <Link href="/new#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="/new#faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </Link>
            <Link href="/app" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-8 text-sm text-muted-foreground sm:flex-row dark:border-zinc-800">
          <p>© {new Date().getFullYear()} Open Analytics · MIT · Next.js + PostgreSQL</p>
          <Link href="/" className="hover:text-foreground">
            View original homepage →
          </Link>
        </div>
      </div>
    </SleekBlockSection>
  );
}
