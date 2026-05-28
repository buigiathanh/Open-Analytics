import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteSettingsIndexPage({ params }: PageProps) {
  const { siteId } = await params;
  redirect(`/app/${siteId}/settings/general`);
}
