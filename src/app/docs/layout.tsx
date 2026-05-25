import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Documentation — Open Analytics",
  description:
    "Setup guide, tracking script reference, metrics, and dashboard documentation for Open Analytics.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsShell>{children}</DocsShell>;
}
