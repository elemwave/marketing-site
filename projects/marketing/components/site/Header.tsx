import { cn } from "@/lib/cn";
import { BookingTrigger } from "@/components/booking/BookingTrigger";
import { pillButtonClassName } from "./PillButton";
import { NavToggle } from "./NavToggle";
import { SkipToContent } from "./SkipToContent";
import { HeaderNav } from "./HeaderNav";

/**
 * Top navigation: logo + primary nav + "Schedule a call", on the dark band.
 *
 * Below 761px the entry row gives way to `NavToggle`, which opens a drawer
 * holding the same entries. Exactly one form is rendered at a time, so the
 * entries are never announced twice. The call to action stays in the header at
 * every width, wrapping to a second row when it must. See
 * specs/ui/style-guide.md → HeaderNav.
 */
export function Header() {
  return (
    <header className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-navy-950 px-[clamp(20px,4vw,56px)] py-[14px]">
      <SkipToContent />
      {/*
       * Clip the glow to the header's own bounds so pages can drop their
       * overflow-hidden band without the 120%-wide layer causing horizontal
       * scroll, and so the glow never paints over whatever follows the header.
       */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -bottom-10 left-[-10%] h-[180px] w-[120%] blur-[20px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,170,255,0.25), rgba(0,170,255,0.05), transparent 70%)",
          }}
        />
      </div>
      <HeaderNav />

      <BookingTrigger className={cn(pillButtonClassName, "relative ml-auto")}>
        Schedule a call
      </BookingTrigger>

      <NavToggle />
    </header>
  );
}
