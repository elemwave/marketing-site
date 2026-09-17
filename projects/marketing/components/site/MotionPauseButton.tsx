import { cn } from "@/lib/cn";

interface MotionPauseAffordanceProps {
  paused: boolean;
  name: string;
  className?: string;
}

/** Visual-only pause/resume affordance. The parent surface owns button semantics. */
export function MotionPauseAffordance({
  paused,
  name,
  className,
}: MotionPauseAffordanceProps) {
  return (
    <span
      aria-hidden="true"
      data-testid={paused ? `${name}-motion-paused` : undefined}
      className={cn(
        "pointer-events-none absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-navy-950 opacity-0 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.45)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
        paused && "opacity-100",
        className,
      )}
    >
      {paused ? (
        <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-current" />
      ) : (
        <span className="flex h-4 w-3 items-center justify-between">
          <span className="h-4 w-1 rounded-full bg-current" />
          <span className="h-4 w-1 rounded-full bg-current" />
        </span>
      )}
    </span>
  );
}
