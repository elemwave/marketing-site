import { preload } from "react-dom";
import { HERO_IMAGES } from "@/lib/home-content";

const HERO_ALT = "A320 CAD model";

/**
 * Hero with the headline beside the A320 CAD-model picture. The picture is the
 * background of its sized box, named for assistive technology by the box
 * itself, rather than an `img` element: a picture that cannot load then leaves
 * the box empty, with no broken-image symbol or alt text, in every browser and
 * whether or not the page's scripts have run. Nothing here needs script, so
 * it renders on the server. A background in a style attribute is found later
 * than an `img` would be, so the picture is preloaded to keep its prompt fetch.
 */
export function Hero() {
  preload(HERO_IMAGES.cad, { as: "image", fetchPriority: "high" });

  return (
    <section className="overflow-hidden bg-navy-950">
      <div className="mx-auto box-border flex min-h-[clamp(420px,55vw,700px)] max-w-[1440px] flex-wrap items-center justify-center gap-[clamp(28px,4vw,48px)] px-[clamp(20px,4vw,48px)] py-[clamp(28px,4vw,50px)]">
        <div className="flex min-w-[min(100%,340px)] max-w-[700px] flex-[1_1_440px] flex-col items-start gap-[clamp(24px,3vw,36px)]">
          <h1 className="m-0 max-w-[780px] font-heading text-[clamp(26px,3.5vw,44px)] font-semibold leading-[1.2] tracking-[0.9px] text-white">
            INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS
          </h1>
        </div>
        <div className="flex min-w-[min(100%,360px)] max-w-[700px] flex-[1_1_480px] flex-col items-start gap-3">
          <div className="relative aspect-[1024/572] h-auto max-h-[520px] w-full">
            <div
              role="img"
              aria-label={HERO_ALT}
              data-layer="cad"
              className="absolute inset-0 h-full w-full bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${HERO_IMAGES.cad})` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
