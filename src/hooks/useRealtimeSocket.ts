"use client";

import { useEffect, useRef } from "react";
import type { AnalyticsEvent } from "@/lib/types";

function wsUrl(siteId: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
  const parsed = new URL(base);
  const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${parsed.host}/api/realtime/ws?site_id=${encodeURIComponent(siteId)}`;
}

export function useRealtimeSocket(
  siteId: string,
  onEvent: (event: AnalyticsEvent) => void
): void {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
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
            data?: AnalyticsEvent;
          };
          if (msg.type === "event" && msg.data) {
            onEventRef.current(msg.data);
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
  }, [siteId]);
}
