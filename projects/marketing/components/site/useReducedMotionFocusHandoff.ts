import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * A live reduced-motion change unmounts the moving surface's button and
 * mounts a plain wrapper at the same tree position, which silently drops
 * keyboard/AT focus to `<body>` when the control held it. Hand focus to the
 * surviving wrapper instead, so it lands somewhere in the page rather than
 * nowhere.
 */
export function useReducedMotionFocusHandoff(
  reducedMotion: boolean,
  fallbackRef: RefObject<HTMLElement | null>,
) {
  const controlHadFocus = useRef(false);

  useLayoutEffect(() => {
    if (reducedMotion && controlHadFocus.current) {
      controlHadFocus.current = false;
      fallbackRef.current?.focus();
    }
  }, [reducedMotion, fallbackRef]);

  return {
    onFocus: () => {
      controlHadFocus.current = true;
    },
    onBlur: () => {
      controlHadFocus.current = false;
    },
  };
}
