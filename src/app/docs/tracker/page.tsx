import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsTrackerPage() {
  return (
    <DocsProse>
      <h1>Tracking script</h1>
      <DocsLead>
        Add <code>tracker.js</code> to every page you want to measure. Events are POSTed to
        your <a href="/docs/worker">Cloudflare Worker</a> (recommended) or another custom
        endpoint; the worker writes to Supabase with the Secret key.
      </DocsLead>

      <h2>Recommended embed (Worker proxy)</h2>
      <p>
        After adding a site in the dashboard, deploy{" "}
        <a href="/docs/worker">public/worker.js</a> to Cloudflare and use{" "}
        <code>data-endpoint</code> in the snippet from <strong>Tracking</strong> (
        <code>/app/[siteId]/setup</code>). Append{" "}
        <code>?v=1.0.1</code> to the script URL and bump the version whenever you
        redeploy <code>tracker.js</code> so browsers fetch the latest file.
      </p>
      <pre>{`<!-- Open Analytics -->
<script
  src="https://your-app.com/tracker.js?v=1.0.1"
  data-site-key="YOUR_SITE_KEY"
  data-endpoint="https://your-worker.workers.dev"
  data-geo-url="https://your-app.com/api/geo"
></script>`}</pre>

      <h2>Direct Supabase embed (legacy)</h2>
      <p>
        Older setups posted directly to Supabase with the publishable key. The default schema
        no longer allows anon inserts — use the worker flow above instead.
      </p>

      <h2>Script attributes</h2>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>data-site-key</code>
            </td>
            <td>Yes</td>
            <td>Site key from Add website / Setup (<code>projects.site_key</code> in the app DB)</td>
          </tr>
          <tr>
            <td>
              <code>data-endpoint</code>
            </td>
            <td>Yes*</td>
            <td>
              POST JSON to your Cloudflare Worker (recommended). See{" "}
              <a href="/docs/worker">Worker setup</a>.
            </td>
          </tr>
          <tr>
            <td>
              <code>data-supabase-url</code>
            </td>
            <td>No*</td>
            <td>Not needed when using <code>data-endpoint</code></td>
          </tr>
          <tr>
            <td>
              <code>data-supabase-key</code>
            </td>
            <td>No*</td>
            <td>
              Dashboard reads only; do not use for browser writes with default RLS
            </td>
          </tr>
          <tr>
            <td>
              <code>data-geo-url</code>
            </td>
            <td>No</td>
            <td>
              URL for geo lookup (recommended: your app&apos;s <code>/api/geo</code>)
            </td>
          </tr>
          <tr>
            <td>
              <code>data-domains</code>
            </td>
            <td>No</td>
            <td>
              Comma-separated hostnames; tracking only runs on these hosts (e.g.{" "}
              <code>example.com,www.example.com</code>)
            </td>
          </tr>
          <tr>
            <td>
              <code>data-do-not-track="true"</code>
            </td>
            <td>No</td>
            <td>Skip tracking when the browser sends Do Not Track</td>
          </tr>
          <tr>
            <td>
              <code>data-auto-track="false"</code>
            </td>
            <td>No</td>
            <td>
              Disable automatic first pageview; call{" "}
              <code>OpenAnalytics.trackPageview()</code> manually
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Global configuration</h2>
      <p>
        You can set options on <code>window.OpenAnalytics</code> before loading the script:
      </p>
      <pre>{`<script>
  window.OpenAnalytics = {
    siteKey: "…",
    supabaseUrl: "…",
    supabaseKey: "…",
    geoUrl: "…",
    domains: "example.com",
    doNotTrack: false,
    autoTrack: true
  };
</script>
<script src="https://your-app.com/tracker.js?v=1.0.1" …></script>`}</pre>

      <h2>JavaScript API</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>OpenAnalytics.track(name, props?)</code>
            </td>
            <td>
              Custom event (<code>event_type = 10</code>). <code>props</code> is stored as
              JSON in <code>source</code> (max 200 chars).
            </td>
          </tr>
          <tr>
            <td>
              <code>OpenAnalytics.identify(id)</code>
            </td>
            <td>
              Set <code>distinct_id</code> (logged-in user id). Pass{" "}
              <code>null</code> to clear.
            </td>
          </tr>
          <tr>
            <td>
              <code>OpenAnalytics.trackPageview()</code>
            </td>
            <td>Send a pageview manually (when <code>data-auto-track="false"</code>)</td>
          </tr>
          <tr>
            <td>
              <code>OpenAnalytics.getVisitorId()</code>
            </td>
            <td>Returns the fingerprint-based visitor id (also in localStorage)</td>
          </tr>
        </tbody>
      </table>

      <h3>Example: custom event</h3>
      <pre>{`OpenAnalytics.track("signup", { plan: "pro" });`}</pre>

      <h2>Declarative click tracking</h2>
      <p>Track clicks without writing JavaScript:</p>
      <pre>{`<button
  data-oa-event="signup"
  data-oa-event-plan="pro"
>
  Sign up
</button>`}</pre>
      <p>
        Extra attributes use the prefix <code>data-oa-event-</code>; hyphens in the name
        become underscores in the payload (e.g. <code>data-oa-event-plan</code> →{" "}
        <code>plan</code>).
      </p>

      <h2>Automatic behavior</h2>
      <ul>
        <li>
          <strong>Pageview</strong> on load (unless auto-track is off or tracking is
          disabled)
        </li>
        <li>
          <strong>Page leave</strong> with <code>duration_ms</code> on tab hide /{" "}
          <code>pagehide</code>
        </li>
        <li>
          <strong>SPA navigation</strong> — wraps <code>history.pushState</code> /{" "}
          <code>replaceState</code>, listens to <code>popstate</code> and{" "}
          <code>hashchange</code>
        </li>
        <li>
          <strong>UTM & click IDs</strong> — <code>utm_*</code>, <code>gclid</code>,{" "}
          <code>fbclid</code>, <code>msclkid</code> from the URL
        </li>
        <li>
          <strong>Visit</strong> — new <code>visit_id</code> after 30 minutes of inactivity
        </li>
        <li>
          <strong>Bot filter</strong> — skips tracking when User-Agent matches common
          crawlers/preview bots
        </li>
      </ul>

      <h2>Event payload (stored fields)</h2>
      <p>Each event includes identifiers and context:</p>
      <ul>
        <li>
          <code>visitor_id</code>, <code>session_id</code>, <code>visit_id</code>
        </li>
        <li>
          <code>path</code>, <code>page_title</code>, <code>hostname</code>,{" "}
          <code>url_query</code>, <code>referrer</code>, <code>source</code>
        </li>
        <li>
          <code>device</code>, <code>platform</code>, <code>browser</code> (numeric enums)
        </li>
        <li>
          <code>country_code</code>, <code>latitude</code>, <code>longitude</code> (if geo
          available)
        </li>
        <li>
          <code>language</code>, <code>screen</code>, <code>distinct_id</code>
        </li>
        <li>UTM and ad click id columns</li>
        <li>
          <code>event_name</code> for custom events; <code>duration_ms</code> for page leave
        </li>
      </ul>

      <h2>Encoded enums</h2>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Values</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>event_type</code>
            </td>
            <td>1 pageview, 2 page leave, 10 custom</td>
          </tr>
          <tr>
            <td>
              <code>device</code>
            </td>
            <td>0 unknown, 1 desktop, 2 mobile, 3 tablet, 4 TV</td>
          </tr>
          <tr>
            <td>
              <code>platform</code>
            </td>
            <td>
              0 unknown, 1 Windows, 2 macOS, 3 Linux, 4 iOS, 5 Android, 6 Chrome OS
            </td>
          </tr>
          <tr>
            <td>
              <code>browser</code>
            </td>
            <td>0 unknown, 1 Chrome, 2 Firefox, 3 Safari, 4 Edge, 5 Opera, 6 Samsung</td>
          </tr>
        </tbody>
      </table>

      <h2>Geo caching</h2>
      <p>
        Geo is not fetched on every event. Results are cached in{" "}
        <code>localStorage</code> (<code>oa_geo</code>) and refreshed when the network
        connection changes. Use <code>data-geo-url</code> pointing at your deployed{" "}
        <code>/api/geo</code> route.
      </p>
    </DocsProse>
  );
}
