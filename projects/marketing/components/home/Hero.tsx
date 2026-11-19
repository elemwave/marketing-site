/**
 * Hero with the site's heading and subheading, centred on its dark band. It
 * shows no picture and fetches none, so nothing in it can fail to load, and
 * nothing here needs script, so it renders on the server.
 *
 * The band keeps the height it had before the opening changed, while the
 * former headline stood alone in it over the space once kept for a picture
 * box (1024:572, at most 700px wide) and the band's gap. Wide bands are held
 * by their own minimum height. Where the band's content is narrower than the
 * two columns it once held side by side (440px + 480px + the gap), the
 * `hero-former-height` rule in `app/globals.css` lays out an invisible copy of
 * the former headline across every row of the heading item's grid, with the
 * gap and the picture box beneath it. Each browser wraps that copy as it
 * wrapped the former headline, so the item is as tall as it was then in every
 * engine: Firefox and WebKit broke the former headline 5 to 13 viewport pixels
 * later than Chromium (`specs/changes/EWM-170/hero-lines.md`), which no fixed
 * line-count bound could follow.
 *
 * The heading and subheading take the grid's two middle rows, with the gap
 * between them as a row of its own, and the flexible rows above and below
 * share whatever height the copy reserves beyond theirs, so the pair sits
 * centred down that height wherever it fits. The copy reserves a minimum, not
 * padding added around the content, so the band grows by no more than the
 * opening needs where it does not fit (enlarged text, say).
 */
export function Hero() {
  return (
    <section className="overflow-hidden bg-navy-950">
      <div className="@container/hero mx-auto box-border flex min-h-[clamp(420px,55vw,700px)] max-w-[1440px] flex-wrap items-center justify-center gap-[clamp(28px,4vw,48px)] px-[clamp(20px,4vw,48px)] py-[clamp(28px,4vw,50px)]">
        <div className="hero-former-height grid min-w-[min(100%,340px)] max-w-[700px] flex-[1_1_440px] grid-cols-[minmax(0,1fr)] grid-rows-[1fr_auto_clamp(24px,3vw,36px)_auto_1fr] justify-items-center">
          <h1 className="col-start-1 row-start-2 m-0 max-w-[780px] text-center font-heading text-[clamp(26px,3.5vw,44px)] font-semibold leading-[1.2] tracking-[0.9px] text-white">
            What does your platform emit, withstand and reflect?
          </h1>
          <p className="col-start-1 row-start-4 m-0 max-w-[640px] text-center text-[clamp(16px,1.5vw,18px)] font-light leading-[1.7] text-white/85">
            Elemwave predicts it even before a prototype exists, with open-source, peer-reviewed simulations that you can
            verify.
          </p>
        </div>
      </div>
    </section>
  );
}
