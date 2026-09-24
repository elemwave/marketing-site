import { expect, vi } from "vitest";
import { screen } from "@testing-library/react";

const QUERY = "(prefers-reduced-motion: reduce)";

function mediaQueryList(matches: boolean, media: string) {
  return {
    matches,
    media,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

export function stubPrefersReducedMotion(matches: boolean): () => void {
  const original = window.matchMedia;
  window.matchMedia = vi.fn((query: string) =>
    mediaQueryList(query === QUERY ? matches : false, query),
  ) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

export function stubLivePrefersReducedMotion(): {
  restore: () => void;
  enable: () => void;
} {
  const original = window.matchMedia;
  const listeners = new Set<(event: Event) => void>();
  const reducedMotionQuery = {
    matches: false,
    media: QUERY,
    onchange: null,
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === "change" && typeof listener === "function") {
        listeners.add(listener);
      }
    },
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
      if (typeof listener === "function") {
        listeners.delete(listener);
      }
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  window.matchMedia = vi.fn((query: string) => {
    if (query === QUERY) {
      return reducedMotionQuery;
    }
    return mediaQueryList(false, query);
  }) as typeof window.matchMedia;

  return {
    restore: () => {
      window.matchMedia = original;
    },
    enable: () => {
      reducedMotionQuery.matches = true;
      listeners.forEach((listener) => listener(new Event("change")));
    },
  };
}

export function expectNoMotionPauseControl(
  labelWhenRunning: string,
  labelWhenPaused: string,
): void {
  expect(screen.queryByRole("button", { name: labelWhenRunning })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: labelWhenPaused })).not.toBeInTheDocument();
}
