import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  ADDRESS_LINES,
  COMPANY_REGISTRATION,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LEGAL_PAGES,
  LOGO,
} from "@/lib/site-content";
import { BookingTrigger } from "@/components/booking/BookingTrigger";

const columnTitle = "m-0 font-heading text-[15px] font-semibold text-white";
const footerLink = "text-[14px] text-white/70 transition-colors hover:text-white";

const COPYRIGHT_FROM = 2021;
const FOOTER_HEADING_ID = "footer-heading";

/** Site footer with brand, link columns, and copyright. */
export function Footer() {
  // The export is static, so this is the year the site was last built. Every
  // deployment rebuilds, which is what keeps it current.
  const copyrightTo = new Date().getFullYear();

  return (
    <footer
      aria-labelledby={FOOTER_HEADING_ID}
      className="relative overflow-hidden bg-navy-950 px-[clamp(20px,6vw,88px)] pb-8 pt-[clamp(40px,5vw,64px)]"
    >
      <h2 id={FOOTER_HEADING_ID} className="sr-only">
        Footer
      </h2>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[15px] left-[-10%] h-[160px] w-[120%] blur-[18px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,170,255,0.25), rgba(0,170,255,0.05), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex max-w-[1240px] flex-wrap gap-[clamp(32px,4vw,48px)]">
        <div className="flex min-w-[240px] flex-[2_1_280px] flex-col gap-4">
          <Image
            src={LOGO}
            alt="Elemwave"
            className="h-[clamp(48px,6vw,64px)] w-auto self-start"
          />
          <p className="m-0 max-w-[320px] text-[14px] leading-[1.6] text-white/70">
            Innovative solutions for advanced electromagnetics simulations
          </p>
        </div>

        <div className="flex min-w-[150px] flex-[1_1_160px] flex-col gap-[14px]">
          <h3 className={columnTitle}>Policies</h3>
          {LEGAL_PAGES.map((page) => (
            <Link key={page.href} href={page.href} className={footerLink}>
              {page.label}
            </Link>
          ))}
        </div>

        <div className="flex min-w-[160px] flex-[1_1_180px] flex-col gap-[14px]">
          <h3 className={columnTitle}>Quick Links</h3>
          <Link href="/team" className={footerLink}>
            Our Team
          </Link>
          <Link href="/contact" className={footerLink}>
            Contact
          </Link>
          <Link href="/partnerships" className={footerLink}>
            Partnerships
          </Link>
          <BookingTrigger
            className={cn(
              footerLink,
              "cursor-pointer border-none bg-transparent p-0 text-left font-body",
            )}
          >
            Schedule a meeting
          </BookingTrigger>
        </div>

        <div className="flex min-w-[200px] flex-[1_1_220px] flex-col gap-[14px]">
          <h3 className={columnTitle}>Get In Touch</h3>
          <span className="text-[14px] text-white/70">
            Email:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={footerLink}>
              {CONTACT_EMAIL}
            </a>
          </span>
          <span className="text-[14px] text-white/70">
            Phone: {CONTACT_PHONE.display}
          </span>
          <span className="text-[14px] text-white/70">
            {ADDRESS_LINES.join(", ")}
          </span>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1240px] pt-6 text-center">
        <p className="m-0 text-[13px] text-white/55">
          {`© ${COPYRIGHT_FROM}-${copyrightTo} Elemwave - CEM and EMC solutions`}
        </p>
        <p className="m-0 mt-2 text-[12px] leading-[1.6] text-white/55">
          {`${COMPANY_REGISTRATION.legalName} · CIF ${COMPANY_REGISTRATION.taxId}`}
          <br />
          {COMPANY_REGISTRATION.registry}
        </p>
      </div>
    </footer>
  );
}
