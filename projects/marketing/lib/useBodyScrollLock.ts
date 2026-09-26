import { useEffect } from "react";

/**
 * A fixed panel over a page that still scrolls behind it is disorienting.
 * Shared by every overlay that locks the page while it is open.
 */
export function useBodyScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
}
