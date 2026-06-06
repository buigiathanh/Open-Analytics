"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildTrackerSnippet } from "@/lib/tracker-snippet";

type TrackingSite = {
  id: string;
  site_key: string;
  name?: string;
  domain?: string;
};

interface TrackingScriptSetupProps {
  site: TrackingSite;
  /** When true, show "Open dashboard" instead of verify after success */
  showDashboardLink?: boolean;
  onVerified?: () => void;
}

export function TrackingScriptSetup({
  site,
  showDashboardLink = false,
  onVerified,
}: TrackingScriptSetupProps) {
  const router = useRouter();
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const snippet = buildTrackerSnippet({ siteKey: site.site_key });

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(snippet);
      setSnippetCopied(true);
      setTimeout(() => setSnippetCopied(false), 2000);
    } catch {
      setSnippetCopied(false);
    }
  }

  async function handleVerify() {
    setVerifyError(null);
    setVerifying(true);
    try {
      const res = await fetch(`/api/sites/${site.id}/verify-tracking`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error ?? "Could not verify tracking.");
        return;
      }
      if (data.verified) {
        setVerified(true);
        onVerified?.();
      } else {
        setVerifyError(
          "No events received yet. Add the script to your site, publish, then try again."
        );
      }
    } catch {
      setVerifyError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  function handleOpenDashboard() {
    router.push(`/app/${site.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {site.name && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Add the tracking script to <strong>{site.name}</strong>
          {site.domain ? ` (${site.domain})` : ""}.
        </p>
      )}

      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Embed code
          </label>
          <button
            type="button"
            onClick={copySnippet}
            className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            {snippetCopied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="max-h-56 overflow-auto rounded-lg border border-zinc-200 bg-white p-3 text-[10px] leading-relaxed dark:border-zinc-700 dark:bg-zinc-900">
          {snippet}
        </pre>
      </div>

      {verified && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          Tracking verified — events are coming in.
        </p>
      )}

      {verifyError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {verifyError}
        </p>
      )}

      <div className="flex gap-2">
        {verified && showDashboardLink ? (
          <button
            type="button"
            onClick={handleOpenDashboard}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Open dashboard
          </button>
        ) : (
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {verifying ? "Checking…" : "Verify tracking"}
          </button>
        )}
      </div>
    </div>
  );
}
