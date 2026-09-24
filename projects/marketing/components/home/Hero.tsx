"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { HERO_IMAGES } from "@/lib/home-content";
import { usePrefersReducedMotion } from "@/components/site/usePrefersReducedMotion";
import { useReducedMotionFocusHandoff } from "@/components/site/useReducedMotionFocusHandoff";

const ROTATE_MS = 3000;

const HERO_ALT = {
  cad: "A320 CAD model",
  solver: "A320 solver field view",
  texture: "A320 textured render",
};

function subscribeNever() {
  return () => {};
}

function getClientTrue() {
  return true;
}

function getServerFalse() {
  return false;
}

/** Hero with headline and auto-cross-fading A320 imagery. */
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
  const stackWrapperRef = useRef<HTMLDivElement>(null);
  const controlFocusHandlers = useReducedMotionFocusHandoff(
    reducedMotion,
    stackWrapperRef,
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
  // The button's own accessible name covers the imagery while motion is
  // available; under reduced motion there is no covering name, so the
  // images carry their own descriptive alt text instead.
  const heroStack = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGES.cad}
        alt={reducedMotion ? HERO_ALT.cad : ""}
        data-layer="cad"
        className="absolute inset-0 h-full w-full object-contain"
      />
      {solverReady ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HERO_IMAGES.solver}
          alt={reducedMotion ? HERO_ALT.solver : ""}
          data-layer="solver"
          className={layer}
          style={{ opacity: heroState === 1 ? 1 : 0 }}
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGES.texture}
        alt={reducedMotion ? HERO_ALT.texture : ""}
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
        </div>
        <div
          ref={stackWrapperRef}
          tabIndex={-1}
          className="flex min-w-[min(100%,360px)] max-w-[700px] flex-[1_1_480px] flex-col items-start gap-3 focus:outline-none"
        >
          {reducedMotion ? (
            <div className={stackClassName}>{heroStack}</div>
          ) : (
            <button
              type="button"
              aria-pressed={paused}
              aria-label={paused ? "Resume hero pictures" : "Pause hero pictures"}
              className={`${stackClassName} cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-200`}
              onClick={() => setPaused((value) => !value)}
              onFocus={controlFocusHandlers.onFocus}
              onBlur={controlFocusHandlers.onBlur}
            >
              {heroStack}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
