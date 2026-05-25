import Link from "next/link";
import { DocsLead, DocsProse } from "@/components/docs/DocsProse";
import { DOCS_NAV } from "@/lib/docs-nav";

export default function DocsIntroductionPage() {
  return (
    <DocsProse>
      <h1>Introduction</h1>
      <DocsLead>
        Open Analytics is an open-source web analytics stack: a Next.js dashboard,
        a lightweight <code>tracker.js</code>, and Supabase for storage and realtime.
        Events are sent directly from the browser — no dedicated ingest server required.
      </DocsLead>

      <h2>What you get</h2>
      <ul>
        <li>
          <strong>Landing page</strong> — product overview at <code>/</code>
        </li>
        <li>
          <strong>Dashboard</strong> — manage websites, view stats, copy embed code at{" "}
          <code>/app</code>
        </li>
        <li>
          <strong>Per-site analytics</strong> — visitors, visits, pageviews, bounce rate,
          visit time, breakdowns (channels, pages, geo, device, browser, UTM)
        </li>
        <li>
          <strong>Realtime</strong> — 3D globe and live visitor list at{" "}
          <code>/app/[siteId]/realtime</code>
        </li>
        <li>
          <strong>Tracker</strong> — pageviews, page leave, custom events, SPA navigation,
          UTM capture, bot filtering
        </li>
      </ul>

      <h2>Architecture</h2>
      <p>
        Open Analytics uses <strong>two Supabase roles</strong>:
      </p>
      <ol>
        <li>
          <strong>Registry project</strong> (configured in <code>.env.local</code>) — stores
          the list of websites, each site&apos;s <code>site_key</code>, and credentials to
          that site&apos;s data project.
        </li>
        <li>
          <strong>Per-website project</strong> — one Supabase project per tracked site.
          Run <code>supabase/schema-analytics.sql</code> on your project; all <code>events</code> for that site
          live in this database.
        </li>
      </ol>
      <blockquote>
        When you add a website in the dashboard, the app verifies it can read{" "}
        <code>events</code> on your project and saves a row in app <code>projects</code> with your
        Supabase URL, publishable key, and an auto-generated <code>site_key</code> for the tracker.
      </blockquote>

      <h2>Data flow</h2>
      <ol>
        <li>Visitor loads a page with <code>tracker.js</code>.</li>
        <li>
          Tracker builds a fingerprint-based <code>visitor_id</code>, session/visit IDs,
          parses device/browser/UTM, optionally fetches geo (cached).
        </li>
        <li>
          Events are inserted into the site&apos;s Supabase <code>events</code> table (or
          POSTed to a custom <code>data-endpoint</code>).
        </li>
        <li>
          The dashboard reads events from the site project and aggregates metrics in the
          Next.js app. Realtime uses Supabase Realtime on <code>events</code>.
        </li>
      </ol>

      <h2>Documentation sections</h2>
      <ul>
        {DOCS_NAV.filter((n) => n.href !== "/docs").map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.title}</Link>
            {item.description ? ` — ${item.description}` : null}
          </li>
        ))}
      </ul>

      <h2>Quick start</h2>
      <ol>
        <li>
          Follow <Link href="/docs/installation">Installation</Link> to run the dashboard.
        </li>
        <li>
          Complete <Link href="/docs/supabase">Supabase setup</Link> (<code>schema-app.sql</code> +{" "}
          <code>schema-analytics.sql</code>)
          projects.
        </li>
        <li>
          Add a website in the dashboard and paste the snippet from{" "}
          <Link href="/docs/tracker">Tracking script</Link>.
        </li>
        <li>
          Open <Link href="/docs/metrics">Metrics</Link> to understand reported numbers.
        </li>
      </ol>
    </DocsProse>
  );
}
