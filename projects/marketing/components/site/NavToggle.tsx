"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/site-content";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useBookingModal } from "@/components/booking/BookingModalProvider";
import { pillButtonClassName } from "./PillButton";

const drawerLink = cn(
  "border-b border-white/[0.12] px-2 py-[14px] text-[17px] font-medium",
  "text-white/80 transition-colors hover:text-white",
  "aria-[current=page]:text-white aria-[current=page]:hover:text-blue-200",
);

/**
 * The narrow-viewport form of the primary navigation: a control that opens a
 * modal dialog over the page.
 *
 * This is the only client component in the header. The logo and the
 * wide-viewport entry row stay server-rendered.
 *
 * See specs/ui/style-guide.md → HeaderNav, and
 * specs/decisions/shared-site-chrome-and-navigation.md.
 */
export function NavToggle() {
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const controlRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { open } = useBookingModal();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.showModal();
  }, [isOpen]);

  // The dialog's own native close (the ✕, the backdrop, Escape, and every
  // close path below) always fires this event; it is what keeps `isOpen`
  // true only while the dialog itself is actually open.
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => setIsOpen(false);
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [isOpen]);

  const closeAndReturnFocus = () => {
    dialogRef.current?.close();
  };

  const dismissForBooking = () => {
    closeAndReturnFocus();
    open({ returnFocusTo: controlRef.current });
  };

  // The dialog's native close() restores focus to whatever was focused when
  // showModal() ran. Not every platform focuses a button on click by
  // default (Safari notably does not), so this makes that starting state
  // deterministic rather than leaving the restore target to chance.
  const openMenu = () => {
    controlRef.current?.focus();
    setIsOpen(true);
  };

  return (
    <>
      <button
        ref={controlRef}
        type="button"
        aria-expanded={isOpen}
        aria-label="Open menu"
        onClick={openMenu}
        className="relative inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border-none bg-transparent text-white transition-colors hover:text-blue-200 min-[761px]:hidden"
      >
        <MenuIcon />
      </button>

      {isOpen && (
        <dialog
          ref={dialogRef}
          aria-label="Menu"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === dialogRef.current) closeAndReturnFocus();
          }}
          className={cn(
            "m-0 max-h-none max-w-none border-none bg-navy-950 p-6",
            "fixed bottom-0 left-auto right-0 top-0 flex h-full w-[min(300px,82vw)] flex-col gap-[6px]",
            "shadow-[-20px_0_60px_rgba(0,0,0,0.5)]",
            "backdrop:bg-[rgba(2,11,26,0.6)] backdrop:backdrop-blur-[3px]",
          )}
        >
          <button
            type="button"
            onClick={closeAndReturnFocus}
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
                onClick={closeAndReturnFocus}
                className={drawerLink}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={dismissForBooking}
            className={cn(
              pillButtonClassName,
              "mt-5 w-full justify-center py-[14px]",
            )}
          >
            Schedule a call
          </button>
        </dialog>
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
