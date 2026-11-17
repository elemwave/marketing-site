/**
 * Cards in each half of the partner strip's row. The 60-second duration was
 * tuned against fifteen cards a half, so a half never holds fewer.
 */
export const MARQUEE_MIN_CARDS_PER_HALF = 15;

/**
 * Seconds the strip takes to pass one card: 60 seconds over fifteen cards, and
 * the source design's 36 seconds over nine. A constant per card, not per strip,
 * holds the pace whatever the number of partners.
 */
export const MARQUEE_SECONDS_PER_CARD = 4;

function assertMarkCount(markCount: number): void {
  if (!Number.isInteger(markCount) || markCount < 1) {
    throw new RangeError(`The partner strip needs at least one mark, got ${markCount}`);
  }
}

/** How many times the list repeats inside each half so the half is long enough. */
export function marqueeRepeatsPerHalf(markCount: number): number {
  assertMarkCount(markCount);
  return Math.ceil(MARQUEE_MIN_CARDS_PER_HALF / markCount);
}

/** Seconds for one full cycle: the strip's travel is half its row. */
export function marqueeDurationSeconds(markCount: number): number {
  return marqueeRepeatsPerHalf(markCount) * markCount * MARQUEE_SECONDS_PER_CARD;
}
