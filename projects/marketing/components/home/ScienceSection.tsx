"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { SLIDES } from "@/lib/home-content";
import { SectionHeading } from "./SectionHeading";

const DESCRIPTION =
  "Developed and validated through academic publications and joint projects with universities, research centers, and industrial partners. Our work contributes to the advancement of computational electromagnetics through published research and collaborations with leading engineering organizations.";

const arrowClass =
  "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-navy-950 text-xl text-white shadow-[0_6px_16px_rgba(0,0,0,0.25)] transition-colors hover:bg-navy-700";

/**
 * Logos per row while the row is too narrow to hold them all. A slide's logo
 * count decides it, so no row is ever left with a single orphan logo: 4 logos
 * split 2+2 rather than 3+1, 5 split 3+2 rather than 4+1.
 *
 * This cannot be done with a shared `min-width`: how many logos fit a row is a
 * function of the container, the floor and the gap alone, so any one value
 * balances one slide and orphans another.
 */
const perRow = (count: number) => (count <= 3 ? count : Math.ceil(count / 2));

/**
 * Widths at which all of a slide's logos fit one row at their 170px floor
 * (`n × 170 + (n-1) × gap + padding`), keyed by logo count. Past it the wrapper
 * drops the explicit width and reverts to sharing the row.
 *
 * Class strings must stay literal — Tailwind scans source text and never sees a
 * name built at runtime.
 */
const FULL_ROW_AT: Record<number, string> = {
  2: "min-[490px]:w-auto min-[490px]:min-w-[170px] min-[490px]:max-w-[265px] min-[490px]:flex-1",
  3: "min-[660px]:w-auto min-[660px]:min-w-[170px] min-[660px]:max-w-[265px] min-[660px]:flex-1",
  4: "min-[900px]:w-auto min-[900px]:min-w-[170px] min-[900px]:max-w-[265px] min-[900px]:flex-1",
  5: "min-[1145px]:w-auto min-[1145px]:min-w-[170px] min-[1145px]:max-w-[265px] min-[1145px]:flex-1",
};

/** "The Science Behind Us" — logo + publication carousel. */
export function ScienceSection() {
  const [slide, setSlide] = useState(0);
  const active = SLIDES[slide];

  const go = (next: number) =>
    setSlide((next + SLIDES.length) % SLIDES.length);

  return (
    <section className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,100px)] pt-[clamp(24px,4vw,40px)]">
      <SectionHeading
        title="The Science Behind Us"
        description={DESCRIPTION}
        titleClassName="text-[clamp(30px,4.5vw,58px)] tracking-[clamp(2px,0.5vw,5.7px)]"
      />

      <div className="mx-auto mt-[clamp(36px,5vw,56px)] max-w-[1180px]">
        {/* Logos */}
        <div className="grid">
          {SLIDES.map((s, i) => (
            <div
              key={s.caption}
              aria-hidden={i !== slide}
              className={cn(
                "col-start-1 row-start-1 flex flex-wrap content-center items-center justify-center gap-[var(--logo-gap)] [--logo-gap:clamp(24px,4vw,48px)]",
                { invisible: i !== slide },
              )}
              style={{ "--per": perRow(s.logos.length) } as CSSProperties}
            >
              {s.logos.map((src) => (
                <div
                  key={src}
                  className={cn(
                    "flex w-[calc((100%-var(--logo-gap)*(var(--per)-1))/var(--per))] justify-center",
                    FULL_ROW_AT[s.logos.length],
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt="Partner logo"
                    className="max-h-[clamp(64px,16vw,205px)] w-auto max-w-full"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Publication image */}
        <div className="relative mt-11">
          <div className="mx-auto max-w-[980px] overflow-hidden rounded-[30px] border border-black/30 bg-white shadow-[4px_4px_17px_0_rgba(0,0,0,0.35)]">
            <div
              role="img"
              aria-label={active.caption}
              className="h-[clamp(240px,55vw,640px)] w-full bg-cover bg-top"
              style={{ backgroundImage: `url('${active.imageUrl}')` }}
            />
          </div>

          <button
            type="button"
            onClick={() => go(slide - 1)}
            aria-label="Previous slide"
            className={cn(arrowClass, "left-[max(-16px,-2vw)]")}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(slide + 1)}
            aria-label="Next slide"
            className={cn(arrowClass, "right-[max(-16px,-2vw)]")}
          >
            ›
          </button>
        </div>

        {/* Dots */}
        <div className="mt-7 flex justify-center gap-[10px]">
          {SLIDES.map((s, i) => (
            <button
              key={s.caption}
              type="button"
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-[10px] w-[10px] cursor-pointer rounded-full border-none p-0",
                i === slide ? "bg-navy-950" : "bg-dot-idle",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
