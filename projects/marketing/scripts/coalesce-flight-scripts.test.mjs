import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { coalesceExport, coalesceFlightScripts } from "./coalesce-flight-scripts.mjs";

const push = (text) => `<script>self.__next_f.push([1,${JSON.stringify(text)}])</script>`;

test("adjacent page-data scripts become one script, in order", () => {
  const html = `<body>${push("a")}${push("b")}${push("c")}</body>`;
  expect(coalesceFlightScripts(html)).toBe(
    `<body><script>self.__next_f.push([1,"a"]);self.__next_f.push([1,"b"]);self.__next_f.push([1,"c"])</script></body>`,
  );
});

test("a single page-data script is left exactly as it is", () => {
  const html = `<body>${push("a")}</body>`;
  expect(coalesceFlightScripts(html)).toBe(html);
});

test("whitespace between page-data scripts does not keep them apart", () => {
  expect(coalesceFlightScripts(`${push("a")}\n  ${push("b")}`)).toBe(
    `<script>self.__next_f.push([1,"a"]);self.__next_f.push([1,"b"])</script>`,
  );
});

test("the bootstrap script, other inline scripts and scripts with attributes or a source stay separate", () => {
  const bootstrap = "<script>(self.__next_f=self.__next_f||[]).push([0])</script>";
  const jsonLd = `<script type="application/ld+json">{"a":1}</script>`;
  const external = `<script src="/x.js" async=""></script>`;
  const html = `${jsonLd}${bootstrap}${push("a")}${external}${push("b")}<script>other()</script>${push("c")}${push("d")}`;
  expect(coalesceFlightScripts(html)).toBe(
    `${jsonLd}${bootstrap}${push("a")}${external}${push("b")}<script>other()</script>` +
      `<script>self.__next_f.push([1,"c"]);self.__next_f.push([1,"d"])</script>`,
  );
});

test("markup between two page-data scripts keeps them apart", () => {
  const html = `${push("a")}<div></div>${push("b")}`;
  expect(coalesceFlightScripts(html)).toBe(html);
});

test("a second pass changes nothing", () => {
  const once = coalesceFlightScripts(`${push("a")}${push("b")}`);
  expect(coalesceFlightScripts(once)).toBe(once);
});

test("page data containing quotes, semicolons and escaped markup is carried through untouched", () => {
  const tricky = 'a;b"c\\u003c/script>';
  const out = coalesceFlightScripts(`${push(tricky)}${push("b")}`);
  expect(out).toBe(`<script>self.__next_f.push([1,${JSON.stringify(tricky)}]);self.__next_f.push([1,"b"])</script>`);
});

describe("coalesceExport", () => {
  let exportDirectory;
  beforeEach(() => {
    exportDirectory = mkdtempSync(join(tmpdir(), "coalesce-export-"));
  });
  afterEach(() => rmSync(exportDirectory, { recursive: true, force: true }));

  test("rewrites only the pages whose page-data scripts it joins, nested pages included", () => {
    const split = `<body>${push("a")}${push("b")}</body>`;
    const single = `<body>${push("a")}</body>`;
    mkdirSync(join(exportDirectory, "team"));
    writeFileSync(join(exportDirectory, "index.html"), split);
    writeFileSync(join(exportDirectory, "team", "index.html"), split);
    writeFileSync(join(exportDirectory, "contact.html"), single);
    writeFileSync(join(exportDirectory, "index.txt"), split);

    expect(coalesceExport(exportDirectory)).toBe(2);

    const joined = `<body><script>self.__next_f.push([1,"a"]);self.__next_f.push([1,"b"])</script></body>`;
    expect(readFileSync(join(exportDirectory, "index.html"), "utf8")).toBe(joined);
    expect(readFileSync(join(exportDirectory, "team", "index.html"), "utf8")).toBe(joined);
    expect(readFileSync(join(exportDirectory, "contact.html"), "utf8")).toBe(single);
    expect(readFileSync(join(exportDirectory, "index.txt"), "utf8")).toBe(split);
  });

  test("a second run over the same export rewrites nothing", () => {
    writeFileSync(join(exportDirectory, "index.html"), `${push("a")}${push("b")}`);
    coalesceExport(exportDirectory);
    expect(coalesceExport(exportDirectory)).toBe(0);
  });
});
