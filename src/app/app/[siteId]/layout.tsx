import { Header } from "@/components/Header";
import { SiteDetailLayout } from "@/components/dashboard/SiteDetailLayout";
import { APP_CONTAINER_CLASS } from "@/lib/layout";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}

export default async function SiteLayout({ children, params }: LayoutProps) {
  const { siteId } = await params;

  return (
    <>
      <Header containerClass={APP_CONTAINER_CLASS} />
      <SiteDetailLayout siteId={siteId}>{children}</SiteDetailLayout>
    </>
  );
}
