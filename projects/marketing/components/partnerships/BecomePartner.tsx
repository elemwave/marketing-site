import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { pillButtonClassName } from "@/components/site/PillButton";
import { cn } from "@/lib/cn";

/**
 * "Become a Partner" gradient call-to-action panel.
 *
 * The source design gives this button 16px/34px padding and a 10px radius — a
 * third button geometry. The style guide's one-pill rule wins, so it reuses
 * `pillButtonClassName` and matches the home page's equivalent panel.
 */
export function BecomePartner() {
  return (
    <section
      id="partner"
      className="bg-white px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,100px)]"
    >
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[clamp(24px,3vw,40px)] bg-gradient-to-b from-navy-800 to-navy-700 px-[clamp(24px,4.5vw,60px)] py-[clamp(48px,7vw,80px)] text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[60px] left-[-10%] h-[220px] w-[120%] blur-[24px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,170,255,0.25), transparent 70%)",
          }}
        />
        <h2 className="relative m-0 font-heading text-[clamp(26px,3.5vw,44px)] font-medium uppercase tracking-[clamp(3px,0.7vw,8px)] text-white">
          Become a Partner
        </h2>
        <p className="relative mx-auto mt-5 max-w-[620px] text-[clamp(16px,1.5vw,19px)] font-light leading-[1.6] tracking-[1px] text-white/85">
          If your team works on problems where computational electromagnetics
          makes the difference, we would be pleased to talk.
        </p>
        <BookingTrigger className={cn(pillButtonClassName, "relative mt-8")}>
          Schedule a Call
        </BookingTrigger>
      </div>
    </section>
  );
}
