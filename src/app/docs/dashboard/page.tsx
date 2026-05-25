import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsDashboardPage() {
  return (
    <DocsProse>
      <h1>Dashboard</h1>
      <DocsLead>
        The dashboard at <code>/app</code> lists your websites and links to statistics,
        realtime, and tracking setup for each site.
      </DocsLead>

      <h2>Website list (<code>/app</code>)</h2>
      <ul>
        <li>
          <strong>Add website</strong> — opens a modal: create a Supabase project, run{" "}
          <code>schema-analytics.sql</code> on your project, enable Realtime on <code>events</code>, then enter name,
          domain, your Supabase project ID, and publishable key.
        </li>
        <li>
          Click a site card to open its <strong>statistics overview</strong>.
        </li>
        <li>
          If app Supabase env vars are missing, adding sites is disabled and a setup banner is
          shown.
        </li>
      </ul>

      <h2>Site navigation</h2>
      <p>Each site has three tabs:</p>
      <table>
        <thead>
          <tr>
            <th>Tab</th>
            <th>Path</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Statistics</td>
            <td>
              <code>/app/[siteId]</code>
            </td>
            <td>
              Metric bar, trend chart, breakdown grids (channels, pages, geo, device, etc.),
              7/30-day selector
            </td>
          </tr>
          <tr>
            <td>Realtime</td>
            <td>
              <code>/app/[siteId]/realtime</code>
            </td>
            <td>
              Full-screen 3D globe (COBE), live visitors, countries/pages/devices in the
              last 5 minutes
            </td>
          </tr>
          <tr>
            <td>Tracking</td>
            <td>
              <code>/app/[siteId]/setup</code>
            </td>
            <td>Copy embed snippet with site key and Supabase credentials</td>
          </tr>
        </tbody>
      </table>

      <h2>Statistics overview</h2>
      <ul>
        <li>
          Top row: <strong>Visitors</strong>, <strong>Visits</strong>,{" "}
          <strong>Pageviews</strong>, <strong>Bounce rate</strong>,{" "}
          <strong>Visit time</strong> with period-over-period change when available.
        </li>
        <li>Trend chart: daily pageviews over the selected range.</li>
        <li>
          Four breakdown blocks in a 2×2 grid (channel/referrer, content pages, country
          donut, browser/device/OS).
        </li>
        <li>
          A floating <strong>Live</strong> pill links to the realtime view when the site is
          configured.
        </li>
      </ul>

      <h2>Realtime view</h2>
      <ul>
        <li>Rotating globe with markers at visitor latitude/longitude (when geo is present).</li>
        <li>Click a marker to see path, country, and device.</li>
        <li>Pause/play auto-rotation; zoom with scroll on desktop.</li>
        <li>Overlay panels: active count, top countries, pages, devices, recent pageviews.</li>
      </ul>
      <p>
        Realtime requires Realtime enabled on <code>events</code> in the site Supabase
        project and geo data for map placement (optional but recommended).
      </p>

      <h2>Theme</h2>
      <p>
        Use the sun/moon control in the header to toggle light/dark mode. Globe and realtime
        backgrounds adapt to the theme.
      </p>
    </DocsProse>
  );
}
