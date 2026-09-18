/**
 * First focusable control on every page: a same-document fragment link that
 * jumps past the header to the primary-content landmark.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-[clamp(20px,4vw,56px)] focus-visible:top-[14px] focus-visible:z-50 focus-visible:bg-white focus-visible:px-4 focus-visible:py-2 focus-visible:text-navy-950"
    >
      Skip to content
    </a>
  );
}
