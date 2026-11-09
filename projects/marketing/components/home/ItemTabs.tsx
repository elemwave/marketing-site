"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { SoftwareTab } from "@/lib/home-content";
import { Segments } from "./Segments";

const paragraphKey = (paragraph: SoftwareTab["paragraphs"][number]) =>
  typeof paragraph === "string" ? paragraph : paragraph.map((s) => (typeof s === "string" ? s : s.text)).join("");

/**
 * A row of tab circles, announced as one group, and the chosen item's card:
 * its title, paragraphs and picture. No item shows until the visitor chooses a
 * tab: until then there are only the tabs, none indicated as selected, and no
 * card or placeholder where the item will appear, and again when the page is
 * shown from the browser's history. On a phone each tab takes a third of the
 * row, so the circles stand in an even grid with a short last row centred;
 * from the `sm` breakpoint each tab is as wide as its label. A polite status
 * line names the newly shown item whenever the visitor moves to a different
 * one.
 *
 * Activating a tab also brings the item card into view: with many items the
 * row wraps, and the card can sit below the window, where a change of item
 * would go unseen. `block: "nearest"` leaves a card already in view where it
 * is, and the page's own CSS `scroll-behavior` decides between smooth and
 * immediate, so a reduced-motion preference is honoured.
 */
export function ItemTabs({ items, groupLabel }: { items: SoftwareTab[]; groupLabel: string }) {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [activations, setActivations] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const tab = activeTab === null ? null : items[activeTab];

  // After the chosen item has rendered, so a taller card is measured as it is.
  useEffect(() => {
    if (activations > 0) {
      cardRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [activations]);

  // A page restored from the browser's back-forward cache keeps its state, so
  // a visitor coming back by the Back button would find the item they chose
  // before leaving. A return is treated like a fresh visit.
  useEffect(() => {
    const showNoItem = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setActiveTab(null);
        setAnnouncement("");
      }
    };
    window.addEventListener("pageshow", showNoItem);
    return () => window.removeEventListener("pageshow", showNoItem);
  }, []);

  const selectTab = (i: number) => {
    if (i !== activeTab) {
      setAnnouncement(items[i].title);
    }
    setActiveTab(i);
    setActivations((n) => n + 1);
  };

  return (
    <>
      <div
        role="group"
        aria-label={groupLabel}
        className="mx-auto mt-[clamp(36px,5vw,56px)] flex max-w-[1100px] flex-wrap justify-center gap-x-3 gap-y-7 sm:gap-[clamp(20px,4vw,48px)]"
      >
        {items.map((t, i) => {
          const active = i === activeTab;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => selectTab(i)}
              aria-pressed={active}
              className="relative flex w-[calc((100%-24px)/3)] cursor-pointer flex-col items-center gap-[18px] border-none bg-transparent pb-[10px] sm:w-auto"
            >
              <span
                className="h-[clamp(80px,10vw,110px)] w-[clamp(80px,10vw,110px)] rounded-full border-[6px] border-white bg-navy-800 bg-cover bg-center shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition-transform duration-200"
                style={{
                  backgroundImage: `url('${t.iconUrl}')`,
                  transform: active ? "translateY(-5px)" : "translateY(0)",
                }}
              />
              <span
                className={cn(
                  "text-center font-body text-sm text-ink",
                  active ? "font-semibold" : "font-normal",
                )}
              >
                {t.label}
              </span>
              <span
                className="absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2 bg-ink transition-[width] duration-200"
                style={{ width: active ? "60%" : "0%" }}
              />
            </button>
          );
        })}
      </div>

      {/* Chosen item card, present only once a tab is chosen */}
      {tab && (
        <div
          ref={cardRef}
          className="mx-auto mt-12 flex min-h-[540px] max-w-[1240px] flex-wrap items-center gap-[clamp(28px,3.5vw,44px)] rounded-[28px] bg-white p-[clamp(24px,4vw,48px)] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)]">
          <div className="flex min-w-[min(100%,320px)] flex-[1_1_380px] flex-col gap-[18px]">
            <h3 className="m-0 font-heading text-[clamp(26px,3.5vw,38px)] font-semibold tracking-[1px] text-ink">
              {tab.title}
            </h3>
            {tab.paragraphs.map((paragraph) => (
              <p key={paragraphKey(paragraph)} className="m-0 font-body text-[15px] leading-[25px] text-ink-muted">
                {typeof paragraph === "string" ? paragraph : <Segments segments={paragraph} />}
              </p>
            ))}
          </div>
          <div className="flex min-w-[min(100%,320px)] flex-[1_1_480px] items-center justify-center">
            <div
              role="img"
              aria-label={`${tab.title} screenshot`}
              className="h-[clamp(220px,42vw,460px)] w-full rounded-[12px] bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${tab.imageUrl}')` }}
            />
          </div>
        </div>
      )}

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
