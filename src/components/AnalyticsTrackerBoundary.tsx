"use client";

import { Suspense } from "react";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export function AnalyticsTrackerBoundary() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  );
}
