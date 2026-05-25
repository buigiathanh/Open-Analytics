import { DEMO_SHARE_REALTIME_URL } from "@/lib/constants";
import { GridMarkers, OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingEyebrow } from "@/components/landing/landing-typography";

export function DashboardPreview() {
  return (
    <section id="demo" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative border border-zinc-200 dark:border-zinc-800">
          <OuterCornerMarkers />

          <div className="border-b border-zinc-200 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-zinc-800">
            <p className={landingEyebrow}>Live demo</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
              Realtime dashboard — same view you can share
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              Live visitors on a 3D globe, country breakdown, and a rolling
              chart. This embed uses a public share link — no sign-in for viewers.
            </p>
          </div>

          <div className="relative p-4 sm:p-6">
            <GridMarkers columns={1} rows={1} />
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50">
              <iframe
                src={DEMO_SHARE_REALTIME_URL}
                title="Open Analytics live realtime demo"
                className="block h-[min(72vh,560px)] w-full border-0 bg-zinc-100 sm:h-[520px]"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
