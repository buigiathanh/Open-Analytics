import type { AnalyticsEvent } from "@/lib/types";

export interface RealtimeHub {
  subscribe(siteKey: string, ws: WebSocketLike): void;
  unsubscribe(siteKey: string, ws: WebSocketLike): void;
  broadcast(siteKey: string, event: AnalyticsEvent): void;
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

export function broadcastAnalyticsEvent(
  siteKey: string,
  event: AnalyticsEvent
): void {
  getRealtimeHub()?.broadcast(siteKey, event);
}
