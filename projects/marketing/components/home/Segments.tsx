import type { TextSegment } from "@/lib/home-content";

/** Paragraph text whose link segments open the linked site in a new tab. */
export function Segments({ segments }: { segments: TextSegment[] }) {
  return segments.map((segment, i) =>
    typeof segment === "string" ? (
      segment
    ) : (
      <a
        key={i}
        href={segment.href}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:text-ink"
      >
        {segment.text}
      </a>
    ),
  );
}
