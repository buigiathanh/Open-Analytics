import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { LandingComparison } from "@/components/landing/landing-comparison";
import { GithubActivity } from "@/components/landing/github-activity";
import { LandingFAQ } from "@/components/landing/landing-faq";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFinalCTA } from "@/components/landing/landing-final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { WhyOpenAnalytics } from "@/components/landing/why-open-analytics";

export default function HomePage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <LandingHero />
        <WhyOpenAnalytics />
        <DashboardPreview />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingComparison />
        <LandingFAQ />
        <GithubActivity />
        <LandingFinalCTA />
      </main>
      <LandingFooter />
    </>
  );
}
