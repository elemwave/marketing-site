/**
 * Hero with the site's headline alone, centred on its dark band. It shows no
 * picture and fetches none, so nothing in it can fail to load, and nothing
 * here needs script, so it renders on the server.
 *
 * The band keeps the height it had while a picture box (1024:572, at most
 * 700px wide) stood beneath the headline after the band's gap, so the
 * sections below start where they did. Wide bands are held by their own
 * minimum height. Where the band's content is narrower than the two columns
 * it once held side by side (440px + 480px + the gap), the headline carries
 * half of that box and gap as padding above and below it. Percentage padding
 * resolves against the band's content width, which the container query
 * measures too, so both follow the band rather than the window.
 */
export function Hero() {
  return (
    <section className="overflow-hidden bg-navy-950">
      <div className="@container/hero mx-auto box-border flex min-h-[clamp(420px,55vw,700px)] max-w-[1440px] flex-wrap items-center justify-center gap-[clamp(28px,4vw,48px)] px-[clamp(20px,4vw,48px)] py-[clamp(28px,4vw,50px)]">
        <div className="flex min-w-[min(100%,340px)] max-w-[700px] flex-[1_1_440px] flex-col items-center gap-[clamp(24px,3vw,36px)] @max-[calc(920px_+_clamp(28px,4vw,48px))]/hero:py-[calc((min(100%,700px)*572/1024_+_clamp(28px,4vw,48px))/2)]">
          <h1 className="m-0 max-w-[780px] text-center font-heading text-[clamp(26px,3.5vw,44px)] font-semibold leading-[1.2] tracking-[0.9px] text-white">
            INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS
          </h1>
        </div>
      </div>
    </section>
  );
}
