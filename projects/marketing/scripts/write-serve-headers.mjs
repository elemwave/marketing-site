import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import inlineScriptHashes from "../../../tools/inline-script-hashes/index.js";

const { applyHashes, collectHashes } = inlineScriptHashes;

const projectRoot = resolve(import.meta.dirname, "..");
const exportDirectory = join(projectRoot, "out");
const headers = JSON.parse(
  readFileSync(resolve(projectRoot, "..", "..", "config", "security-headers.json"), "utf8"),
);

const hashes = collectHashes(exportDirectory);
const policy = applyHashes(headers.documentContentSecurityPolicy, hashes);

writeFileSync(
  join(exportDirectory, "serve.json"),
  `${JSON.stringify(
    {
      headers: [
        {
          source: "**/*.html",
          headers: [
            { key: "Content-Security-Policy", value: policy },
            { key: "X-Content-Type-Options", value: headers.contentTypeOptions },
          ],
        },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(`Wrote out/serve.json with ${hashes.length} inline script hashes.`);
