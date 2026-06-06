"use client";

import dynamic from "next/dynamic";

import { HERO_DEMO_VISITORS } from "@/lib/hero-demo-visitors";

const VisitorGlobe = dynamic(
  () => import("@/components/dashboard/VisitorGlobe").then((m) => m.VisitorGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] w-full items-center justify-center">
        <div className="size-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    ),
  }
);

export function SleekHeroGlobe() {
  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden sm:min-h-[380px]">
      <VisitorGlobe
        visitors={HERO_DEMO_VISITORS}
        variant="immersive"
        hidePlaybackControl
      />
    </div>
  );
}
