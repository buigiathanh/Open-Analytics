import Link from "next/link";
import { Logo } from "@/components/Logo";
import { APP_CONTAINER_CLASS } from "@/lib/layout";
import { HeaderActions } from "@/components/HeaderActions";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header({
  containerClass = APP_CONTAINER_CLASS,
}: {
  containerClass?: string;
}) {
  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div
        className={`${containerClass} flex h-14 items-center justify-between`}
      >
        <Logo size="md" />
        <nav className="flex items-center gap-3 sm:gap-5 text-sm text-zinc-600 dark:text-zinc-300">
          <Link
            href="/docs"
            className="hidden sm:inline hover:text-zinc-900 dark:hover:text-white"
          >
            Docs
          </Link>
          <Link
            href="/#features"
            className="hidden md:inline hover:text-zinc-900 dark:hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="hidden md:inline hover:text-zinc-900 dark:hover:text-white"
          >
            How it works
          </Link>
          <ThemeToggle />
          <HeaderActions />
        </nav>
      </div>
    </header>
  );
}
