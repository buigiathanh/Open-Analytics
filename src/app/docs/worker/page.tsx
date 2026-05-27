import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsWorkerPage() {
  return (
    <DocsProse>
      <h1>Cloudflare Worker (event ingest)</h1>
      <DocsLead>
        With the default <code>schema-analytics.sql</code>, the publishable key can only{" "}
        <strong>read</strong> events. Use a Cloudflare Worker as a lightweight proxy:{" "}
        <code>tracker.js</code> POSTs to the worker; the worker inserts into Supabase with
        your <strong>Secret key</strong> (never exposed in the browser).
      </DocsLead>

      <h2>Why a worker?</h2>
      <ul>
        <li>
          Hides the Supabase Secret key — only the worker stores it (Cloudflare secrets /
          env vars).
        </li>
        <li>
          Rate limiting by visitor IP at the edge (built into{" "}
          <code>public/worker.js</code>).
        </li>
        <li>
          Basic payload validation before writes (required fields, optional geo bounds).
        </li>
        <li>
          Publishable key stays in the dashboard for charts and Realtime; the embed uses{" "}
          <code>data-endpoint</code> instead of direct Supabase writes.
        </li>
      </ul>

      <h2>Architecture</h2>
      <pre>{`Browser (tracker.js)
  │  POST JSON
  ▼
Cloudflare Worker  ── Secret key ──►  Supabase events (insert)
  │
Dashboard / Realtime ── Publishable key ──►  Supabase events (select only)`}</pre>

      <h2>1. Run the analytics schema</h2>
      <p>
        On your tracking Supabase project, run{" "}
        <code>supabase/schema-analytics.sql</code>. RLS allows <code>select</code> for the
        publishable role only — no anon <code>insert</code>.
      </p>

      <h2>2. Copy the worker script</h2>
      <p>
        Use the file from this repository:{" "}
        <code>public/worker.js</code>. At the top, set:
      </p>
      <table>
        <thead>
          <tr>
            <th>Constant</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>SUPABASE_PROJECT_ID</code>
            </td>
            <td>
              Project ref from Supabase → Settings → General (e.g.{" "}
              <code>abcdefghijklmnop</code>)
            </td>
          </tr>
          <tr>
            <td>
              <code>SUPABASE_SECRET_KEY</code>
            </td>
            <td>
              <strong>Secret key</strong> (service role) from Settings → API — never put
              this in <code>tracker.js</code> or HTML
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Optional: adjust <code>RATE_LIMIT</code> (requests per IP) and{" "}
        <code>WINDOW</code> (milliseconds).
      </p>

      <h2>3. Deploy on Cloudflare</h2>
      <ol>
        <li>
          Log in to the{" "}
          <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer">
            Cloudflare dashboard
          </a>
          .
        </li>
        <li>
          <strong>Workers &amp; Pages</strong> → <strong>Create</strong> →{" "}
          <strong>Create Worker</strong>.
        </li>
        <li>
          Replace the default script with the contents of <code>public/worker.js</code>{" "}
          (with your project id and secret key filled in).
        </li>
        <li>
          <strong>Deploy</strong>. Note the worker URL, e.g.{" "}
          <code>https://open-analytics-ingest.your-subdomain.workers.dev</code>.
        </li>
      </ol>

      <h3>Wrangler CLI (optional)</h3>
      <pre>{`npm create cloudflare@latest open-analytics-worker
# Choose "Hello World" Worker, then replace src/index.js with public/worker.js

# Prefer secrets over hardcoding in the file:
npx wrangler secret put SUPABASE_SECRET_KEY

# Deploy
npx wrangler deploy`}</pre>
      <p>
        If you use Wrangler secrets, read <code>SUPABASE_SECRET_KEY</code> from{" "}
        <code>env.SUPABASE_SECRET_KEY</code> instead of a literal in the file.
      </p>

      <h2>4. Point tracker.js at the worker</h2>
      <p>
        In your embed snippet, set <code>data-endpoint</code> to the worker URL. You do{" "}
        <strong>not</strong> need <code>data-supabase-url</code> or{" "}
        <code>data-supabase-key</code> for sending events (only for direct Supabase mode,
        which this schema disables for anon).
      </p>
      <pre>{`<!-- Open Analytics -->
<script
  src="https://your-app.com/tracker.js?v=1.0.1"
  data-site-key="YOUR_SITE_KEY"
  data-endpoint="https://your-worker.workers.dev"
  data-geo-url="https://your-app.com/api/geo"
></script>`}</pre>
      <p>
        Use <code>?v=1.0.1</code> (or a newer version) on <code>tracker.js</code> to bust CDN /
        browser cache after each deploy.
      </p>
      <p>
        Programmatic config: set <code>endpoint: "https://…"</code> on{" "}
        <code>window.OpenAnalytics</code> before loading the script.
      </p>

      <h2>5. Dashboard still uses the publishable key</h2>
      <p>
        In <strong>Add website</strong>, enter your Supabase Project URL and{" "}
        <strong>Publishable key</strong> as before. The dashboard and Realtime map read{" "}
        <code>events</code> with that key; only ingest goes through the worker.
      </p>

      <h2>Testing</h2>
      <ol>
        <li>Deploy the worker and open your site with the updated snippet.</li>
        <li>
          In Supabase → Table Editor → <code>events</code>, confirm new rows appear.
        </li>
        <li>
          If inserts fail, check Worker → Logs. Common issues: wrong project id, secret
          key not set, or rate limit (429).
        </li>
      </ol>

      <h2>Production notes</h2>
      <ul>
        <li>
          Restrict CORS in the worker if you only serve one origin (replace{" "}
          <code>Access-Control-Allow-Origin: *</code>).
        </li>
        <li>
          Optionally validate <code>site_key</code> against an allowlist in the worker.
        </li>
        <li>Rotate the Secret key in Supabase if it was ever committed to git.</li>
        <li>
          See also <a href="/docs/security">Security</a> and{" "}
          <a href="/docs/tracker">Tracking script</a>.
        </li>
      </ul>
    </DocsProse>
  );
}
