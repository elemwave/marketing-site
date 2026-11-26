import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import inlineScriptHashes from "../../../tools/inline-script-hashes/index.js";

const { listHtmlFiles } = inlineScriptHashes;

// One attribute-less inline script carrying a chunk of the page data. Next escapes `<` inside the
// data, so the first `</script>` after the opening tag is always the script's own end.
const FLIGHT_SCRIPT = String.raw`<script>(self\.__next_f\.push\(\[1,(?:(?!<\/script>)[\s\S])*)<\/script>`;
const FLIGHT_RUN = new RegExp(`${FLIGHT_SCRIPT}(?:\\s*${FLIGHT_SCRIPT})+`, "g");
const SINGLE_FLIGHT_SCRIPT = new RegExp(FLIGHT_SCRIPT, "g");

/**
 * Next writes the page data as one inline script per chunk the runtime hands it, and how many chunks
 * that is depends on the Node version (one on Node 24, nineteen on the home page on Node 26). The
 * content policy names every inline script by hash, so the chunking decides how long the policy is.
 * Joining each run of adjacent page-data scripts into one script runs the same calls in the same
 * order and makes the count independent of the runtime.
 */
export function coalesceFlightScripts(html) {
  return html.replace(FLIGHT_RUN, (run) =>
    `<script>${[...run.matchAll(SINGLE_FLIGHT_SCRIPT)].map((match) => match[1]).join(";")}</script>`,
  );
}

export function coalesceExport(exportDirectory) {
  let rewritten = 0;
  for (const file of listHtmlFiles(exportDirectory)) {
    const html = readFileSync(file, "utf8");
    const coalesced = coalesceFlightScripts(html);
    if (coalesced === html) continue;
    writeFileSync(file, coalesced);
    rewritten += 1;
  }
  return rewritten;
}

function run() {
  const exportDirectory = join(resolve(import.meta.dirname, ".."), "out");
  console.log(`Joined the page-data scripts of ${coalesceExport(exportDirectory)} pages in ${exportDirectory}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();
