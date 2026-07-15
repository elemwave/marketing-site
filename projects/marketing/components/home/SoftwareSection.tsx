"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { TABS } from "@/lib/home-content";
import { SectionHeading } from "./SectionHeading";

const DESCRIPTION =
  "High-precision tools for modeling transmission lines, shielding effects, and complex multiconductor systems with scientific reliability. Designed for researchers who require accurate, scalable, and computationally efficient electromagnetic simulations.";

/** "What Our Software Can Do" — tab circles + active capability card. */
export function SoftwareSection() {
  const [activeTab, setActiveTab] = useState(0);
  const tab = TABS[activeTab];

  return (
    <section
      id="software"
      className="bg-surface px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,110px)] pt-[clamp(48px,7vw,88px)]"
    >
      <SectionHeading title="What Our Software Can Do" description={DESCRIPTION} />

      {/* Tab circles */}
      <div className="mx-auto mt-[clamp(36px,5vw,56px)] flex max-w-[1100px] flex-wrap justify-center gap-[clamp(20px,4vw,48px)]">
        {TABS.map((t, i) => {
          const active = i === activeTab;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => setActiveTab(i)}
              className="relative flex cursor-pointer flex-col items-center gap-[18px] border-none bg-transparent pb-[10px]"
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
                  "font-body text-sm text-ink",
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

      {/* Active tab card */}
      <div className="mx-auto mt-12 flex min-h-[540px] max-w-[1240px] flex-wrap items-center gap-[clamp(28px,3.5vw,44px)] rounded-[28px] bg-white p-[clamp(24px,4vw,48px)] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)]">
        <div className="flex min-w-[min(100%,320px)] flex-[1_1_380px] flex-col gap-[18px]">
          <h3 className="m-0 font-heading text-[clamp(26px,3.5vw,38px)] font-semibold tracking-[1px] text-ink">
            {tab.title}
          </h3>
          <p className="m-0 font-body text-base font-semibold text-ink">
            {tab.subtitle}
          </p>
          <p className="m-0 mt-2 font-body text-[15px] font-semibold text-ink">
            Usage:
          </p>
          <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
            {tab.bullets.map((bullet) => (
              <li
                key={bullet}
                className="font-body text-[15px] leading-[25px] text-ink-muted"
              >
                {bullet}
              </li>
            ))}
          </ul>
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
    </section>
  );
}
