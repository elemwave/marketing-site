/**
 * The plugin version the shape baseline was last measured with, held against
 * the version the lock file resolves.
 *
 * Pure functions, unit-tested; `check-shape-plugin-pin.mjs` reads the files.
 */

export const pinnedPlugin = "eslint-plugin-sonarjs";

export function readLockedVersion(lock, name) {
  return lock?.packages?.[`node_modules/${name}`]?.version;
}

export function comparePin(recorded, locked) {
  if (locked === undefined) {
    return {
      ok: false,
      message: `package-lock.json has no entry for ${pinnedPlugin}, so the shape reading cannot be tied to a version.`,
    };
  }
  if (recorded === undefined) {
    return {
      ok: false,
      message:
        `shape-plugin-version.json records no version for ${pinnedPlugin} (locked ${locked}). ` +
        "Run `make shape-complexity`, then `make shape-complexity-update`.",
    };
  }
  if (recorded !== locked) {
    return {
      ok: false,
      message:
        `${pinnedPlugin} is locked at ${locked} but the shape baseline was measured with ${recorded}. ` +
        "`make lint` never loads this plugin: run `make shape-complexity` to read the new measurement, " +
        "then `make shape-complexity-update` to record it with the version.",
    };
  }
  return { ok: true };
}
