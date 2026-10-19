#!/usr/bin/env node
/**
 * Fails when `eslint-plugin-sonarjs` is locked at a version the shape baseline
 * was not measured with.
 *
 * Exit codes:
 *   0  the recorded and locked versions agree
 *   1  the lock has moved past the record (or the record is missing)
 *   2  either file is unusable
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  comparePin,
  pinnedPlugin,
  readLockedVersion,
} from "./shape-plugin-pin.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const lockFile = path.join(projectRoot, "package-lock.json");
const recordFile = path.join(projectRoot, "shape-plugin-version.json");

function readJson(file, required) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    if (!required && error.code === "ENOENT") return {};
    console.error(`${path.basename(file)} is unusable: ${error.message}`);
    process.exit(2);
  }
  return {};
}

const locked = readLockedVersion(readJson(lockFile, true), pinnedPlugin);

if (process.argv[2] === "--record") {
  if (locked === undefined) {
    console.error(`package-lock.json has no entry for ${pinnedPlugin}.`);
    process.exit(2);
  }
  writeFileSync(
    recordFile,
    `${JSON.stringify({ [pinnedPlugin]: locked }, null, 2)}\n`,
  );
  process.exit(0);
}

const result = comparePin(readJson(recordFile, false)[pinnedPlugin], locked);
if (!result.ok) {
  console.error(result.message);
  process.exit(1);
}
process.exit(0);
