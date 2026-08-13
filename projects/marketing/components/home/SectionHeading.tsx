import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  title: string;
  description?: string;
  /** Extra classes for the heading (e.g. size / letter-spacing overrides). */
  titleClassName?: string;
  /** Heading level: `h1` for a page title, `h2` for a section within a page. */
  as?: "h1" | "h2";
}

/** Centred section title + underline bar + optional description paragraph. */
export function SectionHeading({
  title,
  description,
  titleClassName,
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <>
      <Heading
        className={cn(
          "text-center font-heading text-[clamp(30px,4.5vw,56px)] font-semibold text-ink",
          titleClassName,
        )}
      >
        {title}
      </Heading>
      <div className="mx-auto mt-[18px] h-[3px] w-20 rounded-[3px] bg-ink" />
      {description && (
        <p className="mx-auto mt-8 max-w-[820px] text-center text-base leading-[1.7] text-ink-muted">
          {description}
        </p>
      )}
    </>
  );
}
