import type { Metadata } from "next";
import Link from "next/link";

import { LegalLead } from "@/components/legal/LegalProse";
import { LegalPageShell } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service — Open Analytics",
  description:
    "Terms governing use of the Open Analytics website, dashboard, tracker, and related software.",
};

const LAST_UPDATED = "May 25, 2026";

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      description={
        <LegalLead>
          These terms govern your access to and use of Open Analytics, including the website,
          dashboard, documentation, APIs, and open-source software we provide.
        </LegalLead>
      }
    >
      <h2>1. Agreement</h2>
      <p>
        By accessing or using the Service, you agree to these Terms. If you use the Service on
        behalf of an organization, you represent that you have authority to bind that
        organization. If you do not agree, do not use the Service.
      </p>

      <h2>2. The Service</h2>
      <p>
        Open Analytics provides privacy-oriented, open-source web analytics tools. The Service may
        include a hosted or self-deployed dashboard, a JavaScript tracker, documentation, and
        optional APIs (such as geo lookup). Features may change; we may add, modify, or discontinue
        functionality with reasonable notice where practical.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You may need an account to use certain features. You are responsible for safeguarding your
        credentials and for all activity under your account. Notify us promptly if you suspect
        unauthorized access. We may suspend or terminate accounts that violate these Terms or pose
        a security risk.
      </p>

      <h2>4. Your websites and data</h2>
      <p>
        You control the websites you add and the Supabase projects that store their analytics. You
        represent that you have the right to collect and process data from visitors to those sites
        and that your use of the tracker complies with applicable privacy laws and your own
        policies. You are responsible for configuring RLS, keys, retention, and backups in your
        Supabase projects.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for unlawful, fraudulent, or harmful purposes</li>
        <li>Attempt to gain unauthorized access to systems, accounts, or data</li>
        <li>Interfere with or disrupt the Service (including excessive automated requests)</li>
        <li>Upload malware or probe vulnerabilities except as permitted by a written security program</li>
        <li>Collect or process special categories of personal data without a lawful basis and safeguards</li>
        <li>Misrepresent affiliation with Open Analytics or impersonate others</li>
      </ul>

      <h2>6. Open-source software</h2>
      <p>
        Components of Open Analytics are offered under open-source licenses (such as MIT) as
        stated in the repository. Your use of source code is also governed by those licenses. These
        Terms apply to the hosted Service and our websites; license terms govern redistribution of
        the code itself.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        The Service integrates with third parties you choose, including Supabase, OAuth providers,
        and your own domains. We are not responsible for third-party terms, outages, or data
        practices. Your relationship with those providers is separate from these Terms.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        We retain rights in the Service branding, documentation, and non-open portions of the
        offering. You retain rights in your content and analytics data. You grant us a limited
        license to host and process your data solely to operate the Service for you.
      </p>

      <h2>9. Disclaimer</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
        ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
        UNINTERRUPTED, ERROR-FREE, OR SECURE.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR CONTRIBUTORS WILL NOT BE LIABLE FOR ANY
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS,
        DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY FOR ANY CLAIM
        RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) AMOUNTS YOU PAID US FOR THE
        SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (US$100), IF
        YOU USE A FREE OR SELF-HOSTED OFFERING.
      </p>
      <p>
        Some jurisdictions do not allow certain limitations; in those cases, our liability is limited
        to the fullest extent permitted by law.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        You will defend and indemnify us against claims arising from your websites, your analytics
        data, your violation of these Terms, or your violation of applicable law, except to the
        extent caused by our gross negligence or willful misconduct.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access if you breach
        these Terms or if continued operation poses risk. Upon termination, your right to use the
        hosted Service ends; data in your Supabase projects remains under your control subject to
        your configuration.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws applicable to the operator of the instance you use,
        without regard to conflict-of-law rules. Courts in that jurisdiction will have exclusive
        venue for disputes, unless mandatory consumer protection rules in your country require
        otherwise.
      </p>

      <h2>14. Changes</h2>
      <p>
        We may update these Terms. Material changes will be posted on this page with an updated
        date. Continued use after changes become effective constitutes acceptance of the revised
        Terms.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms: open an issue in the project repository or contact the operator
        of the instance you use.
      </p>
      <p>
        See also our <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </LegalPageShell>
  );
}
