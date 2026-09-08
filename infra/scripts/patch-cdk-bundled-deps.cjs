const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const packageName = "brace-expansion";
const expectedVersion = "5.0.9";
const source = path.join(projectRoot, "node_modules", packageName);
const target = path.join(
  projectRoot,
  "node_modules",
  "aws-cdk-lib",
  "node_modules",
  packageName,
);

function packageVersion(directory) {
  const packageJson = path.join(directory, "package.json");

  if (!fs.existsSync(packageJson)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(packageJson, "utf8")).version;
}

const sourceVersion = packageVersion(source);

if (sourceVersion !== expectedVersion) {
  throw new Error(
    `${packageName}@${expectedVersion} is required at ${source}; found ${
      sourceVersion || "nothing"
    }.`,
  );
}

if (packageVersion(target) === expectedVersion) {
  process.exit(0);
}

// aws-cdk-lib bundles an older brace-expansion release; replace it until AWS
// publishes a CDK bundle that includes GHSA-rgw5-rvv9-x895's patched release.
// The lockfile also un-bundles this path so `npm ci` installs the patched
// release directly; any dependency update that regenerates the lockfile
// restores `"inBundle": true` and reintroduces the advisory, so that edit has
// to be re-applied alongside every brace-expansion update here.
fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });

const patchedVersion = packageVersion(target);

if (patchedVersion !== expectedVersion) {
  throw new Error(
    `Failed to patch aws-cdk-lib bundled ${packageName}; found ${
      patchedVersion || "nothing"
    }.`,
  );
}
