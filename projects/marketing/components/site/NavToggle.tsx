"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, type SitePath } from "@/lib/site-content";
import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { pillButtonClassName } from "./PillButton";

interface NavToggleProps {
  /** As on `Header`: omitted on pages with no navigation entry. */
  currentPath?: SitePath;
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
 * specs/decisions/shared-site-chrome-and-navigation.md.
 */
export function NavToggle({ currentPath }: NavToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const controlRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreInertRef = useRef<(() => void) | null>(null);

  const close = () => {
    restoreInertRef.current?.();
    restoreInertRef.current = null;
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

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const overlay = overlayRef.current;
    if (!dialog || !overlay) return;

    dialog.focus();
    restoreInertRef.current = inertRemainderExcept([overlay, dialog]);

    const onKeyDown = (event: KeyboardEvent) => {
      cycleTabInsideDialog(event, dialog);
    };
    dialog.addEventListener("keydown", onKeyDown);

    return () => {
      restoreInertRef.current?.();
      restoreInertRef.current = null;
      dialog.removeEventListener("keydown", onKeyDown);
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
            ref={overlayRef}
            onClick={close}
            className="fixed inset-0 z-[1500] bg-[rgba(2,11,26,0.6)] backdrop-blur-[3px]"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
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

            <div className="contents" onClick={() => setIsOpen(false)}>
              <BookingTrigger
                className={cn(
                  pillButtonClassName,
                  "mt-5 w-full justify-center py-[14px]",
                )}
              >
                Schedule a call
              </BookingTrigger>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const TABBABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function tabbableControls(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (element) => element.tabIndex !== -1,
  );
}

function cycleTabInsideDialog(event: KeyboardEvent, dialog: HTMLElement) {
  if (event.key !== "Tab") return;

  const tabbables = tabbableControls(dialog);
  if (tabbables.length === 0) {
    event.preventDefault();
    return;
  }

  const first = tabbables[0];
  const last = tabbables[tabbables.length - 1];
  if (event.shiftKey) {
    if (document.activeElement === first || document.activeElement === dialog) {
      event.preventDefault();
      last.focus();
    }
    return;
  }

  if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function inertRemainderExcept(exceptions: Element[]): () => void {
  const inerted: HTMLElement[] = [];

  const visit = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (exceptions.includes(child)) continue;
      if (exceptions.some((exception) => child.contains(exception))) {
        visit(child);
        continue;
      }
      if (child instanceof HTMLElement && !child.hasAttribute("inert")) {
        child.setAttribute("inert", "");
        inerted.push(child);
      }
    }
  };

  visit(document.body);

  return () => {
    for (const element of inerted) {
      element.removeAttribute("inert");
    }
  };
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
