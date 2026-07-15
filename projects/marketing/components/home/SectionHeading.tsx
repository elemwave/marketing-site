import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  title: string;
  description?: string;
  /** Extra classes for the h2 (e.g. size / letter-spacing overrides). */
  titleClassName?: string;
}

/** Centred section title + underline bar + optional description paragraph. */
export function SectionHeading({
  title,
  description,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <>
      <h2
        className={cn(
          "text-center font-heading text-[clamp(30px,4.5vw,56px)] font-semibold text-ink",
          titleClassName,
        )}
      >
        {title}
      </h2>
      <div className="mx-auto mt-[18px] h-[3px] w-20 rounded-[3px] bg-ink" />
      {description && (
        <p className="mx-auto mt-8 max-w-[820px] text-center text-base leading-[1.7] text-ink-muted">
          {description}
        </p>
      )}
    </>
  );
}
