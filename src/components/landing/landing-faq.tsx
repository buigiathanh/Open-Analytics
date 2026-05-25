"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { GridMarkers, OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingBody, landingEyebrow } from "@/components/landing/landing-typography";
import { cn } from "@/lib/utils";

type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

const faqs: FaqItem[] = [
  {
    id: "cost",
    question: "Is Open Analytics free?",
    answer:
      "MIT licensed, self-hosted. You only pay for Supabase (free tier is usually enough for small sites). No subscription fee from Open Analytics.",
  },
  {
    id: "privacy",
    question: "Do I need a cookie banner?",
    answer:
      "The tracker uses fingerprinting + localStorage, not third-party cookies like GA. Still review local laws (GDPR) and your site privacy policy.",
  },
  {
    id: "supabase",
    question: "Why one Supabase project per site?",
    answer:
      "Each website uses your own Supabase project for events. The app database in .env only stores sign-in and site settings (project URL + publishable key), not visitor analytics.",
  },
  {
    id: "backend",
    question: "Do I need a separate tracking server?",
    answer:
      "No. tracker.js sends directly to Supabase. In production, tighten RLS; you can proxy via API if you do not want to expose the anon key.",
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
      "Same privacy-friendly direction. OA is Supabase-native: SQL, Realtime, custom schema. Umami/Plausible offer hosted SaaS if you prefer not to self-host.",
  },
];

const GRID_COLS = 2;
const GRID_ROWS = Math.ceil(faqs.length / GRID_COLS);

function FaqCell({
  id,
  number,
  question,
  answer,
  index,
  openId,
  onToggle,
}: FaqItem & {
  number: string;
  index: number;
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  const isOpen = openId === id;

  return (
    <div
      className={cn(
        "border-zinc-200 dark:border-zinc-800",
        index < faqs.length - 1 && "border-b",
        index % GRID_COLS === 0 && "md:border-r"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="group flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-zinc-50/50 sm:px-6 dark:hover:bg-zinc-900/50"
        aria-expanded={isOpen}
      >
        <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground/70">
          {number}
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
          {question}
        </span>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-background transition-colors group-hover:border-zinc-300 dark:border-zinc-700">
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            strokeWidth={2}
          />
        </div>
      </button>
      {isOpen ? (
        <div className={`px-5 pb-5 pl-[3.25rem] sm:px-6 sm:pl-[3.5rem] ${landingBody}`}>
          {answer}
        </div>
      ) : null}
    </div>
  );
}

export function LandingFAQ() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  function onToggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <section id="faq" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative border border-zinc-200 dark:border-zinc-800">
          <OuterCornerMarkers />

          <div className="border-b border-zinc-200 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-zinc-800">
            <p className={landingEyebrow}>FAQ</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Pricing, privacy, Supabase, and how we compare to popular tools.
            </p>
          </div>

          <div className="relative">
            <GridMarkers
              columns={1}
              rows={faqs.length}
              className="md:hidden"
            />
            <GridMarkers
              columns={GRID_COLS}
              rows={GRID_ROWS}
              className="hidden md:block"
            />
            <div className="grid grid-cols-1 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <FaqCell
                  key={faq.id}
                  {...faq}
                  number={String(index + 1).padStart(2, "0")}
                  index={index}
                  openId={openId}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
