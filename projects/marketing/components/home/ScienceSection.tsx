"use client";

import { useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { SLIDES, type ScienceSlide } from "@/lib/home-content";
import { partnerAccessibleName, partnerBySrc } from "@/lib/site-content";
import { SectionHeading } from "./SectionHeading";

const DESCRIPTION =
  "Developed and validated through academic publications and joint projects with universities, research centers, and industrial partners. Our work contributes to the advancement of computational electromagnetics through published research and collaborations with leading engineering organizations.";

const NEW_WINDOW = "(opens in a new window)";

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

const MARK_MAX_HEIGHT = "clamp(64px, 16vw, 205px)";
const MARK_MAX_HEIGHT_CLASS = "max-h-[clamp(64px,16vw,205px)]";

/** Fitted used width from the picture-file aspect and the height cap.
 * HTML width/height only set aspect-ratio; with `width: auto` Chromium still
 * lays a pending image out at 0 until the file arrives. */
const markFittedWidth = (width: number, height: number): string =>
  `min(100%, calc(${MARK_MAX_HEIGHT} * ${width} / ${height}))`;

/** "Peer-Reviewed Publications" — logo + publication carousel. */
export function ScienceSection({
  slides = SLIDES,
}: {
  /** The publications to show; the site's own list unless a test supplies one. */
  slides?: ScienceSlide[];
} = {}) {
  const [slide, setSlide] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const active = slides[slide];

  const selectSlide = (next: number) => {
    const wrapped = (next + slides.length) % slides.length;
    if (wrapped !== slide) {
      setAnnouncement(slides[wrapped].caption);
    }
    setSlide(wrapped);
  };

  const go = (next: number) => selectSlide(next);

  const picture = (
    <div
      role="img"
      aria-label={active.caption}
      className="h-[clamp(240px,55vw,640px)] w-full bg-cover bg-top"
      style={{ backgroundImage: `url('${active.imageUrl}')` }}
    />
  );

  return (
    <section className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,100px)] pt-[clamp(24px,4vw,40px)]">
      <SectionHeading
        title="Peer-Reviewed Publications"
        description={DESCRIPTION}
        titleClassName="text-[clamp(30px,4.5vw,58px)] tracking-[clamp(2px,0.5vw,5.7px)]"
      />

      <div className="mx-auto mt-[clamp(36px,5vw,56px)] max-w-[1180px]">
        {/* Logos */}
        <div className="grid">
          {slides.map((s, i) => (
            <div
              key={s.caption}
              aria-hidden={i !== slide}
              className={cn(
                "col-start-1 row-start-1 flex flex-wrap content-center items-center justify-center gap-[var(--logo-gap)] [--logo-gap:clamp(24px,4vw,48px)]",
                { invisible: i !== slide },
              )}
              style={{ "--per": perRow(s.logos.length) } as CSSProperties}
            >
              {s.logos.map((mark) => (
                <div
                  key={mark.src}
                  className={cn(
                    "flex w-[calc((100%-var(--logo-gap)*(var(--per)-1))/var(--per))] justify-center",
                    FULL_ROW_AT[s.logos.length],
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mark.src}
                    width={mark.width}
                    height={mark.height}
                    alt={partnerAccessibleName(partnerBySrc(mark.src))}
                    loading="lazy"
                    className={`${MARK_MAX_HEIGHT_CLASS} w-auto max-w-full`}
                    style={{
                      width: markFittedWidth(mark.width, mark.height),
                      height: "auto",
                      aspectRatio: `${mark.width} / ${mark.height}`,
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Publication image */}
        <div className="relative mt-11">
          <div className="mx-auto max-w-[980px] overflow-hidden rounded-[30px] border border-black/30 bg-white shadow-[4px_4px_17px_0_rgba(0,0,0,0.35)]">
            {active.paperUrl ? (
              <a
                href={active.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${active.caption} ${NEW_WINDOW}`}
                className="block cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-navy-950"
              >
                {picture}
              </a>
            ) : (
              picture
            )}
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

        {/* Journal — the row keeps its height when a paper has no journal, so
            the dots below never move between papers. On narrow screens the
            longest journal names wrap to two lines, so it reserves two. */}
        <div className="mt-6 flex min-h-[46px] items-center justify-center text-center sm:min-h-[28px]">
          {active.journal ? (
            <a
              href={active.journal.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${active.journal.name} ${NEW_WINDOW}`}
              className="rounded-sm text-[15px] font-medium text-navy-950 underline underline-offset-4 hover:text-navy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy-950"
            >
              {active.journal.name}
            </a>
          ) : null}
        </div>

        {/* Dots */}
        <div className="mt-4 flex justify-center gap-[10px]">
          {slides.map((s, i) => (
            <button
              key={s.caption}
              type="button"
              onClick={() => selectSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === slide ? "true" : undefined}
              className={cn(
                "h-[10px] w-[10px] cursor-pointer rounded-full border-none p-0",
                i === slide ? "bg-navy-950" : "bg-dot-idle",
              )}
            />
          ))}
        </div>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
