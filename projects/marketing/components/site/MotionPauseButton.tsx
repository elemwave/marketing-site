import { pillButtonClassName } from "./PillButton";

interface MotionPauseButtonProps {
  paused: boolean;
  onToggle: () => void;
  labelWhenRunning: string;
  labelWhenPaused: string;
}

/** Presentational pause/resume toggle. See specs/ui/style-guide.md → Motion. */
export function MotionPauseButton({
  paused,
  onToggle,
  labelWhenRunning,
  labelWhenPaused,
}: MotionPauseButtonProps) {
  return (
    <button
      type="button"
      className={pillButtonClassName}
      aria-pressed={paused}
      onClick={onToggle}
    >
      {paused ? labelWhenPaused : labelWhenRunning}
    </button>
  );
}
