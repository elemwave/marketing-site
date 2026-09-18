"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { HERO_IMAGES } from "@/lib/home-content";

const ROTATE_MS = 3000;

function subscribeNever() {
  return () => {};
}

function solverReadyOnClient() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function solverReadyOnServer() {
  return false;
}

/** Hero with headline and auto-cross-fading A320 imagery. */
export function Hero() {
  const [heroState, setHeroState] = useState(0);
  const solverReady = useSyncExternalStore(
    subscribeNever,
    solverReadyOnClient,
    solverReadyOnServer,
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setHeroState((s) => (s + 1) % 3),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, []);

  const layer = "absolute inset-0 h-full w-full object-contain transition-opacity duration-500";

  return (
    <section className="overflow-hidden bg-navy-950">
      <div className="mx-auto box-border flex min-h-[clamp(420px,55vw,700px)] max-w-[1440px] flex-wrap items-center justify-center gap-[clamp(28px,4vw,48px)] px-[clamp(20px,4vw,48px)] py-[clamp(28px,4vw,50px)]">
        <div className="flex min-w-[min(100%,340px)] max-w-[700px] flex-[1_1_440px] flex-col items-start gap-[clamp(24px,3vw,36px)]">
          <h1 className="m-0 max-w-[780px] font-heading text-[clamp(26px,3.5vw,44px)] font-semibold leading-[1.2] tracking-[0.9px] text-white">
            INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS
          </h1>
        </div>
        <div className="relative aspect-[1024/572] h-auto max-h-[520px] min-w-[min(100%,360px)] max-w-[700px] flex-[1_1_480px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGES.cad}
            alt="A320 CAD model"
            className="absolute inset-0 h-full w-full object-contain"
          />
          {solverReady ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={HERO_IMAGES.solver}
              alt="A320 solver field view"
              className={layer}
              style={{ opacity: heroState === 1 ? 1 : 0 }}
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGES.texture}
            alt="A320 textured render"
            className={layer}
            style={{ opacity: heroState === 0 ? 1 : 0 }}
          />
        </div>
      </div>
    </section>
  );
}
