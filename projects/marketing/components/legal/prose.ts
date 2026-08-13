/**
 * Shared class names for legal prose pages.
 *
 * The project has no typography plugin, so long-form copy is hand-classed from the
 * tokens in `app/globals.css`. Same pattern as `Footer.tsx` and `PillButton.tsx`.
 */

/** Section heading inside a legal document. */
export const legalHeading =
  "mt-10 font-heading text-[clamp(20px,2.5vw,26px)] font-semibold text-ink";

/** Body paragraph. */
export const legalParagraph = "mt-4 text-base leading-[1.7] text-ink-muted";

/** Bulleted list; pair with `legalParagraph` spacing on its items. */
export const legalList =
  "mt-4 list-disc pl-6 text-base leading-[1.7] text-ink-muted";

/** Emphasis inside body copy: lifts the phrase from `ink-muted` to `ink`. */
export const legalStrong = "font-semibold text-ink";

/**
 * Inline link. Colour and hover come from the base layer in `globals.css`;
 * the underline is added here so links stay findable inside long legal prose.
 */
export const legalLink = "underline underline-offset-2";

/** Postal / contact block: `<address>` without the browser's default italics. */
export const legalAddress =
  "mt-4 not-italic text-base leading-[1.7] text-ink-muted";
