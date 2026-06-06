"use client";

import { useRouter } from "next/navigation";
import type { Site } from "@/lib/types";
import { BotTrackingSetup } from "./BotTrackingSetup";

interface BotSetupGateProps {
  site: Site;
  hasBotTracking: boolean;
}

export function BotSetupGate({ site, hasBotTracking }: BotSetupGateProps) {
  const router = useRouter();

  if (hasBotTracking) return null;

  function handleClose() {
    router.push("/app");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bot-setup-title"
    >
      <header className="shrink-0 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="bot-setup-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Connect bot tracking
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Add the snippet below to your site&apos;s middleware or proxy to
              start tracking crawlers and AI bots. Verify when ready — or close
              to return to your websites.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-lg border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close and return to websites"
          >
            <svg
              className="size-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:overflow-hidden lg:px-8">
        <div className="mx-auto h-full max-w-6xl">
          <BotTrackingSetup
            site={site}
            onVerified={() => router.refresh()}
          />
        </div>
      </div>
    </div>
  );
}
