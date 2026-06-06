import type { AnalyticsEvent } from "@/lib/types";

/** Prepend one event if not already present. */
export function prependAnalyticsEvent(
  prev: AnalyticsEvent[],
  event: AnalyticsEvent,
  max = 800
): AnalyticsEvent[] {
  if (prev.some((e) => e.id === event.id)) return prev;
  return [event, ...prev].slice(0, max);
}
