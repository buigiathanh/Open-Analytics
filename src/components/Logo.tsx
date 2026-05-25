import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const sizeMap = {
  sm: 28,
  md: 32,
  lg: 36,
} as const;

type LogoSize = keyof typeof sizeMap;

type LogoProps = {
  size?: LogoSize;
  showText?: boolean;
  /** When false, renders a non-link container (e.g. footer, mock UI). */
  link?: boolean;
  href?: string;
  className?: string;
  textClassName?: string;
};

export function Logo({
  size = "md",
  showText = true,
  link = true,
  href = "/",
  className,
  textClassName,
}: LogoProps) {
  const px = sizeMap[size];

  const content = (
    <>
      <Image
        src="/logo.png"
        alt="Open Analytics"
        width={px}
        height={px}
        className="shrink-0 rounded-lg"
        priority
      />
      {showText ? (
        <span
          className={cn(
            "font-semibold tracking-tight",
            size === "sm" && "text-sm",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            textClassName
          )}
        >
          Open Analytics
        </span>
      ) : null}
    </>
  );

  const rootClass = cn("flex items-center gap-2.5", className);

  if (link) {
    return (
      <Link href={href} className={rootClass}>
        {content}
      </Link>
    );
  }

  return <div className={rootClass}>{content}</div>;
}
