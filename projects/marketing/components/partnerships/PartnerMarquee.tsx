"use client";

import { useRef, useState } from "react";
import {
  PARTNER_LOGOS,
  partnerAccessibleName,
  type PartnerLogo,
} from "@/lib/site-content";
import { usePrefersReducedMotion } from "@/components/site/usePrefersReducedMotion";
import { useReducedMotionFocusHandoff } from "@/components/site/useReducedMotionFocusHandoff";
import { cn } from "@/lib/cn";
import { marqueeDurationSeconds, marqueeRepeatsPerHalf } from "@/lib/partner-strip";
import { MarqueeLogo } from "./MarqueeLogo";

/**
 * Continuously scrolling strip of partner logos.
 *
 * The list is repeated until each half of the row holds enough cards to fill
 * a wide screen, and the row is translated by exactly half its width, so the
 * second half arrives where the first began and the loop has no visible seam.
 * The duration follows the cards in a half (`lib/partner-strip.ts`), so the
 * strip's pace does not depend on how many partners there are. Every copy of
 * the list after the first is `aria-hidden`, so each partner is announced once.
 *
 * The animation stops under `prefers-reduced-motion` (see `globals.css`); the
 * logos stay on screen, because reducing motion must not remove content.
 * Visitor pause freezes the current offset with `is-paused`.
 */
export function PartnerMarquee() {
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const controlFocusHandlers = useReducedMotionFocusHandoff(
    reducedMotion,
    sectionRef,
  );
  const copies = Array.from(
    { length: marqueeRepeatsPerHalf(PARTNER_LOGOS.length) * 2 },
    (_, copy) => copy,
  );
  const marqueeRow = (
    <span
      className={cn(
        "animate-logo-scroll flex w-max items-center gap-[clamp(48px,6vw,90px)] px-[clamp(24px,3vw,45px)]",
        paused && "is-paused",
      )}
      style={{ animationDuration: `${marqueeDurationSeconds(PARTNER_LOGOS.length)}s` }}
    >
      {copies.map((copy) =>
        PARTNER_LOGOS.map((logo) => (
          <LogoCard key={`${logo.src}-${copy}`} logo={logo} ariaHidden={copy > 0 ? true : undefined} />
        )),
      )}
    </span>
  );

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      aria-label="Partners"
      /*
       * `relative` is load-bearing: the band above is positioned, so it would
       * paint over the strip that the negative margin tucks underneath it, and
       * the top of every card would be clipped.
       */
      className="relative mt-[clamp(-56px,-3vw,-40px)] overflow-hidden bg-navy-950 pb-[clamp(40px,5vw,64px)] focus:outline-none"
    >
      {reducedMotion ? (
        <div>{marqueeRow}</div>
      ) : (
        <button
          type="button"
          aria-pressed={paused}
          aria-label={paused ? "Resume partner marks" : "Pause partner marks"}
          className="relative block w-full cursor-pointer appearance-none overflow-visible border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-200"
          onClick={() => setPaused((value) => !value)}
          onFocus={controlFocusHandlers.onFocus}
          onBlur={controlFocusHandlers.onBlur}
        >
          {marqueeRow}
        </button>
      )}
    </section>
  );
}

interface LogoCardProps {
  logo: PartnerLogo;
  ariaHidden?: boolean;
}

/**
 * The white card is not decoration: a logo file without an alpha channel would
 * render on navy as an opaque rectangle, and the white parts of a mark need a
 * white ground.
 */
function LogoCard({ logo, ariaHidden }: LogoCardProps) {
  return (
    <span
      aria-hidden={ariaHidden}
      className="inline-flex flex-shrink-0 rounded-[16px] bg-white px-5 py-[14px] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)]"
    >
      <MarqueeLogo
        src={logo.src}
        alt={ariaHidden ? "" : partnerAccessibleName(logo)}
        className="h-[clamp(48px,7vw,76px)] w-[clamp(110px,14vw,170px)] object-contain"
      />
    </span>
  );
}
