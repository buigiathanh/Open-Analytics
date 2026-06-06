"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { GetStartedButton } from "@/components/auth/GetStartedButton";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Features", href: "/new#features" },
  { label: "How it works", href: "/new#how-it-works" },
  { label: "Compare", href: "/new#comparison" },
  { label: "FAQ", href: "/new#faq" },
  { label: "Docs", href: "/docs" },
];

export function SleekNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-background/70 backdrop-blur-xl dark:border-zinc-800/60">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="lg" href="/new" />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <GetStartedButton
            showArrow
            size="sm"
            className="rounded-full px-5"
            trackEvent="click_start_menu"
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-zinc-200 bg-background md:hidden dark:border-zinc-800",
          open ? "max-h-[28rem]" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3" onClick={() => setOpen(false)}>
            <GetStartedButton
              showArrow
              size="sm"
              className="w-full rounded-full"
              trackEvent="click_start_menu"
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
