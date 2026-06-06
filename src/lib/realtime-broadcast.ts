import type { AnalyticsEvent } from "@/lib/types";

export interface RealtimeHub {
  subscribe(siteId: string, ws: WebSocketLike): void;
  unsubscribe(siteId: string, ws: WebSocketLike): void;
  broadcast(siteId: string, event: AnalyticsEvent): void;
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
  getRealtimeHub()?.broadcast(siteId, event);
}
