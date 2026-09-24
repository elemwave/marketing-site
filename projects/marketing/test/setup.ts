import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Testing Library only registers its own cleanup when Vitest runs with
// `globals`, which this project does not. Without this, every render stays in
// the document and later queries match elements from earlier tests.
afterEach(cleanup);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

// jsdom 30.0.1 defines HTMLDialogElement but implements neither showModal()
// nor close() (confirmed empirically against this project's pinned version:
// both are `undefined` on the prototype). A component under test that calls
// either would throw with no polyfill. Real Tab containment stays out of
// reach for jsdom either way — that is what the Playwright suite is for —
// but a component can still be driven and observed to open, call the native
// API, and sync its own state from the dialog's `close` event.
// showModal()/close() genuinely move and restore focus in every supported
// browser (the HTML living standard's dialog focusing steps), so the
// polyfill reproduces that pairing rather than leaving it unverifiable: it
// is what a caller of `close()` — including a test standing in for the
// browser's own Escape handling, which has no jsdom algorithm to invoke —
// can rely on.
const dialogFocusMemory = new WeakMap<HTMLDialogElement, Element | null>();
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    dialogFocusMemory.set(this, document.activeElement);
    this.setAttribute("open", "");
  };
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
    const previouslyFocused = dialogFocusMemory.get(this);
    if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
    dialogFocusMemory.delete(this);
  };
}
