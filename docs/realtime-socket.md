# Realtime WebSocket

Open Analytics pushes new tracking events to connected dashboard clients over WebSocket so the Realtime page updates without polling Supabase.

## Endpoint

```
ws://<host>/api/realtime/ws?site_id=<PROJECT_ID>
```

Production example (HTTPS):

```
wss://analytics.example.com/api/realtime/ws?site_id=35db12b6-8921-4419-8bad-1c6518449ab4
```

| Query param | Required | Description |
|-------------|----------|-------------|
| `site_id`   | Yes      | Project UUID from **Projects** (same as `/app/[siteId]/…` in the dashboard). |

The custom Node server (`server.mjs`) handles WebSocket upgrades on this path. Run the app with `npm run dev` or `npm start` (not plain `next dev` / `next start`) so the socket is available.

## Room model

Each project has its own WebSocket **room** keyed by `site_id`. Clients subscribe to one room when they open the Realtime page for that project. When `POST /api/events` inserts an event, the server resolves the project from `site_key` and broadcasts only to sockets in that project's room.

## Connection flow

```mermaid
sequenceDiagram
  participant Client as Realtime page
  participant WS as /api/realtime/ws
  participant API as POST /api/events
  participant DB as PostgreSQL

  Client->>WS: connect ?site_id=…
  WS-->>Client: {"type":"connected","site_id":"…"}
  Note over Client,WS: Joined project room
  API->>DB: INSERT event
  API->>WS: broadcast(site_id, event)
  WS-->>Client: {"type":"event","data":{…}}
```

1. Client opens WebSocket with the project's `site_id`.
2. Server responds with a `connected` message.
3. When `POST /api/events` inserts an event, the server broadcasts an `event` message to all sockets in that project's room.
4. Client merges the event into its local list (same shape as `AnalyticsEvent` from the REST API).

## Message format

### Server → client: connected

```json
{
  "type": "connected",
  "site_id": "35db12b6-8921-4419-8bad-1c6518449ab4"
}
```

### Server → client: new event

```json
{
  "type": "event",
  "data": {
    "id": 12345,
    "site_key": "abc123def456",
    "visitor_id": "…",
    "session_id": "…",
    "event_type": 1,
    "path": "/",
    "created_at": "2026-06-06T12:00:00.000Z"
  }
}
```

The `data` object matches rows returned by `GET /api/sites/[siteId]/events`.

## Client example

```javascript
const siteId = "35db12b6-8921-4419-8bad-1c6518449ab4";
const protocol = location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(
  `${protocol}//${location.host}/api/realtime/ws?site_id=${encodeURIComponent(siteId)}`
);

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.type === "event") {
    console.log("New visit:", msg.data);
  }
};
```

The dashboard uses `useRealtimeSocket` (`src/hooks/useRealtimeSocket.ts`) with automatic reconnect. Initial events are loaded server-side when the page opens; live updates come only from the WebSocket.

## Security notes

- **Public share pages** (`/share/[siteId]/realtime`) only work when the owner enabled sharing; the page uses `site_id` for the socket room.
- Anyone who knows a valid `site_id` can subscribe to live events for that project. Share links are intended for read-only public viewing.
- Event **writes** go through `POST /api/events` with rate limiting, payload validation, and domain checks — not through the WebSocket.
