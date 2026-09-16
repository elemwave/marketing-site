import { PARTNER_LOGOS, type PartnerLogo } from "@/lib/site-content";
import { MarqueeLogo } from "./MarqueeLogo";

/**
 * Continuously scrolling strip of partner logos.
 *
 * The list is rendered twice end to end and translated by exactly half the
 * strip's width, so the second copy arrives where the first began and the loop
 * has no visible seam. The duplicate is `aria-hidden`, so each partner is
 * announced once.
 *
 * The animation stops under `prefers-reduced-motion` (see `globals.css`); the
 * logos stay on screen, because reducing motion must not remove content.
 */
export function PartnerMarquee() {
  return (
    <section
      aria-label="Partners"
      /*
       * `relative` is load-bearing: the band above is positioned, so it would
       * paint over the strip that the negative margin tucks underneath it, and
       * the top of every card would be clipped.
       */
      className="relative mt-[clamp(-56px,-3vw,-40px)] overflow-hidden bg-navy-950 pb-[clamp(40px,5vw,64px)]"
    >
      <div className="animate-logo-scroll flex w-max items-center gap-[clamp(48px,6vw,90px)] px-[clamp(24px,3vw,45px)]">
        {PARTNER_LOGOS.map((logo) => (
          <LogoCard key={logo.src} logo={logo} />
        ))}
        {PARTNER_LOGOS.map((logo) => (
          <LogoCard key={`${logo.src}-duplicate`} logo={logo} ariaHidden />
        ))}
      </div>
    </section>
  );
}

interface LogoCardProps {
  logo: PartnerLogo;
  ariaHidden?: boolean;
}

/**
 * The white card is not decoration: two of the logo files carry no alpha
 * channel, so on navy they would render as opaque rectangles.
 */
function LogoCard({ logo, ariaHidden }: LogoCardProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex-shrink-0 rounded-[16px] bg-white px-5 py-[14px] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)]"
    >
      <MarqueeLogo
        src={logo.src}
        alt={ariaHidden ? "" : logo.name}
        className="h-[clamp(48px,7vw,76px)] w-[clamp(110px,14vw,170px)] object-contain"
      />
    </div>
  );
}
