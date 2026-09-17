"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { HERO_IMAGES } from "@/lib/home-content";
import { MotionPauseAffordance } from "@/components/site/MotionPauseButton";
import { PillButton } from "@/components/site/PillButton";
import { usePrefersReducedMotion } from "@/components/site/usePrefersReducedMotion";

const ROTATE_MS = 3000;

function subscribeNever() {
  return () => {};
}

function getClientTrue() {
  return true;
}

function getServerFalse() {
  return false;
}

/** Hero with headline, CTA, and auto-cross-fading A320 imagery. */
export function Hero() {
  const [heroState, setHeroState] = useState(0);
  const [paused, setPaused] = useState(false);
  const [solverReady, setSolverReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const isClient = useSyncExternalStore(
    subscribeNever,
    getClientTrue,
    getServerFalse,
  );

  if (isClient && !reducedMotion && !paused && !solverReady) {
    setSolverReady(true);
  }

  useEffect(() => {
    if (reducedMotion || paused) return;
    const id = setInterval(
      () => setHeroState((s) => (s + 1) % 3),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [paused, reducedMotion]);

  const layer = "absolute inset-0 h-full w-full object-contain transition-opacity duration-500";
  const stackClassName = "relative aspect-[1024/572] h-auto max-h-[520px] w-full";
  const heroStack = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGES.cad}
        alt=""
        data-layer="cad"
        className="absolute inset-0 h-full w-full object-contain"
      />
      {solverReady ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HERO_IMAGES.solver}
          alt=""
          data-layer="solver"
          className={layer}
          style={{ opacity: heroState === 1 ? 1 : 0 }}
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGES.texture}
        alt=""
        data-layer="texture"
        className={layer}
        style={{ opacity: heroState === 0 ? 1 : 0 }}
      />
    </>
  );

  return (
    <section className="overflow-hidden bg-navy-950">
      <div className="mx-auto box-border flex min-h-[clamp(420px,55vw,700px)] max-w-[1440px] flex-wrap items-center justify-center gap-[clamp(28px,4vw,48px)] px-[clamp(20px,4vw,48px)] py-[clamp(28px,4vw,50px)]">
        <div className="flex min-w-[min(100%,340px)] max-w-[700px] flex-[1_1_440px] flex-col items-start gap-[clamp(24px,3vw,36px)]">
          <h1 className="m-0 max-w-[780px] font-heading text-[clamp(26px,3.5vw,44px)] font-semibold leading-[1.2] tracking-[0.9px] text-white">
            INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS
          </h1>
          <PillButton href="#software">Try our demo</PillButton>
        </div>
        <div className="flex min-w-[min(100%,360px)] max-w-[700px] flex-[1_1_480px] flex-col items-start gap-3">
          {reducedMotion ? (
            <div className={stackClassName}>{heroStack}</div>
          ) : (
            <button
              type="button"
              aria-pressed={paused}
              aria-label={paused ? "Resume hero pictures" : "Pause hero pictures"}
              className={`${stackClassName} cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-200`}
              onClick={() => setPaused((value) => !value)}
            >
              {heroStack}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
