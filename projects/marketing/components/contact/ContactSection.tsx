import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { pillButtonClassName } from "@/components/site/PillButton";
import { cn } from "@/lib/cn";
import {
  ADDRESS_LINES,
  CONTACT_EMAIL,
  CONTACT_PHONE,
} from "@/lib/site-content";
import { ContactDetail } from "./ContactDetail";

const panelLink = "text-white transition-colors hover:text-blue-200";

/** The split contact card. See specs/ui/style-guide.md → Split contact card. */
export function ContactSection() {
  return (
    <section className="bg-surface px-[clamp(20px,4vw,56px)] py-[clamp(48px,7vw,96px)]">
      <div className="mx-auto flex max-w-[1100px] flex-wrap overflow-hidden rounded-[clamp(20px,3vw,32px)] bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)]">
        <div className="flex min-w-[min(100%,320px)] flex-[1_1_400px] flex-col justify-center gap-5 p-[clamp(32px,5vw,64px)]">
          <h1 className="m-0 font-heading text-[clamp(28px,3.5vw,44px)] font-semibold leading-[1.2] text-ink">
            Contact us
          </h1>
          <div aria-hidden className="h-[3px] w-16 rounded-[3px] bg-ink" />
          <p className="m-0 text-[16px] leading-[1.7] text-ink-muted">
            Have an electromagnetic simulation, EMC, RF, or engineering software
            challenge? We would be pleased to hear from you.
          </p>
          <p className="m-0 text-[15px] leading-[1.7] text-ink-muted">
            Elemwave S.L. is based in Granada, Spain, and works with engineering
            and research teams on specialist computational electromagnetics
            projects.
          </p>
        </div>

        <div className="relative flex min-w-[min(100%,300px)] flex-[1_1_360px] flex-col justify-center gap-[clamp(24px,3vw,36px)] overflow-hidden bg-gradient-to-b from-navy-800 to-navy-700 p-[clamp(32px,5vw,64px)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-[50px] left-[-20%] h-[200px] w-[140%] blur-[24px]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,170,255,0.25), transparent 70%)",
            }}
          />
          <dl className="relative m-0 flex flex-col gap-[clamp(24px,3vw,36px)]">
            <ContactDetail label="Address">
              {ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </ContactDetail>
            <ContactDetail label="Phone">
              <a href={CONTACT_PHONE.href} className={panelLink}>
                {CONTACT_PHONE.display}
              </a>
            </ContactDetail>
            <ContactDetail label="Email">
              <a href={`mailto:${CONTACT_EMAIL}`} className={panelLink}>
                {CONTACT_EMAIL}
              </a>
            </ContactDetail>
          </dl>

          <BookingTrigger
            className={cn(pillButtonClassName, "relative mt-1 self-start")}
          >
            Schedule a call
          </BookingTrigger>
        </div>
      </div>
    </section>
  );
}
