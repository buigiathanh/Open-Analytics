"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Site } from "@/lib/types";
import {
  buildBotInlineSnippet,
  snippetFileLabel,
  type BotNextConvention,
  type BotSnippetLanguage,
} from "@/lib/bot-tracker-snippet";

interface BotTrackingSetupProps {
  site: Site;
  onVerified?: () => void;
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string; hint?: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </p>
      <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              value === opt.id
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {options.find((o) => o.id === value)?.hint && (
        <p className="mt-1 text-[11px] text-zinc-500">
          {options.find((o) => o.id === value)?.hint}
        </p>
      )}
    </div>
  );
}

export function BotTrackingSetup({ site, onVerified }: BotTrackingSetupProps) {
  const router = useRouter();
  const [convention, setConvention] = useState<BotNextConvention>("proxy");
  const [language, setLanguage] = useState<BotSnippetLanguage>("ts");
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const apiKey = site.api_key;

  const snippet = useMemo(() => {
    if (!apiKey) return "";
    return buildBotInlineSnippet({
      siteKey: site.site_key,
      apiKey,
      convention,
      language,
    });
  }, [site.site_key, apiKey, convention, language]);

  if (!apiKey) {
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
        Missing API key for this site. Run the latest{" "}
        <code className="font-mono">supabase/schema-postgres.sql</code> migration,
        then refresh.
      </p>
    );
  }

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
      const res = await fetch(`/api/sites/${site.id}/verify-bot-tracking`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyError(data.error ?? "Could not verify bot tracking.");
        return;
      }
      if (data.verified) {
        setVerified(true);
        onVerified?.();
        router.refresh();
      } else {
        setVerifyError(
          data.error ??
            "No bot visit received. Add the code to your site, deploy, then try again."
        );
      }
    } catch {
      setVerifyError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="grid h-full gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="flex flex-col gap-5">
        {site.name && (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Add bot tracking to <strong>{site.name}</strong>
            {site.domain ? ` (${site.domain})` : ""}. Server-side detection
            catches crawlers that never run JavaScript.
          </p>
        )}

        <OptionGroup
          label="Next.js convention"
          value={convention}
          onChange={setConvention}
          options={[
            {
              id: "proxy",
              label: "proxy",
              hint: "Next.js 16+ — src/proxy.ts, export function proxy()",
            },
            {
              id: "middleware",
              label: "middleware",
              hint: "Next.js 15 and earlier — middleware.ts, export function middleware()",
            },
          ]}
        />

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          <p>
            Site key:{" "}
            <code className="font-mono text-zinc-800 dark:text-zinc-200">
              {site.site_key}
            </code>
          </p>
          <p className="mt-2">
            API key:{" "}
            <code className="font-mono text-zinc-800 dark:text-zinc-200">
              {apiKey}
            </code>
          </p>
          <p className="mt-2">
            Visits are sent to{" "}
            <code className="font-mono text-zinc-800 dark:text-zinc-200">
              /api/bot-visits
            </code>{" "}
            with{" "}
            <code className="font-mono text-zinc-800 dark:text-zinc-200">
              site_key
            </code>{" "}
            in the body and{" "}
            <code className="font-mono text-zinc-800 dark:text-zinc-200">
              x-api-key
            </code>{" "}
            in the header. Open Analytics verifies both, then checks user-agent
            and bot IP on the server.
          </p>
        </div>

        {verified && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            Bot tracking verified — your server is forwarding bot visits.
          </p>
        )}

        {verifyError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {verifyError}
          </p>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || verified}
          className="mt-auto w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {verifying
            ? "Sending test bot visit…"
            : verified
              ? "Verified"
              : "Verify bot tracking"}
        </button>
      </div>

      <div className="flex min-h-[280px] flex-col lg:min-h-0">
        <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
          <div className="flex gap-4 font-mono text-sm">
            {(["ts", "js"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={
                  language === lang
                    ? "font-medium text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                }
              >
                {snippetFileLabel(convention, lang)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={copySnippet}
            className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            {snippetCopied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="min-h-0 flex-1 overflow-auto rounded-lg border border-zinc-200 bg-zinc-950 p-4 text-[11px] leading-relaxed text-zinc-100 dark:border-zinc-700">
          {snippet}
        </pre>
      </div>
    </div>
  );
}
