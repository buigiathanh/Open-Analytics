import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsTrackerBoundary } from "@/components/AnalyticsTrackerBoundary";
import { AuthProviderBoundary } from "@/components/auth/AuthProviderBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Analytics — Privacy-friendly web analytics",
  description:
    "Open-source website analytics with Supabase. Track page views, visitors, and realtime activity.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProviderBoundary>{children}</AuthProviderBoundary>
          <AnalyticsTrackerBoundary />
        </ThemeProvider>
      </body>
    </html>
  );
}
