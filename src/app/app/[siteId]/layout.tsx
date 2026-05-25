import { Header } from "@/components/Header";
import { STATS_CONTAINER_CLASS } from "@/lib/layout";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header containerClass={STATS_CONTAINER_CLASS} />
      {children}
    </>
  );
}
