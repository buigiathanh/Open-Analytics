import type { UrlInspectionSummary } from "@/lib/google/url-inspection";

export function formatGscDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value.slice(0, 16);
  }
}

export function urlDisplayTitle(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname === "/" || !u.pathname) return u.hostname;
    const path = decodeURIComponent(u.pathname);
    if (path.length <= 72) return path;
    return `${path.slice(0, 69)}…`;
  } catch {
    return url.length > 72 ? `${url.slice(0, 69)}…` : url;
  }
}

export function indexStatusLabel(
  inspection: UrlInspectionSummary | null | undefined
): { label: string; className: string } {
  if (!inspection) {
    return {
      label: "Not checked",
      className:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    };
  }
  if (inspection.indexed) {
    return {
      label: "Indexed",
      className:
        "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    };
  }
  if (inspection.verdict === "NEUTRAL") {
    return {
      label: "Excluded",
      className:
        "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    };
  }
  if (inspection.verdict === "FAIL") {
    return {
      label: "Not indexed",
      className: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    };
  }
  return {
    label: inspection.coverageState ?? "Unknown",
    className:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
}

export function IndexStatusBadge({
  inspection,
}: {
  inspection: UrlInspectionSummary | null | undefined;
}) {
  const status = indexStatusLabel(inspection);
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}
    >
      {status.label}
    </span>
  );
}
