const { createHash } = require("node:crypto");
const { readFileSync, readdirSync } = require("node:fs");
const { join, extname } = require("node:path");

const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g;

function listHtmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(path);
    return extname(path) === ".html" ? [path] : [];
  });
}

function hashesForHtml(html) {
  return [...html.matchAll(INLINE_SCRIPT)].map(
    (match) => `sha256-${createHash("sha256").update(match[1], "utf8").digest("base64")}`,
  );
}

function collectHashes(exportDirectory) {
  const hashes = new Set();
  for (const file of listHtmlFiles(exportDirectory)) {
    for (const hash of hashesForHtml(readFileSync(file, "utf8"))) hashes.add(hash);
  }
  return [...hashes].sort();
}

function applyHashes(policy, hashes) {
  const quoted = hashes.map((hash) => `'${hash}'`).join(" ");
  return policy.replace("script-src 'self'", `script-src 'self' ${quoted}`);
}

module.exports = { listHtmlFiles, hashesForHtml, collectHashes, applyHashes };
