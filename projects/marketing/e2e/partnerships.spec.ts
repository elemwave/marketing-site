import { expect, test } from "@playwright/test";

test("the partner marquee sits above the band it is tucked under", async ({ page }) => {
  await page.goto("/partnerships");

  // Freeze the strip so the card measured is the card queried.
  await page.addStyleTag({
    content: ".animate-logo-scroll { animation: none !important; }",
  });

  const firstLogo = page.getByRole("img", { name: "Airbus" });
  await expect(firstLogo).toBeVisible();

  const box = await firstLogo.boundingBox();
  if (!box) throw new Error("the first partner logo has no box to measure");

  // The band above is positioned, so without its own stacking the strip would
  // paint underneath it and every card would lose its top edge.
  const painted = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.tagName.toLowerCase(),
    { x: box.x + box.width / 2, y: box.y + 2 },
  );

  expect(painted).toBe("img");
});
