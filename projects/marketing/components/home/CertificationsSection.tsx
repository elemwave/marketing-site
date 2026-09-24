import { CERTIFICATIONS, type Certification } from "@/lib/home-content";
import { SectionHeading } from "./SectionHeading";

const filledPillClassName =
  "inline-flex items-center gap-1.5 rounded-[24px] bg-navy-800 px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-navy-700";
const outlinedPillClassName =
  "inline-flex items-center gap-1.5 rounded-[24px] border border-navy-800 bg-white px-5 py-2.5 text-[13px] font-semibold text-navy-800 transition-colors hover:bg-navy-800 hover:text-white";

/** Small download-arrow glyph, matching `NavToggle`'s inline-SVG icon convention. */
function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
    </svg>
  );
}

/** "Certifications" — one card per certification, seal plus its own certificate/annex links. */
export function CertificationsSection() {
  return (
    <section className="bg-navy-800 px-[clamp(20px,4vw,56px)] pb-[clamp(48px,7vw,88px)] pt-[clamp(48px,7vw,88px)]">
      <SectionHeading
        title="Certifications"
        titleClassName="text-white"
        dividerClassName="bg-white"
      />

      <div className="mx-auto mt-[clamp(32px,4vw,48px)] grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[clamp(20px,3vw,32px)]">
        {CERTIFICATIONS.map((certification) => (
          <CertificationCard key={certification.name} certification={certification} />
        ))}
      </div>
    </section>
  );
}

function CertificationCard({ certification }: { certification: Certification }) {
  return (
    <article className="flex items-center gap-5 rounded-[16px] bg-white p-[22px] shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={certification.sealSrc}
        width={72}
        height={72}
        alt={`${certification.name} seal`}
        loading="lazy"
        className="h-[72px] w-[72px] flex-none rounded-full bg-surface object-contain"
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="m-0 font-heading text-[20px] font-semibold tracking-[0.5px] text-navy-800">
          {certification.name}
        </h3>
        <p className="m-0 text-[13px] text-ink">{certification.subtitle}</p>
        <p className="m-0 text-[13px] text-ink-muted">{certification.body}</p>
        <div className="mt-1 flex flex-wrap gap-3">
          <a
            href={certification.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className={filledPillClassName}
          >
            Certificate
            <DownloadIcon />
          </a>
          <a
            href={certification.annexUrl}
            target="_blank"
            rel="noreferrer"
            className={outlinedPillClassName}
          >
            Annex
            <DownloadIcon />
          </a>
        </div>
      </div>
    </article>
  );
}
