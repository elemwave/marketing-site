"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, type SitePath } from "@/lib/site-content";
import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { pillButtonClassName } from "./PillButton";

interface NavToggleProps {
  currentPath: SitePath;
}

const drawerLink = cn(
  "border-b border-white/[0.12] px-2 py-[14px] text-[17px] font-medium",
  "text-white/80 transition-colors hover:text-white",
  "aria-[current=page]:text-white aria-[current=page]:hover:text-blue-200",
);

/**
 * The narrow-viewport form of the primary navigation: a control that opens a
 * drawer over the page.
 *
 * This is the only client component in the header. The logo and the
 * wide-viewport entry row stay server-rendered.
 *
 * See specs/ui/style-guide.md → HeaderNav, and
 * specs/decisions/ADR-0005-collapsing-primary-navigation.md.
 */
export function NavToggle({ currentPath }: NavToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setIsOpen(false);
    // Without this the user is left with focus on a drawer that no longer
    // exists, at the top of the document.
    controlRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  // A fixed drawer over a page that still scrolls behind it is disorienting.
  // The booking dialog locks the same way.
  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={controlRef}
        type="button"
        aria-expanded={isOpen}
        aria-label="Open menu"
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border-none bg-transparent text-white transition-colors hover:text-blue-200 min-[761px]:hidden"
      >
        <MenuIcon />
      </button>

      {isOpen && (
        <>
          <div
            onClick={close}
            className="fixed inset-0 z-[1500] bg-[rgba(2,11,26,0.6)] backdrop-blur-[3px]"
          />
          <div
            role="dialog"
            aria-label="Menu"
            className="fixed bottom-0 right-0 top-0 z-[1600] flex w-[min(300px,82vw)] flex-col gap-[6px] bg-navy-950 p-6 shadow-[-20px_0_60px_rgba(0,0,0,0.5)]"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="cursor-pointer self-end border-none bg-transparent px-2 py-1 text-[20px] leading-none text-white/70 transition-colors hover:text-white"
            >
              <CloseIcon />
            </button>

            <nav aria-label="Primary" className="flex flex-col gap-[6px]">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.href === currentPath ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={drawerLink}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <BookingTrigger
              className={cn(
                pillButtonClassName,
                "mt-5 w-full justify-center py-[14px]",
              )}
            >
              Schedule a call
            </BookingTrigger>
          </div>
        </>
      )}
    </>
  );
}

/** Inline SVG on a 24px grid — never a glyph character. */
function MenuIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
