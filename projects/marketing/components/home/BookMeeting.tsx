import type { ReactNode } from "react";
import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { pillButtonClassName } from "@/components/site/PillButton";
import { DEMO_REQUEST_FORM_URL } from "@/lib/site-content";
import { cn } from "@/lib/cn";

function ActionPanel({
  headingId,
  title,
  description,
  children,
}: {
  headingId: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={headingId}
      className="relative min-w-0 overflow-hidden rounded-[clamp(24px,3vw,40px)] bg-gradient-to-b from-navy-800 to-navy-700 px-[clamp(24px,4.5vw,60px)] pb-[clamp(56px,8.5vw,110px)] pt-[clamp(48px,7vw,90px)] text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[200px] left-[-25%] h-[300px] w-[160%] blur-[30px]"
        style={{
          background:
            "radial-gradient(ellipse at center 30%, rgba(59,89,129,1), transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[50px] left-[10%] h-[160px] w-[80%] blur-[18px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.25), transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-[30px]">
        <h2 id={headingId} className="m-0 font-heading text-[clamp(26px,3.5vw,44px)] font-medium uppercase tracking-[clamp(3px,0.7vw,8px)] text-white">
          {title}
        </h2>
        <p className="m-0 max-w-[680px] font-body text-[clamp(16px,1.5vw,19px)] font-light leading-[1.6] tracking-[1px] text-white/85">
          {description}
        </p>
        {children}
      </div>
    </section>
  );
}

/** Peer meeting and demo call-to-action panels. */
export function BookMeeting() {
  return (
    <section
      id="book"
      className="bg-white px-[clamp(20px,4vw,56px)] pb-[clamp(56px,8vw,100px)] pt-[clamp(48px,6vw,80px)]"
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-6">
        <ActionPanel
          headingId="meeting-heading"
          title="Book a Meeting"
          description="Schedule a technical discussion with our team to explore collaboration opportunities"
        >
          <BookingTrigger className={cn(pillButtonClassName, "min-w-[160px] justify-center")}>
            Schedule a Call
          </BookingTrigger>
        </ActionPanel>
        <ActionPanel
          headingId="demo-heading"
          title="Download a Demo"
          description="Request a demo to explore Elemwave software. Our team will email you a download link."
        >
          <a
            href={DEMO_REQUEST_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(pillButtonClassName, "min-w-[160px] justify-center")}
          >
            Download a Demo{" "}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </ActionPanel>
      </div>
    </section>
  );
}
