export type RealtimeMapMode = "globe" | "2d";
export type RealtimeThemeMode = "light" | "dark";

export function parseRealtimeMapMode(
  value: string | null | undefined
): RealtimeMapMode {
  return value === "2d" ? "2d" : "globe";
}

export function parseRealtimeTheme(
  value: string | null | undefined
): RealtimeThemeMode | null {
  if (value === "light" || value === "dark") return value;
  return null;
}

export function realtimeThemeFromResolved(
  resolved: string | undefined
): RealtimeThemeMode {
  return resolved === "dark" ? "dark" : "light";
}

export function realtimeQueryString(opts: {
  theme: RealtimeThemeMode;
  map: RealtimeMapMode;
}): string {
  const params = new URLSearchParams();
  params.set("theme", opts.theme);
  params.set("map", opts.map);
  return params.toString();
}

/** Authenticated dashboard realtime (requires sign-in). */
export function buildAppRealtimePath(
  siteId: string,
  opts: { theme: RealtimeThemeMode; map: RealtimeMapMode }
): string {
  const q = realtimeQueryString(opts);
  return `/app/${siteId}/realtime?${q}`;
}

/** Public share link (no sign-in; requires share_realtime_enabled on project). */
export function buildPublicRealtimeSharePath(
  siteId: string,
  opts: { theme: RealtimeThemeMode; map: RealtimeMapMode }
): string {
  const q = realtimeQueryString(opts);
  return `/share/${siteId}/realtime?${q}`;
}

export function buildRealtimeShareUrl(
  base: string,
  siteId: string,
  opts: { theme: RealtimeThemeMode; map: RealtimeMapMode }
): string {
  return `${base.replace(/\/$/, "")}${buildPublicRealtimeSharePath(siteId, opts)}`;
}

export function realtimeUrlMatches(
  searchParams: URLSearchParams,
  opts: { theme: RealtimeThemeMode; map: RealtimeMapMode }
): boolean {
  return (
    searchParams.get("theme") === opts.theme &&
    searchParams.get("map") === opts.map
  );
}
