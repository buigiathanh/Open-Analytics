import type { Metadata } from "next";

import { SleekLanding } from "@/components/landing/sleek/sleek-landing";

export const metadata: Metadata = {
  title: "Open Analytics — New landing preview",
  description:
    "Sleek-inspired landing preview for Open Analytics. Privacy-friendly, self-hosted web analytics on PostgreSQL.",
};

export default function NewLandingPage() {
  return <SleekLanding />;
}
