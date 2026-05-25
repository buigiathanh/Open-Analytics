import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsMetricsPage() {
  return (
    <DocsProse>
      <h1>Metrics</h1>
      <DocsLead>
        Dashboard numbers are computed in the Next.js app from raw <code>events</code> in
        each site&apos;s Supabase project. Definitions align with common product analytics
        (similar to Umami visit-based bounce).
      </DocsLead>

      <h2>Summary cards</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Definition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Visitors</strong>
            </td>
            <td>
              Count of unique <code>visitor_id</code> values in the selected period.
              Visitor id comes from a browser fingerprint stored in <code>localStorage</code>.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Visits</strong>
            </td>
            <td>
              Count of unique <code>visit_id</code> values. A new visit starts after{" "}
              <strong>30 minutes</strong> without activity (tracker-side).
            </td>
          </tr>
          <tr>
            <td>
              <strong>Pageviews</strong>
            </td>
            <td>
              Number of events where <code>event_type = 1</code> (pageview).
            </td>
          </tr>
          <tr>
            <td>
              <strong>Bounce rate</strong>
            </td>
            <td>
              Percentage of <strong>visits</strong> that contain exactly{" "}
              <strong>one pageview</strong>. Formula:{" "}
              <code>(bounced visits / total visits) × 100</code>.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Visit time</strong>
            </td>
            <td>
              Average time on site for visits with <strong>at least two pageviews</strong>.
              Computed from timestamps between first and last pageview in each visit.
              Single-page visits are excluded from this average.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Date range</h2>
      <p>
        The site overview supports <strong>7</strong> or <strong>30</strong> days via the
        period selector (<code>?days=7</code> or <code>?days=30</code> on the URL).
      </p>

      <h2>Breakdown panels</h2>
      <ul>
        <li>
          <strong>Channel</strong> — grouped traffic source (direct, organic, social, etc.)
          from referrer and UTM
        </li>
        <li>
          <strong>Referrer</strong> — referring host
        </li>
        <li>
          <strong>UTM</strong> — campaign dimensions when present
        </li>
        <li>
          <strong>Pages</strong> — top paths by pageviews
        </li>
        <li>
          <strong>Entry / Exit pages</strong> — first and last page per visit
        </li>
        <li>
          <strong>Country</strong> — donut chart from <code>country_code</code>
        </li>
        <li>
          <strong>Browser, device, OS</strong> — from tracker enums
        </li>
      </ul>

      <h2>Realtime (last 5 minutes)</h2>
      <p>
        The realtime view shows active visitors from recent events and Supabase Realtime
        subscriptions. Metrics like &quot;last 5 min&quot; pageviews are a rolling window,
        not the same as the 7/30-day overview.
      </p>

      <h2>What is not filtered today</h2>
      <ul>
        <li>
          <strong>Server-side bot exclusion</strong> — bots are blocked in the tracker by
          User-Agent, but events inserted directly into the database are not filtered when
          aggregating stats.
        </li>
        <li>
          <strong>Logged-in users</strong> — use <code>OpenAnalytics.identify()</code> for{" "}
          <code>distinct_id</code>; visitor counts still use <code>visitor_id</code>.
        </li>
      </ul>
    </DocsProse>
  );
}
