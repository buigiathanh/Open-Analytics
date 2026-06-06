import type { BotVisit } from "@/lib/types";

/** Prepend one bot visit if not already present. */
export function prependBotVisit(
  prev: BotVisit[],
  visit: BotVisit,
  max = 200
): BotVisit[] {
  if (prev.some((v) => v.id === visit.id)) return prev;
  return [visit, ...prev].slice(0, max);
}
