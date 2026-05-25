"use client";

import Link from "next/link";
import {
  Check,
  Copy,
  Eye,
  Globe,
  Map,
  Monitor,
  Pause,
  Play,
  Share2,
  Smartphone,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { ThemeToggle } from "@/components/ThemeToggle";
import { visitorStatusColor } from "@/lib/visitor-identity";
import type { BreakdownRow } from "@/lib/analytics";
import type { LiveFeedItem } from "@/lib/analytics";
import type { Site } from "@/lib/types";

const GLASS =
  "rounded-xl border border-zinc-200/80 bg-white/75 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-zinc-900/80 dark:shadow-2xl";

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function formatTimeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

const STATUS_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  emerald: "bg-emerald-400",
  white: "bg-white",
};

function BreakdownList({
  title,
  rows,
  showFlag,
}: {
  title: string;
  rows: BreakdownRow[];
  showFlag?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <ul className="space-y-1">
        {rows.length === 0 ? (
          <li className="text-xs text-zinc-400 dark:text-zinc-500">—</li>
        ) : (
          rows.map((r) => (
            <li
              key={r.key}
              className="flex items-center justify-between gap-2 text-xs text-zinc-700 dark:text-zinc-200"
            >
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                {showFlag && (
                  <span className="shrink-0 text-sm">{r.icon}</span>
                )}
                <span className="truncate">{r.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                {r.count}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

const ICON_BTN =
  "inline-flex size-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

const ICON_BTN_ACTIVE =
  "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:border-blue-400/40 dark:bg-blue-500/15 dark:text-blue-400";

import type { RealtimeMapMode } from "@/lib/realtime-url";

interface RealtimeOverlayProps {
  site: Site;
  mode: "owner" | "public";
  shareRealtimeEnabled: boolean;
  liveCount: number;
  minuteSeries: { label: string; pageviews: number }[];
  referrers: BreakdownRow[];
  countries: BreakdownRow[];
  devices: BreakdownRow[];
  feed: LiveFeedItem[];
  selectedVisitorId: string | null;
  onSelectVisitor: (visitorId: string) => void;
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
  shareRealtimeEnabled: shareEnabledInitial,
  liveCount,
  minuteSeries,
  referrers,
  countries,
  devices,
  feed,
  selectedVisitorId,
  onSelectVisitor,
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

  const total5 = minuteSeries.reduce((a, b) => a + b.pageviews, 0);
  const peak = minuteSeries.reduce(
    (best, p) => (p.pageviews > best.pageviews ? p : best),
    { label: "—", pageviews: 0 }
  );

  const tooltipStyle = isDark
    ? {
        fontSize: 11,
        background: "#18181b",
        border: "1px solid #3f3f46",
        borderRadius: 6,
        color: "#fafafa",
      }
    : {
        fontSize: 11,
        background: "#ffffff",
        border: "1px solid #e4e4e7",
        borderRadius: 6,
        color: "#18181b",
      };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col p-3 sm:p-5">
      <div className="pointer-events-auto flex items-center justify-between gap-3">
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
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-white/10 dark:text-emerald-400">
            Realtime
          </span>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
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
              className={cn(
                ICON_BTN,
                mapViewMode === "globe" && ICON_BTN_ACTIVE
              )}
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
                      Public link format: <code className="text-[10px]">/share/…/realtime</code>.
                      No sign-in required when sharing is enabled.
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
                    <p className="text-xs text-red-600 dark:text-red-400">{shareError}</p>
                  )}
                  {!shareEnabled ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Enable sharing to activate the public URL. Disabled links return 404.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Theme ({isDark ? "dark" : "light"}) and map (
                        {mapViewMode === "globe" ? "globe" : "2D"}) are included in the link.
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

      <div className={`pointer-events-auto mt-4 max-w-sm ${GLASS} p-4`}>
        <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-blue-500" />
          </span>
          {liveCount} visitor{liveCount !== 1 ? "s" : ""} on{" "}
          <span className="text-zinc-500 dark:text-zinc-300">{site.domain}</span>
        </p>

        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Last 5 min
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            {total5} pageviews · peak {peak.pageviews} @ {peak.label}
          </p>
          <div className="mt-2 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={minuteSeries}>
                <defs>
                  <linearGradient id="oaRtPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  stroke="#3b82f6"
                  fill="url(#oaRtPv)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-200/80 pt-3 dark:border-white/10">
          <BreakdownList title="Referrers" rows={referrers} />
          <BreakdownList title="Countries" rows={countries} showFlag />
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Devices
            </p>
            <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-200">
              {devices.length === 0 ? (
                <li className="text-zinc-400 dark:text-zinc-500">—</li>
              ) : (
                devices.map((d) => (
                  <li
                    key={d.key}
                    className="flex items-center justify-between gap-1"
                  >
                    <span className="flex items-center gap-1 truncate">
                      {d.label.toLowerCase().includes("mobile") ? (
                        <Smartphone className="size-3 text-zinc-400 dark:text-zinc-500" />
                      ) : (
                        <Monitor className="size-3 text-zinc-400 dark:text-zinc-500" />
                      )}
                      {d.label}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">{d.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div
        className={`pointer-events-auto max-h-[38vh] w-full max-w-[350px] overflow-hidden ${GLASS}`}
      >
        <ul className="max-h-[38vh] overflow-y-auto p-2">
          {feed.length === 0 ? (
            <li className="px-2 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
              No activity in the last 5 minutes
            </li>
          ) : (
            feed.map((v) => {
              const status = visitorStatusColor(v.visitor_id);
              const flagCode =
                v.country_code?.length === 2
                  ? v.country_code.toLowerCase()
                  : "xx";
              const isSelected = selectedVisitorId === v.visitor_id;
              return (
                <li key={v.visitor_id}>
                  <button
                    type="button"
                    onClick={() => onSelectVisitor(v.visitor_id)}
                    className={cn(
                      "relative flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition",
                      isSelected
                        ? "bg-blue-500/15 ring-1 ring-blue-500/40 dark:bg-blue-500/20"
                        : "hover:bg-zinc-100/80 dark:hover:bg-white/5"
                    )}
                  >
                  <Eye className="size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.avatar}
                      alt=""
                      width={28}
                      height={28}
                      className="size-7 rounded-full border-2 border-white bg-zinc-100 object-cover dark:border-zinc-800 dark:bg-zinc-800"
                    />
                    <span
                      className={`absolute -right-0.5 -top-0.5 size-2 rounded-full border border-white dark:border-zinc-900 ${STATUS_DOT[status]}`}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {v.displayName}
                    </p>
                    <p className="flex items-center gap-1 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://flagcdn.com/w20/${flagCode}.png`}
                        alt=""
                        width={14}
                        height={10}
                        className="h-2.5 w-3.5 shrink-0 rounded-[1px]"
                      />
                      <span className="truncate">{v.path || "/"}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
                    {formatTimeAgo(v.last_seen)}
                  </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <p className="pointer-events-none absolute bottom-4 right-4 text-[10px] text-zinc-400 dark:text-zinc-500">
        Powered by{" "}
        <span className="font-medium text-zinc-500 dark:text-zinc-400">
          Open Analytics
        </span>
      </p>
    </div>
  );
}
