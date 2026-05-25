import Link from "next/link";

import { Logo } from "@/components/Logo";
import { GITHUB_REPO_URL } from "@/lib/github";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-200 py-10 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo size="sm" link={false} />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground">
              Docs
            </Link>
            <Link href="/#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="/#faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </Link>
            <Link href="/app" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Open Analytics — MIT · Next.js + Supabase
        </p>
      </div>
    </footer>
  );
}
