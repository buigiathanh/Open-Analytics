"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Site } from "@/lib/types";
import { buildRealtimeShareUrl } from "@/lib/realtime-url";
import { SiteSettingsSection } from "./SiteSettingsSection";

export function SiteSharingSettings({ site }: { site: Site }) {
  const router = useRouter();
  const [shareEnabled, setShareEnabled] = useState(
    site.share_realtime_enabled ?? false
  );
  const [shareSaving, setShareSaving] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    const base =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
          window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
    if (!base) return "";
    return buildRealtimeShareUrl(base, site.id, {
      theme: "light",
      map: "globe",
    });
  }, [site.id]);

  const embedCode = shareUrl
    ? `<iframe src="${shareUrl}" width="100%" height="600" style="border:0;border-radius:12px" allowfullscreen loading="lazy" title="Open Analytics Realtime"></iframe>`
    : "";

  async function setPublicShareEnabled(enabled: boolean) {
    setShareSaving(true);
    setShareError(null);
    try {
      const res = await fetch(`/api/sites/${site.id}/share`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShareError(data.error ?? "Could not update sharing.");
        return;
      }
      setShareEnabled(!!data.share_realtime_enabled);
      router.refresh();
    } catch {
      setShareError("Network error. Try again.");
    } finally {
      setShareSaving(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError("Could not copy to clipboard.");
    }
  }

  return (
    <SiteSettingsSection
      title="Sharing"
      description="Public realtime link for viewers without sign-in."
    >
      <div className="max-w-lg space-y-4">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <div>
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Allow public share link
            </span>
            <p className="mt-0.5 text-xs text-zinc-500">
              Format: <code className="text-[10px]">/share/…/realtime</code>.
              Disabled links return 404.
            </p>
          </div>
          <input
            type="checkbox"
            checked={shareEnabled}
            disabled={shareSaving}
            onChange={(e) => setPublicShareEnabled(e.target.checked)}
            className="size-4 shrink-0 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
          />
        </label>

        {shareError && (
          <p className="text-sm text-red-600 dark:text-red-400">{shareError}</p>
        )}

        {shareEnabled && shareUrl ? (
          <>
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Share link
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={() => copyText(shareUrl)}
                  className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Embed code
              </p>
              <textarea
                readOnly
                rows={4}
                value={embedCode}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-[11px] leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={() => copyText(embedCode)}
                className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              >
                Copy embed code
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            Enable sharing to activate the public URL.
          </p>
        )}
      </div>
    </SiteSettingsSection>
  );
}
