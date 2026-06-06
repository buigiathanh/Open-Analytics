"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Site } from "@/lib/types";
import { TrackingScriptSetup } from "./TrackingScriptSetup";

interface TrackingSetupGateProps {
  site: Site;
  hasTracking: boolean;
}

export function TrackingSetupGate({ site, hasTracking }: TrackingSetupGateProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (hasTracking || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracking-setup-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2
            id="tracking-setup-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Install tracking script
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Add the script below to your website before using the dashboard.
          </p>
        </div>
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-5">
          <TrackingScriptSetup
            site={site}
            onVerified={() => {
              setDismissed(true);
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}
