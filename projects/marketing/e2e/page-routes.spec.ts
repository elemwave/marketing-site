import { expect, test } from "@playwright/test";

type RouteCase = {
  path: string;
  heading: string;
  aliases?: string[];
};

const ROUTES = [
  {
    path: "/",
    heading: "INNOVATIVE SOLUTIONS FOR ADVANCED ELECTROMAGNETICS SIMULATIONS",
  },
  { path: "/partnerships", heading: "Partnerships Built On Technical Trust" },
  {
    path: "/team",
    heading: "The people behind Elemwave",
    aliases: ["/team/"],
  },
  { path: "/contact", heading: "Contact us" },
  { path: "/integrated-policy", heading: "Integrated policy" },
  { path: "/privacy-policy", heading: "Privacy policy" },
  { path: "/missing-page-for-route-test", heading: "Page not found" },
] satisfies RouteCase[];

test("route table has no duplicate canonical paths", () => {
  const canonicalPaths = ROUTES.map(({ path }) =>
    path === "/" ? path : path.replace(/\/$/, ""),
  );

  expect(new Set(canonicalPaths).size).toBe(canonicalPaths.length);
});

for (const { path, heading, aliases = [] } of ROUTES) {
  test(`${path} loads and presents its primary heading`, async ({ page }) => {
    for (const routePath of [path, ...aliases]) {
      const response = await page.goto(routePath);

      expect(response).not.toBeNull();
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });
}

test("/team frames each staff portrait to its own proportions, so cover crops nothing", async ({
  page,
}) => {
  await page.goto("/team");

  for (const name of [
    "Salvador G. García",
    "Luis D. Angulo",
    "Jose Diaz",
    "Amelia Rubio Bretones",
    "Rafael Gómez Martín",
  ]) {
    const portrait = page.getByRole("img", { name });
    await expect(portrait).toBeVisible();

    const box = await portrait.boundingBox();
    expect(box).not.toBeNull();

    const natural = await portrait.evaluate((img: HTMLImageElement) => ({
      width: img.naturalWidth,
      height: img.naturalHeight,
    }));

    // A frame ratio matching the source image's own ratio is what makes
    // `object-fit: cover` crop nothing: the two scale together with no overflow.
    expect(box!.width / box!.height).toBeCloseTo(natural.width / natural.height, 2);
    await expect(portrait).toHaveCSS("object-position", "50% 0%");
  }
});

const FOOTER_OUTLINE_ROUTES = ["/", "/contact", "/partnerships", "/privacy-policy"];

for (const path of FOOTER_OUTLINE_ROUTES) {
  test(`${path} nests footer column headings under the Footer landmark`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole("contentinfo", { name: "Footer" })).toBeVisible();

    const footerOutline = await page
      .locator("footer h2, footer h3")
      .evaluateAll((headings) =>
        headings.map((heading) => ({
          level: Number(heading.tagName.substring(1)),
          name: heading.textContent?.trim().replace(/\s+/g, " "),
        })),
      );

    expect(footerOutline).toEqual([
      { level: 2, name: "Footer" },
      { level: 3, name: "Policies" },
      { level: 3, name: "Quick Links" },
      { level: 3, name: "Get In Touch" },
    ]);
  });
}
