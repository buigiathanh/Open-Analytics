# Open Analytics

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase)](https://supabase.com)

**Privacy-friendly, self-hosted web analytics** — your events live in **your** Supabase. This repository ships **two separate pieces** you can use together or independently.

[Documentation](#documentation) · [Report an issue](https://github.com/buigiathanh/Open-Analytics/issues)

---

## What is in this repository?

| # | Component | Path | Purpose |
|---|-----------|------|---------|
| **1** | **Analytics dashboard** (management app) | [`src/`](src/) · [`supabase/schema-app.sql`](supabase/schema-app.sql) | Next.js app: sign-in, register websites, view stats, realtime map, built-in docs |
| **2** | **Tracking script** | [`public/tracker.js`](public/tracker.js) | Standalone browser script: POSTs pageviews & events to a **Cloudflare Worker** (or custom API) |
| **3** | **Ingest worker** | [`public/worker.js`](public/worker.js) | Edge proxy: validates payloads, rate-limits, inserts into Supabase with the Secret key |

```text
  ┌──────────────────────────────┐         ┌──────────────────────────────┐
  │  1. Dashboard /app (optional) │         │  2. tracker.js               │
  │     Next.js open-source UI    │         │     embed on your website    │
  │     • Sign-in                 │         │     • POST events            │
  │     • Add site + copy snippet │         │     • vanilla JS, one file   │
  │     • Charts & realtime       │         └──────────────┬───────────────┘
  └──────────────┬───────────────┘                        │ data-endpoint
                 │ reads (publishable key)                  ▼
                 ▼                          ┌──────────────────────────────┐
        ┌────────────────┐                  │  3. Cloudflare Worker        │
        │ App Supabase   │                  │     public/worker.js         │
        │ (.env)         │                  │     • rate limit             │
        │ profiles,      │                  │     • Secret key → insert    │
        │ projects       │                  └──────────────┬───────────────┘
        └────────────────┘                                 ▼
                                                  ┌────────────────┐
                                                  │ YOUR Supabase  │
                                                  │ events (RLS:   │
                                                  │ select only    │
                                                  │ for publishable│
                                                  │ key)           │
                                                  └────────────────┘
```

- **Your analytics data stays in your Supabase** — run [`schema-analytics.sql`](supabase/schema-analytics.sql) (publishable key = read-only), deploy [`worker.js`](public/worker.js) to Cloudflare for writes, put Project ID + publishable key in **Add website**.
- **App Supabase (`.env`)** — only for hosting this dashboard: sign-in and a list of sites (name, domain, link to your project URL + key). No pageviews are stored there.
- **You can use `tracker.js` without the dashboard** — if you have `sites` + `events` and a `site_key`, events still land in your project.

---

## Part 1 — Analytics dashboard (management app)

The dashboard is a **Next.js** application: landing page, authenticated `/app` UI, `/docs`, and it **serves** `public/tracker.js` at `/tracker.js`.

### What it includes

| Route / area | Description |
|--------------|-------------|
| `/` | Marketing landing |
| `/app` | Site list, add website, open per-site analytics |
| `/app/[siteId]` | Metrics, breakdowns, date range |
| `/app/[siteId]/realtime` | Live visitors + 3D globe |
| `/app/[siteId]/setup` | Embed snippet with your `site_key` |
| `/docs` | Installation, Supabase, tracker, security |
| `/tracker.js` | Static file from [`public/tracker.js`](public/tracker.js) |

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- One **app** Supabase project in `.env` (sign-in + site list for `/app`)
- One **your own** Supabase project per website you measure (analytics data — see [Part 2](#part-2--tracking-script-publictrackerjs))

### Initialize the dashboard

**Step 1 — App Supabase (`.env`)**

Whoever deploys this repo creates one Supabase project for the management app:

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run [`supabase/schema-app.sql`](supabase/schema-app.sql) once (new project).
3. **Settings → API** → copy **Project URL**, **Publishable key**, and **Secret key** (`service_role`) into `.env.local`.
4. (Optional) Enable **Authentication** (Google, GitHub) — see [`.env.example`](.env.example).

**Step 2 — Environment & run**

```bash
git clone https://github.com/buigiathanh/Open-Analytics.git
cd Open-Analytics
cp .env.example .env.local
```

Set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_APP_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_app_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_app_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | App project URL (sign-in, site list) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | App publishable key (OAuth / session in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | App **Secret key** — server only; saves site bookmarks to app DB after sign-in |
| `NEXT_PUBLIC_APP_URL` | OAuth redirects and embed snippet base URL |

`SUPABASE_SERVICE_ROLE_KEY` is **not** your analytics project key. It is only for the app Supabase in `.env`. Per-website Project ID + publishable key are entered in **Add website** (step 3).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → sign in → **Dashboard** → **Add website**.

**Step 3 — Your analytics Supabase (per website)**

For each site you track:

1. Create **your** Supabase project (you own the data).
2. Run [`supabase/schema-analytics.sql`](supabase/schema-analytics.sql) once on that project (copy blocks in Add website).
3. Enable **Realtime** on `events` if you use the live map.
4. In **Add website**, enter name, domain, **your Project ID**, and **your Publishable key** (dashboard reads only).
5. Deploy [`public/worker.js`](public/worker.js) to Cloudflare — see `/docs/worker` when the app is running.
6. Open **Setup** (`/app/[siteId]/setup`) and copy the `<script>` tag with `data-endpoint` set to your worker URL.

**Optional — one Supabase project**

Run both SQL files on the same project if you want: `projects` (app) + `events` (analytics). `site_key` is created in `projects` when you add a website.

**Production**

```bash
# Set NEXT_PUBLIC_APP_URL to your HTTPS origin first
npm run build
npm run start
```

OAuth redirect URLs must include `https://your-domain.com/auth/callback` (see `.env.example`).

---

## Part 2 — Tracking script (`public/tracker.js`)

[`public/tracker.js`](public/tracker.js) is a **single vanilla JavaScript file** (~770 lines, no build step). It runs in the visitor’s browser and POSTs analytics to your **Cloudflare Worker** (`data-endpoint`). The worker inserts into Supabase with the Secret key — the browser never writes to Supabase directly.

[`public/worker.js`](public/worker.js) is the reference ingest proxy: rate limiting, payload checks, and Supabase insert. See **Cloudflare Worker** docs at `/docs/worker`.

### What you need before embedding

| Requirement | Notes |
|-------------|--------|
| Supabase project | Run [`supabase/schema-analytics.sql`](supabase/schema-analytics.sql) — publishable key can **select** only |
| Cloudflare Worker | Deploy [`public/worker.js`](public/worker.js) with your Secret key |
| `site_key` | Generated when you **Add website** in the app (stored in `projects`) |
| Embed | `data-site-key` + `data-endpoint` (worker URL) on the script tag |
| Publishable key | Stored in the app for dashboard reads — not required in the embed for writes |

The dashboard **does not** receive event payloads; the browser POSTs to the worker, which writes to your Supabase project.

### How to load the script

**Option A — Serve from the dashboard app (recommended)**

Deploy Part 1 and point `src` at your origin:

```html
<script
  src="https://your-dashboard.com/tracker.js?v=1.0.2"
  data-site-key="YOUR_SITE_KEY"
  data-endpoint="https://your-worker.workers.dev"
></script>
```

Append `?v=1.0.2` to the script URL and bump the version when you redeploy `tracker.js` (see `TRACKER_SCRIPT_VERSION` in `src/lib/constants.ts`).

**Option B — Host `tracker.js` yourself**

Copy [`public/tracker.js`](public/tracker.js) to any static host (S3, Cloudflare, your site `/static/tracker.js`). Update only the `src` URL; `data-*` attributes stay the same.

```html
<script
  src="https://cdn.example.com/tracker.js?v=1.0.2"
  data-site-key="YOUR_SITE_KEY"
  data-endpoint="https://your-worker.workers.dev"
></script>
```

**Option C — Programmatic config**

Set options before loading the file:

```html
<script>
  window.OpenAnalytics = {
    siteKey: "YOUR_SITE_KEY",
    endpoint: "https://your-worker.workers.dev",
    domains: "example.com,www.example.com",
    doNotTrack: false,
    autoTrack: true,
  };
</script>
<script src="https://your-host/tracker.js?v=1.0.2"></script>
```

### Script attributes (`data-*`)

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-site-key` | **Yes** | `site_key` from the app (Add website → Setup) |
| `data-endpoint` | **Yes** | Cloudflare Worker URL — POST JSON (see [`public/worker.js`](public/worker.js)) |
| `data-domains` | No | Comma-separated hostnames to allow |
| `data-do-not-track="true"` | No | Skip tracking when DNT is on |
| `data-auto-track="false"` | No | No auto pageview; call `OpenAnalytics.trackPageview()` |

### JavaScript API (`window.OpenAnalytics`)

Available after the script loads:

```javascript
// Custom event (event_type = 10)
OpenAnalytics.track("signup", { plan: "pro" });

// Attach logged-in user id
OpenAnalytics.identify("user-123");

// Manual pageview (when data-auto-track="false")
OpenAnalytics.trackPageview();

// Read pseudonymous visitor id
OpenAnalytics.getVisitorId();
```

**Declarative click tracking**

```html
<button data-oa-event="signup" data-oa-event-plan="pro">Sign up</button>
```

Attributes `data-oa-event-*` become properties on the custom event payload.

### Behaviour (built-in)

- Pageview on load, page leave with `duration_ms` on hide / navigation
- **SPA support** — `pushState`, `replaceState`, `popstate`, `hashchange`
- UTM params, `gclid`, `fbclid`, `msclkid` from the URL
- New `visit_id` after **30 minutes** of inactivity
- **Bot filter** — skips common crawler User-Agents
- Visitor id — fingerprint + `localStorage` (`oa_visitor_id`)

### Manual setup (no dashboard UI)

1. Run `schema-analytics.sql` on your Supabase project (`events` only).
2. Choose any `site_key` string (e.g. 24 hex chars) and use it in `tracker.js` as `data-site-key`.
3. Events will insert with that `site_key`.

---

## How Part 1 and Part 2 work together

```text
1. Deploy dashboard + app Supabase in .env (sign-in + site list only)
2. Create YOUR Supabase per website + run schema-analytics.sql (select-only RLS)
3. Deploy public/worker.js to Cloudflare with Secret key
4. Sign in → Add website (your Project ID + publishable key for dashboard reads)
5. Paste tracker.js snippet with data-endpoint on your site
6. Events in YOUR Supabase → /app charts query your project with the stored key
```

You may skip step 1 and only run steps 2–4 if you only need collection and will query Supabase yourself.

---

## Metrics (dashboard)

| Metric | Definition |
|--------|------------|
| **Visitors** | Unique `visitor_id` |
| **Visits** | Unique `visit_id` (new visit after 30 min idle) |
| **Pageviews** | `event_type = 1` |
| **Bounce rate** | % visits with exactly one pageview |
| **Visit time** | Avg. duration on visits with ≥ 2 pageviews |

See [`src/lib/constants.ts`](src/lib/constants.ts) and [`public/tracker.js`](public/tracker.js) for enums (`event_type`, `device`, `browser`, …). Full definitions: `/docs/metrics` when the app is running.

---

## Documentation (in the dashboard app)

| Topic | Path |
|-------|------|
| Installation | `/docs/installation` |
| Supabase | `/docs/supabase` |
| **Cloudflare Worker** | `/docs/worker` |
| **Tracker** | `/docs/tracker` |
| Metrics | `/docs/metrics` |
| Dashboard UI | `/docs/dashboard` |
| Security | `/docs/security` |
| Auth | `/docs/auth` |

---

## Repository layout

```text
public/
  tracker.js              # Part 2 — browser tracker (copy or serve as-is)
  worker.js               # Part 3 — Cloudflare ingest proxy (Secret key)

src/
  app/                    # Part 1 — Next.js routes (/, /app, /docs, …)
  components/             # Dashboard & landing UI
  lib/                    # Supabase clients, analytics queries

supabase/
  schema-app.sql          # App project (.env): auth, projects (registered sites)
  schema-analytics.sql  # Your project: sites + events (tracker + charts)
  schema.sql            # Pointer to the two files above
```

---

## Security (production)

- **App Supabase** (`.env`) — publishable key is public by design for OAuth; never expose analytics **Secret** keys in HTML or `tracker.js`.
- **Your analytics publishable key** is stored in the app DB for dashboard reads. Event writes go through **Cloudflare Worker** (`data-endpoint`) with the Secret key.
- Default RLS allows **select** only for the publishable role — deploy [`worker.js`](public/worker.js) before going live.
- See `/docs/security` on a running instance.

---

## Scripts (dashboard only)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (serves `/tracker.js` too) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

`tracker.js` has **no npm script** — edit [`public/tracker.js`](public/tracker.js) and redeploy or recopy the file.

---

## Contributing

1. Fork the repo  
2. `git checkout -b feat/my-change`  
3. Commit and open a PR  

For tracker changes, test on a real page with a tracker Supabase project. For dashboard changes, run `npm run dev`.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute with attribution.
