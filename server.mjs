/**
 * Custom Next.js server with WebSocket support for realtime analytics.
 * WebSocket: /api/realtime/ws?site_key=YOUR_SITE_KEY
 * See docs/realtime-socket.md
 */
import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { WebSocketServer } from "ws";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3001", 10);
const WS_OPEN = 1;

function createRealtimeHub() {
  /** @type {Map<string, Set<import('ws').WebSocket>>} */
  const channels = new Map();

  return {
    subscribe(siteKey, ws) {
      let set = channels.get(siteKey);
      if (!set) {
        set = new Set();
        channels.set(siteKey, set);
      }
      set.add(ws);
    },
    unsubscribe(siteKey, ws) {
      const set = channels.get(siteKey);
      if (!set) return;
      set.delete(ws);
      if (set.size === 0) channels.delete(siteKey);
    },
    broadcast(siteKey, event) {
      const set = channels.get(siteKey);
      if (!set) return;
      const msg = JSON.stringify({ type: "event", data: event });
      for (const ws of set) {
        if (ws.readyState === WS_OPEN) {
          try {
            ws.send(msg);
          } catch {
            set.delete(ws);
          }
        } else {
          set.delete(ws);
        }
      }
    },
  };
}

const hub = createRealtimeHub();
globalThis.__oaRealtimeHub = hub;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const upgradeHandler = app.getUpgradeHandler();

  const server = createServer((req, res) => {
    handle(req, res, parse(req.url || "", true));
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws, req) => {
    const url = parse(req.url || "", true);
    const siteKey = String(url.query?.site_key || "").trim();
    if (!siteKey) {
      ws.close(4400, "Missing site_key");
      return;
    }

    hub.subscribe(siteKey, ws);
    ws.send(JSON.stringify({ type: "connected", site_key: siteKey }));

    ws.on("close", () => hub.unsubscribe(siteKey, ws));
    ws.on("error", () => hub.unsubscribe(siteKey, ws));
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "", true);
    if (pathname === "/api/realtime/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
      return;
    }
    // HMR (/_next/webpack-hmr) and other Next.js dev WebSockets
    upgradeHandler(req, socket, head);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(
      `> WebSocket: ws://${hostname}:${port}/api/realtime/ws?site_key=…`
    );
  });
});
