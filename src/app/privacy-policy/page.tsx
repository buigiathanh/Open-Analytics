import type { Metadata } from "next";
import Link from "next/link";

import { LegalLead } from "@/components/legal/LegalProse";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Open Analytics",
  description:
    "Two data roles: platform management for site owners, and analytics we collect on visitors to our own website.",
};

const LAST_UPDATED = "May 25, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      description={
        <LegalLead>
          Open Analytics involves <strong>two different relationships</strong> with data.
          Depending on how you use the service, different sections below apply to you.
        </LegalLead>
      }
    >
      <h2>Two roles at a glance</h2>
      <table>
        <thead>
          <tr>
            <th>Who you are</th>
            <th>What happens</th>
            <th>Who stores analytics events</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Role A — Platform user</strong>
              <br />
              <span className="text-muted-foreground">
                You sign in and create / manage website projects
              </span>
            </td>
            <td>
              We run the dashboard and site registry. Your visitors&apos; tracking data goes to{" "}
              <strong>your</strong> Supabase project.
            </td>
            <td>
              <strong>You</strong> (your Supabase). We do not store your sites&apos; event data on
              Platform servers.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Role B — Visitor to our website</strong>
              <br />
              <span className="text-muted-foreground">
                You browse our website (landing, docs, legal pages, etc.)
              </span>
            </td>
            <td>
              We may use our own <code>tracker.js</code> to measure traffic on <strong>our</strong>{" "}
              pages for product and security purposes.
            </td>
            <td>
              <strong>We</strong> (in Supabase we operate for the Platform site), as described in
              Role B below.
            </td>
          </tr>
        </tbody>
      </table>

      <hr />

      <h2>Role A — You use Open Analytics to manage your websites</h2>
      <p>
        This section applies if you have an account and add sites in the dashboard. You are a{" "}
        <strong>customer of the management platform</strong>.
      </p>

      <h3>What we store (management only)</h3>
      <p>We process and store only what is needed to operate the Platform for you:</p>
      <ul>
        <li>
          <strong>Account:</strong> Supabase user id, session, and OAuth profile fields (name, email,
          avatar; GitHub public metadata if you use GitHub sign-in)
        </li>
        <li>
          <strong>Site registry:</strong> site name, domain, site key, and Supabase connection
          details you provide (project URL, anon key, project id) so we can list sites and open your
          dashboard
        </li>
        <li>
          <strong>Operational logs:</strong> IP, timestamp, and user agent in hosting/CDN logs for
          security and reliability (not used as your website&apos;s analytics product)
        </li>
      </ul>

      <h3>Your tracking data — in your Supabase, not ours</h3>
      <p>
        When you embed <code>tracker.js</code> on <strong>your</strong> properties, events are sent{" "}
        <strong>directly</strong> from your visitors&apos; browsers to the Supabase project{" "}
        <strong>you</strong> configure (or another endpoint you choose). Open Analytics does not
        receive, copy, or retain those events on our application servers.
      </p>
      <p>
        The dashboard reads from your project to show metrics; that is display access only. We do
        not treat your <code>events</code> table as data we own.
      </p>
      <p>Typical fields your tracker may write (in your database) include:</p>
      <ul>
        <li>Page URL, path, query, hostname, title, referrer</li>
        <li>
          Pseudonymous <code>visitor_id</code> and <code>visit_id</code> (fingerprint +{" "}
          <code>localStorage</code>)
        </li>
        <li>Device, browser, OS, screen, language</li>
        <li>UTM and ad click parameters</li>
        <li>Optional geo and <code>distinct_id</code> from <code>identify()</code></li>
      </ul>
      <p>
        <strong>Your responsibilities:</strong> privacy notice on your sites, lawful basis,
        retention, and visitor rights for that data. This policy does not replace yours.
      </p>

      <h3>Optional: our <code>/api/geo</code> for your tracker</h3>
      <p>
        If you set <code>data-geo-url</code> to our <code>/api/geo</code>, we may forward your
        visitor&apos;s IP to third-party geo providers and return approximate location. We do not add
        that to our Role B analytics dataset; it is a pass-through for your tracker. You may host
        your own geo endpoint instead.
      </p>

      <hr />

      <h2>Role B — You visit the Open Analytics website</h2>
      <p>
        This section applies when you browse <strong>our</strong> marketing site, documentation,
        legal pages, or other pages we operate (collectively, the &quot;Platform website&quot;), without
        necessarily having a dashboard account.
      </p>
      <p>
        We are the <strong>data controller</strong> for analytics on these pages. We may run the same
        open-source tracker on our own site to understand usage, improve the product, and detect
        abuse.
      </p>

      <h3>What we collect on the Platform website</h3>
      <p>Depending on configuration, we may record:</p>
      <ul>
        <li>Pages viewed, time on page, and navigation paths</li>
        <li>Referrer and UTM parameters</li>
        <li>
          A pseudonymous visitor identifier (browser signals + <code>localStorage</code> on our
          domain)
        </li>
        <li>Browser, device, operating system, screen size, and language</li>
        <li>Approximate country or coordinates if geo is enabled</li>
        <li>Hostname and page URL on our domain</li>
      </ul>
      <p>
        We do not intentionally collect passwords or payment data through the tracker. Do not submit
        sensitive personal data in forms on public pages.
      </p>

      <h3>Where we store it and why</h3>
      <p>
        Platform-website analytics are stored in <strong>our</strong> Supabase project (separate from
        the registry database and separate from each customer&apos;s tracker projects). We use this
        data to:
      </p>
      <ul>
        <li>Measure traffic and feature interest on our site</li>
        <li>Improve content, UX, and documentation</li>
        <li>Maintain security and investigate abuse</li>
      </ul>
      <p>We do not sell this analytics data.</p>

      <h3>Cookies and local storage (Platform website)</h3>
      <ul>
        <li>
          <strong>Authentication:</strong> session cookies if you sign in to the dashboard
        </li>
        <li>
          <strong>Analytics:</strong> <code>localStorage</code> on our domain (for example visitor id,
          cached geo) when the tracker is active
        </li>
      </ul>
      <p>
        Where required by law, we rely on consent or legitimate interest for non-essential analytics.
        You may use browser controls or Do Not Track if we enable{" "}
        <code>data-do-not-track</code> on our snippet.
      </p>

      <h3>Your rights (Platform website visitor)</h3>
      <p>
        Depending on your location, you may request access, correction, deletion, or restriction of
        personal data we hold about your visit. Contact us using the details below. We will
        respond within applicable legal timeframes.
      </p>

      <hr />

      <h2>Shared topics</h2>

      <h3>How we use Role A management data</h3>
      <ul>
        <li>Authenticate you and operate the dashboard</li>
        <li>Store site registry entries and verify Supabase credentials</li>
        <li>Provide documentation and support</li>
        <li>Secure and improve the Platform</li>
        <li>Enforce our <Link href="/terms">Terms of Service</Link></li>
      </ul>

      <h3>Retention</h3>
      <ul>
        <li>
          <strong>Role A — registry &amp; account:</strong> while your account and sites exist, then as
          needed for legal or operational purposes
        </li>
        <li>
          <strong>Role A — your sites&apos; events:</strong> you control retention in your Supabase
          projects
        </li>
        <li>
          <strong>Role B — Platform website analytics:</strong> kept for as long as needed for the
          purposes above, then deleted or aggregated according to our internal schedule
        </li>
      </ul>

      <h3>Sharing</h3>
      <p>We may share information with:</p>
      <ul>
        <li>
          Infrastructure providers (Supabase, OAuth providers, hosting, geo providers when used)
        </li>
        <li>Authorities when required by law</li>
        <li>Successors in a merger or acquisition, with notice where required</li>
      </ul>
      <p>
        We do not sell Role A registry data. We do not sell Role B analytics data. We do not receive
        Role A customers&apos; event streams on our servers.
      </p>

      <h3>Legal bases (EEA/UK)</h3>
      <ul>
        <li>
          <strong>Role A (management):</strong> contract and legitimate interests to provide the
          service
        </li>
        <li>
          <strong>Role B (our website analytics):</strong> legitimate interests (product improvement,
          security) and consent where required
        </li>
        <li>
          <strong>Your websites (Role A customers):</strong> you determine the lawful basis for your
          visitors
        </li>
      </ul>

      <h3>International transfers</h3>
      <p>
        Data may be processed in regions where our or your Supabase projects and hosting providers
        operate. Use appropriate safeguards required in your jurisdiction.
      </p>

      <h3>Children</h3>
      <p>
        The Platform is not directed at children under 16. We do not knowingly collect personal
        information from children.
      </p>

      <h3>Changes</h3>
      <p>
        We may update this policy. The revised version will be posted here with an updated date.
      </p>

      <h2>Contact</h2>
      <p>
        Role A (account / registry): contact the operator of the instance you use or open an issue
        in the repository.
      </p>
      <p>
        Role B (visits to our website): same contact — specify that your request relates to Platform
        website analytics.
      </p>
      <p>
        <Link href="/terms">Terms of Service</Link> ·{" "}
        <Link href="/docs/security">Security documentation</Link>
      </p>
    </LegalPageShell>
  );
}
