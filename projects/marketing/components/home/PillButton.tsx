import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** The one white pill style, shared by every call to action. */
const pillButtonClassName =
  "inline-flex items-center whitespace-nowrap rounded-[24px] bg-white px-[clamp(16px,2.5vw,24px)] py-3 font-body text-sm font-semibold tracking-[0.3px] text-navy-800 transition-colors hover:bg-pill-hover";

interface PillButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/** White pill call-to-action. See specs/ui/style-guide.md → PillButton. */
export function PillButton({ href, children, className }: PillButtonProps) {
  return (
    <a href={href} className={cn(pillButtonClassName, className)}>
      {children}
    </a>
  );
}
