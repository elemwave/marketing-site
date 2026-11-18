/**
 * Hero with the site's headline alone on its dark band. It shows no picture
 * and fetches none, so nothing in it can fail to load, and nothing here needs
 * script, so it renders on the server.
 */
export function Hero() {
  return (
    <section className="overflow-hidden bg-navy-950">
      <div className="mx-auto box-border flex min-h-[clamp(420px,55vw,700px)] max-w-[1440px] flex-wrap items-center justify-center gap-[clamp(28px,4vw,48px)] px-[clamp(20px,4vw,48px)] py-[clamp(28px,4vw,50px)]">
        <div className="flex min-w-[min(100%,340px)] max-w-[700px] flex-[1_1_440px] flex-col items-start gap-[clamp(24px,3vw,36px)]">
          <h1 className="m-0 max-w-[780px] font-heading text-[clamp(26px,3.5vw,44px)] font-semibold leading-[1.2] tracking-[0.9px] text-white">
            INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS
          </h1>
        </div>
      </div>
    </section>
  );
}
