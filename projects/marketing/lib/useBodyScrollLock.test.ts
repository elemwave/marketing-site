import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useBodyScrollLock } from "./useBodyScrollLock";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("useBodyScrollLock", () => {
  it("does nothing while closed", () => {
    document.body.style.overflow = "auto";

    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.overflow).toBe("auto");
  });

  it("locks the body once open", () => {
    renderHook(() => useBodyScrollLock(true));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores the prior value, not always empty, once closed again", () => {
    document.body.style.overflow = "auto";
    const { rerender } = renderHook(
      ({ isOpen }) => useBodyScrollLock(isOpen),
      { initialProps: { isOpen: true } },
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender({ isOpen: false });

    expect(document.body.style.overflow).toBe("auto");
  });

  it("restores the prior value on unmount while still open", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("scroll");
  });
});
