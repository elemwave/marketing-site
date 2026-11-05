import { expect, test, type Page } from "@playwright/test";

/**
 * The research tree in a real browser: choosing a problem in The challenges
 * marks the Our Solution items answering it and the carousel dots of the
 * papers supporting them, by pointer and by keyboard, and a reload starts
 * again from the first problem.
 */
const problems = (page: Page) => page.locator("#problems");
const software = (page: Page) => page.locator("#software");
const science = (page: Page) =>
  page.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "Peer-Reviewed Publications" }) });

const relatedSolutions = (page: Page) =>
  software(page).locator('button[data-relation="related"]').evaluateAll((buttons) => buttons.map((b) => b.textContent));
const relatedDots = (page: Page) =>
  science(page).locator('button[data-relation="related"]').evaluateAll((dots) => dots.map((d) => d.getAttribute("aria-label")));

test("highlights solutions and papers when a problem is chosen by pointer", async ({ page }) => {
  await page.goto("/");

  await problems(page).getByRole("button", { name: "Conducted susceptibility" }).click();

  await expect.poll(() => relatedSolutions(page)).toEqual(["Cable Solver"]);
  await expect.poll(() => relatedDots(page)).toEqual(["Go to slide 10"]);
  await expect(software(page).getByRole("button", { name: "HPC" })).toBeEnabled();
  await expect(science(page).getByText(/^Supporting papers for Conducted susceptibility:/)).toBeVisible();
});

test("chooses a problem with the keyboard and announces the relationship", async ({ page }) => {
  await page.goto("/");
  const lightning = problems(page).getByRole("button", { name: "Lightning" });

  await lightning.focus();
  await page.keyboard.press("Enter");

  await expect(lightning).toHaveAttribute("aria-pressed", "true");
  await expect(software(page).getByRole("button", { name: "Cable Solver" })).toHaveAccessibleDescription("Answers Lightning");
  await expect(science(page).getByRole("button", { name: "Go to slide 6" })).toHaveAccessibleDescription("Supports Lightning");
  await expect(problems(page).getByText(/^Lightning leads to 3 solutions and 3 supporting papers/)).toBeVisible();
});

test("returns to the first problem after a reload", async ({ page }) => {
  await page.goto("/");
  await problems(page).getByRole("button", { name: "Radar cross section" }).click();
  await expect.poll(() => relatedSolutions(page)).toEqual(["Conformal modelling", "FDTD solver", "DGTD solver"]);

  await page.reload();

  await expect(problems(page).getByRole("button", { name: "Radiated emissions" })).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => relatedSolutions(page)).toEqual(["Multilayer surface impedances", "Cable Solver"]);
});

test("keeps the carousel dots in place when papers are marked", async ({ page }) => {
  await page.goto("/");
  const dots = science(page).getByRole("button", { name: /^Go to slide \d+$/ });
  const positions = () => dots.evaluateAll((all) => all.map((d) => Math.round(d.getBoundingClientRect().left)));
  await problems(page).getByRole("button", { name: "Radar cross section" }).click();
  await expect.poll(() => relatedDots(page)).toEqual([]);
  const unmarked = await positions();

  await problems(page).getByRole("button", { name: "Lightning" }).click();

  await expect.poll(() => relatedDots(page)).toEqual(["Go to slide 6", "Go to slide 7", "Go to slide 10"]);
  expect(await positions()).toEqual(unmarked);
});
