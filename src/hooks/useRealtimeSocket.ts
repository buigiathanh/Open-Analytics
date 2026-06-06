"use client";

import { useEffect, useRef } from "react";
import type { AnalyticsEvent, BotVisit } from "@/lib/types";

function wsUrl(siteId: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  const parsed = new URL(base);
  const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${parsed.host}/api/realtime/ws?site_id=${encodeURIComponent(siteId)}`;
}

export type RealtimeSocketHandlers = {
  onEvent?: (event: AnalyticsEvent) => void;
  onBotVisit?: (visit: BotVisit) => void;
};

export function useRealtimeSocket(
  siteId: string,
  onEventOrHandlers:
    | ((event: AnalyticsEvent) => void)
    | RealtimeSocketHandlers,
  enabled = true
): void {
  const handlersRef = useRef<RealtimeSocketHandlers>({});
  handlersRef.current =
    typeof onEventOrHandlers === "function"
      ? { onEvent: onEventOrHandlers }
      : onEventOrHandlers;

  useEffect(() => {
    if (!enabled) return;
    let ws: WebSocket | null = null;
    let closed = false;
    let retryMs = 1000;

    function connect() {
      if (closed) return;
      try {
        ws = new WebSocket(wsUrl(siteId));
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as {
            type?: string;
            data?: AnalyticsEvent | BotVisit;
          };
          if (msg.type === "event" && msg.data) {
            handlersRef.current.onEvent?.(msg.data as AnalyticsEvent);
          } else if (msg.type === "bot_visit" && msg.data) {
            handlersRef.current.onBotVisit?.(msg.data as BotVisit);
          }
        } catch {
          /* ignore malformed */
        }
      };

      ws.onopen = () => {
        retryMs = 1000;
      };

      ws.onclose = () => {
        ws = null;
        scheduleReconnect();
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    function scheduleReconnect() {
      if (closed) return;
      setTimeout(connect, retryMs);
      retryMs = Math.min(retryMs * 2, 30_000);
    }

    connect();

    return () => {
      closed = true;
      ws?.close();
    };
  }, [siteId, enabled]);
}
