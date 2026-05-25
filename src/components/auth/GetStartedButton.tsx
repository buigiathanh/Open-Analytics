"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

type GetStartedButtonProps = {
  className?: string;
  showArrow?: boolean;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
};

export function GetStartedButton({
  className,
  showArrow = false,
  size = "md",
}: GetStartedButtonProps) {
  const { user, loading, openLogin } = useAuth();

  const baseClass = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
    sizeClasses[size],
    className
  );

  if (loading) {
    return (
      <span
        className={cn(
          baseClass,
          "bg-emerald-600/70 text-white cursor-wait"
        )}
        aria-busy="true"
      >
        …
      </span>
    );
  }

  if (user) {
    return (
      <Link
        href="/app"
        className={cn(baseClass, "bg-emerald-600 text-white hover:bg-emerald-500")}
      >
        Dashboard
        {showArrow ? <ArrowRight className="size-4" /> : null}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={openLogin}
      className={cn(baseClass, "bg-emerald-600 text-white hover:bg-emerald-500")}
    >
      Get started free
      {showArrow ? <ArrowRight className="size-4" /> : null}
    </button>
  );
}
