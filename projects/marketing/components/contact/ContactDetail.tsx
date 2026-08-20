import type { ReactNode } from "react";

interface ContactDetailProps {
  label: string;
  children: ReactNode;
}

/**
 * One labelled contact value inside the navy panel. A `<dt>`/`<dd>` pair, so
 * the run of them is a description list rather than anonymous divs.
 * See specs/ui/style-guide.md → ContactDetail.
 */
export function ContactDetail({ label, children }: ContactDetailProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <dt className="font-heading text-[12px] font-semibold uppercase tracking-[2.5px] text-white/55">
        {label}
      </dt>
      <dd className="m-0 text-[16px] leading-[1.6] text-white">{children}</dd>
    </div>
  );
}
