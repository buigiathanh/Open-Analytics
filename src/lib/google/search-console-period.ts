/** Allowed Search Console analytics ranges (matches API clamp 7–90). */
export const GSC_PERIOD_OPTIONS = [
  { days: 7, label: "7 days" },
  { days: 28, label: "28 days" },
  { days: 90, label: "3 months" },
] as const;

export type GscPeriodDays = (typeof GSC_PERIOD_OPTIONS)[number]["days"];

export const GSC_DEFAULT_PERIOD_DAYS: GscPeriodDays = 28;

export function parseGscPeriodDays(
  param: string | null | undefined
): GscPeriodDays {
  const n = Number(param);
  if (n === 7 || n === 90) return n;
  return GSC_DEFAULT_PERIOD_DAYS;
}

export function gscPeriodLabel(days: GscPeriodDays): string {
  return GSC_PERIOD_OPTIONS.find((o) => o.days === days)?.label ?? `${days} days`;
}
