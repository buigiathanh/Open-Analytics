"use client";

import Link from "next/link";
import {
  Check,
  Copy,
  Globe,
  Map,
  Pause,
  Play,
  Share2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Site } from "@/lib/types";
import type { RealtimeMapMode } from "@/lib/realtime-url";

const GLASS =
  "rounded-xl border border-zinc-200/80 bg-white/75 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-zinc-900/80 dark:shadow-2xl";

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const ICON_BTN =
  "inline-flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

const ICON_BTN_ACTIVE =
  "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:border-blue-400/40 dark:bg-blue-500/15 dark:text-blue-400";

interface RealtimeOverlayProps {
  site: Site;
  mode: "owner" | "public";
  demoMode?: boolean;
  shareRealtimeEnabled: boolean;
  liveCount: number;
  mapViewMode: RealtimeMapMode;
  onMapViewModeChange: (mode: RealtimeMapMode) => void;
  isRotating: boolean;
  onToggleRotating: () => void;
  shareUrl: string;
  embedCode: string;
}

export function RealtimeOverlay({
  site,
  mode,
  demoMode = false,
  shareRealtimeEnabled: shareEnabledInitial,
  liveCount,
  mapViewMode,
  onMapViewModeChange,
  isRotating,
  onToggleRotating,
  shareUrl,
  embedCode,
}: RealtimeOverlayProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEnabled, setShareEnabled] = useState(shareEnabledInitial);
  const [shareSaving, setShareSaving] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShareEnabled(shareEnabledInitial);
  }, [shareEnabledInitial]);

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
    } catch {
      setShareError("Network error. Try again.");
    } finally {
      setShareSaving(false);
    }
  }

  const closeShare = useCallback(() => setShareOpen(false), []);

  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeShare();
    };
    const onPointerDown = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        closeShare();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [shareOpen, closeShare]);

  async function copyText(text: string, which: "link" | "embed") {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      }
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="relative z-20 flex shrink-0 items-center justify-between gap-3 p-3 sm:p-4">
      <div className={`${GLASS} flex items-center gap-3 px-3 py-2`}>
        {mode === "owner" ? (
          <>
            <Link
              href={`/app/${site.id}`}
              className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              ← Stats
            </Link>
            <span className="text-zinc-300 dark:text-zinc-500">|</span>
          </>
        ) : null}
        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
          {mode === "public" ? site.name : "Open Analytics"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-white/10 dark:text-emerald-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          {liveCount} live
        </span>
        {demoMode ? (
          <span className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
            Demo data
          </span>
        ) : null}
        <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:inline">
          on {site.domain}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {mapViewMode === "globe" && (
          <button
            type="button"
            onClick={onToggleRotating}
            className={ICON_BTN}
            aria-label={isRotating ? "Pause globe rotation" : "Rotate globe"}
            title={isRotating ? "Pause" : "Play"}
          >
            {isRotating ? (
              <Pause className="size-4" strokeWidth={2} />
            ) : (
              <Play className="size-4" strokeWidth={2} />
            )}
          </button>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMapViewModeChange("globe")}
            className={cn(ICON_BTN, mapViewMode === "globe" && ICON_BTN_ACTIVE)}
            aria-label="3D globe mode"
            aria-pressed={mapViewMode === "globe"}
            title="Globe 3D"
          >
            <Globe className="size-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onMapViewModeChange("2d")}
            className={cn(ICON_BTN, mapViewMode === "2d" && ICON_BTN_ACTIVE)}
            aria-label="2D map"
            aria-pressed={mapViewMode === "2d"}
            title="2D map"
          >
            <Map className="size-4" strokeWidth={2} />
          </button>
        </div>
        {mode === "owner" ? (
          <div className="relative" ref={shareRef}>
            <button
              type="button"
              onClick={() => setShareOpen((o) => !o)}
              className={cn(ICON_BTN, shareOpen && ICON_BTN_ACTIVE)}
              aria-label="Share realtime"
              aria-expanded={shareOpen}
              title="Share"
            >
              <Share2 className="size-4" strokeWidth={2} />
            </button>
            {shareOpen && (
              <div
                className={`absolute right-0 top-full z-30 mt-2 w-[min(100vw-2rem,22rem)] ${GLASS} p-4 shadow-2xl`}
                role="dialog"
                aria-labelledby="realtime-share-title"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      id="realtime-share-title"
                      className="text-sm font-semibold text-zinc-900 dark:text-white"
                    >
                      Share realtime
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Public link format:{" "}
                      <code className="text-[10px]">/share/…/realtime</code>. No
                      sign-in required when sharing is enabled.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeShare}
                    className="shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-zinc-200/80 bg-white/50 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950/50">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      Allow public share link
                    </span>
                    <input
                      type="checkbox"
                      checked={shareEnabled}
                      disabled={shareSaving}
                      onChange={(e) => setPublicShareEnabled(e.target.checked)}
                      className="size-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                  {shareError && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {shareError}
                    </p>
                  )}
                  {!shareEnabled ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Enable sharing to activate the public URL. Disabled links
                      return 404.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Theme ({isDark ? "dark" : "light"}) and map (
                        {mapViewMode === "globe" ? "globe" : "2D"}) are included
                        in the link.
                      </p>
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Share link
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white/90 px-2.5 py-1.5 text-xs text-zinc-800 dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-200"
                            onFocus={(e) => e.target.select()}
                          />
                          <button
                            type="button"
                            onClick={() => copyText(shareUrl, "link")}
                            className={cn(
                              ICON_BTN,
                              "shrink-0",
                              copiedLink && ICON_BTN_ACTIVE
                            )}
                            aria-label="Copy link"
                            title="Copy link"
                          >
                            {copiedLink ? (
                              <Check className="size-4" strokeWidth={2} />
                            ) : (
                              <Copy className="size-4" strokeWidth={2} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Embed on site (iframe)
                        </p>
                        <pre className="max-h-24 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50/90 p-2 text-[10px] leading-relaxed text-zinc-700 dark:border-zinc-600 dark:bg-zinc-950/80 dark:text-zinc-300">
                          {embedCode}
                        </pre>
                        <button
                          type="button"
                          onClick={() => copyText(embedCode, "embed")}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          {copiedEmbed ? (
                            <>
                              <Check className="size-3.5" />
                              Embed code copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              Copy embed code
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
        <ThemeToggle />
      </div>
    </div>
  );
}
