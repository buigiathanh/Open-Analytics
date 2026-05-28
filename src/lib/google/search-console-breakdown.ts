export const GSC_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export type GscPageSize = (typeof GSC_PAGE_SIZE_OPTIONS)[number];

export const GSC_DEFAULT_PAGE_SIZE: GscPageSize = 25;
export const GSC_DEFAULT_BREAKDOWN_MAX_ROWS = 1000;
export const GSC_MAX_BREAKDOWN_ROWS = 25000;

export function parseGscPageSize(value: string | null | undefined): GscPageSize {
  const n = Number(value);
  if (GSC_PAGE_SIZE_OPTIONS.includes(n as GscPageSize)) return n as GscPageSize;
  return GSC_DEFAULT_PAGE_SIZE;
}

export function parseBreakdownMaxRows(
  value: string | null | undefined
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return GSC_DEFAULT_BREAKDOWN_MAX_ROWS;
  return Math.min(GSC_MAX_BREAKDOWN_ROWS, Math.max(100, Math.floor(n)));
}
