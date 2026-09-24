import { CERTIFICATIONS, type Certification } from "@/lib/home-content";
import { SectionHeading } from "./SectionHeading";

const documentLinkClassName =
  "text-[13px] font-semibold text-blue-500 transition-colors hover:text-navy-800";

/** "Certifications" — one card per certification, seal plus its own certificate/annex links. */
export function CertificationsSection() {
  return (
    <section className="bg-navy-800 px-[clamp(20px,4vw,56px)] pb-[clamp(48px,7vw,88px)] pt-[clamp(48px,7vw,88px)]">
      <SectionHeading title="Certifications" titleClassName="text-white" />

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
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
          <a
            href={certification.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className={documentLinkClassName}
          >
            Certificate
          </a>
          <a
            href={certification.annexUrl}
            target="_blank"
            rel="noreferrer"
            className={documentLinkClassName}
          >
            Annex
          </a>
        </div>
      </div>
    </article>
  );
}
