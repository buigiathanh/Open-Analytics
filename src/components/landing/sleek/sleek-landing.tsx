import { SleekHero } from "@/components/landing/sleek/sleek-hero";
import { SleekNavbar } from "@/components/landing/sleek/sleek-navbar";
import { SleekBlockStack } from "@/components/landing/sleek/sleek-shared";
import {
  SleekDemo,
  SleekQuote,
  SleekWhy,
} from "@/components/landing/sleek/sleek-sections-2";
import {
  SleekFeatures,
  SleekHowItWorks,
} from "@/components/landing/sleek/sleek-sections-1";
import {
  SleekComparison,
  SleekPricing,
} from "@/components/landing/sleek/sleek-sections-3";
import {
  SleekFAQ,
  SleekFinalCTA,
  SleekFooter,
} from "@/components/landing/sleek/sleek-sections-4";

export function SleekLanding() {
  return (
    <>
      <SleekNavbar />
      <main className="bg-zinc-100/90 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl border-x border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <SleekBlockStack>
            <SleekHero embedded />
            <SleekWhy embedded />
            <SleekHowItWorks embedded />
            <SleekQuote embedded />
            <SleekFeatures embedded />
            <SleekDemo embedded />
            <SleekComparison embedded />
            <SleekPricing embedded />
            <SleekFAQ embedded />
            <SleekFinalCTA embedded />
            <SleekFooter embedded />
          </SleekBlockStack>
        </div>
      </main>
    </>
  );
}
