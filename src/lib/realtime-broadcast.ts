import type { AnalyticsEvent, BotVisit } from "@/lib/types";

export interface RealtimeHub {
  subscribe(siteId: string, ws: WebSocketLike): void;
  unsubscribe(siteId: string, ws: WebSocketLike): void;
  broadcast(siteId: string, type: string, data: unknown): void;
}

export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
}

declare global {
  // eslint-disable-next-line no-var
  var __oaRealtimeHub: RealtimeHub | undefined;
}

export function getRealtimeHub(): RealtimeHub | undefined {
  return global.__oaRealtimeHub;
}

/** Push a new event to all clients watching this project's realtime room. */
export function broadcastAnalyticsEvent(
  siteId: string,
  event: AnalyticsEvent
): void {
  getRealtimeHub()?.broadcast(siteId, "event", event);
}

/** Push a new bot visit to all clients watching this project's realtime room. */
export function broadcastBotVisit(siteId: string, visit: BotVisit): void {
  getRealtimeHub()?.broadcast(siteId, "bot_visit", visit);
}
