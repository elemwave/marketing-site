import { expect, test } from "@playwright/test";

/**
 * jsdom cannot drive real Tab-key traversal or the browser's own modal
 * focus-containment algorithm (see `components/site/NavToggle.test.tsx`),
 * so this is the one place that behaviour is actually exercised. Restricted
 * to `mobile-chromium` — the only configured project narrower than the
 * 761px breakpoint that shows Open menu at all (see `playwright.config.ts`).
 */
test("the narrow-viewport menu is a real modal dialog", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Open menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();

  // Focus moves into the dialog on open, per the browser's own dialog
  // focusing steps. This project sets no explicit autofocus target, and
  // empirically (see close-out) Chromium's default in that case is the
  // first tabbable descendant, not the dialog element itself, so this
  // checks containment rather than the dialog being the focused element.
  const initialFocusIsInsideDialog = await page.evaluate(() => {
    const dialogEl = document.querySelector("dialog");
    return !!dialogEl && dialogEl.contains(document.activeElement);
  });
  expect(initialFocusIsInsideDialog).toBe(true);

  // Tab repeatedly and confirm focus never reaches an actual control
  // outside the dialog — the one check jsdom has no engine to make at all.
  //
  // Empirically (see close-out), the native <dialog> makes the rest of the
  // page inert but does not implement a fully circular Tab trap: pressing
  // Tab on the last tabbable element finds no next candidate (everything
  // else being inert) and settles on `document.body` for exactly one
  // press, before the following Tab restarts sequential navigation and
  // correctly lands back on the dialog's first tabbable. `document.body`
  // is not a control a visitor can act on, and every element that
  // genuinely is one — the header's own call to action, the page content
  // behind the scrim — stays unreachable throughout, so this checks that
  // stronger, accurate guarantee rather than requiring literal wraparound
  // a rebuild onto the native element does not provide for free.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const focusIsSafe = await page.evaluate(() => {
      const dialogEl = document.querySelector("dialog");
      const active = document.activeElement;
      return !!dialogEl && (dialogEl.contains(active) || active === document.body);
    });
    expect(focusIsSafe).toBe(true);
  }
});

test("Escape closes the menu and returns focus to Open menu", async ({ page }) => {
  await page.goto("/");
  const control = page.getByRole("button", { name: "Open menu" });

  await control.click();
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog", { name: "Menu" })).not.toBeVisible();
  await expect(control).toBeFocused();
});

test("clicking the backdrop closes the menu, returns focus, and paints the project's own scrim", async ({ page }) => {
  await page.goto("/");
  const control = page.getByRole("button", { name: "Open menu" });

  await control.click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();

  // The scrim is the dialog's native ::backdrop, styled with Tailwind's
  // `backdrop:` variant. jsdom does not render `::backdrop` at all, so a
  // regression to the browser's unstyled default (semi-transparent black,
  // no blur) would pass every unit test; reading the computed style here
  // is deterministic evidence, and this project's e2e suite has no
  // screenshot-baseline convention to fold a pixel-comparison into.
  const backdropStyle = await page.evaluate(() => {
    const dialogEl = document.querySelector("dialog");
    if (!dialogEl) return null;
    const style = getComputedStyle(dialogEl, "::backdrop");
    return { backgroundColor: style.backgroundColor, backdropFilter: style.backdropFilter };
  });
  expect(backdropStyle?.backgroundColor).toBe("rgba(2, 11, 26, 0.6)");
  expect(backdropStyle?.backdropFilter?.toLowerCase()).toContain("blur");

  // A point inside the viewport but outside the drawer panel, which sits
  // against the right edge at up to 82vw wide.
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("mobile-chromium must report a viewport size");
  await page.mouse.click(8, Math.round(viewport.height / 2));

  await expect(dialog).not.toBeVisible();
  await expect(control).toBeFocused();
});

test("choosing Schedule a call inside the menu closes it and returns focus once the booking dialog closes", async ({ page }) => {
  await page.goto("/");
  const control = page.getByRole("button", { name: "Open menu" });

  await control.click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await dialog.getByRole("button", { name: "Schedule a call" }).click();

  await expect(dialog).not.toBeVisible();
  await expect(page.locator("iframe").first()).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.locator("iframe").first()).not.toBeVisible();
  await expect(control).toBeFocused();
});
