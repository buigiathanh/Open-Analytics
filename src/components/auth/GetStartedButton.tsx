"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

type GetStartedButtonProps = {
  className?: string;
  showArrow?: boolean;
  size?: "sm" | "md";
  /** Fires OpenAnalytics custom event via data-oa-event on click. */
  trackEvent?: string;
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
};

const accentClass = "bg-emerald-600 text-white hover:bg-emerald-500";

function resolveButtonClass(baseClass: string, className?: string) {
  if (!className) return cn(baseClass, accentClass);
  if (/\bbg-|\btext-/.test(className)) {
    return cn(baseClass, className);
  }
  return cn(baseClass, accentClass, className);
}

export function GetStartedButton({
  className,
  showArrow = false,
  size = "md",
  trackEvent,
}: GetStartedButtonProps) {
  const { user, loading, openLogin } = useAuth();

  const baseClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
    sizeClasses[size]
  );

  const resolvedClass = resolveButtonClass(baseClass, className);

  if (loading) {
    return (
      <span
        className={cn(resolvedClass, "cursor-wait opacity-70")}
        aria-busy="true"
      >
        …
      </span>
    );
  }

  if (user) {
    return (
      <Link href="/app" className={resolvedClass}>
        Dashboard
        {showArrow ? <ArrowRight className="size-4" /> : null}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={openLogin}
      data-oa-event={trackEvent}
      className={resolvedClass}
    >
      Get started free
      {showArrow ? <ArrowRight className="size-4" /> : null}
    </button>
  );
}
