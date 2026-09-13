import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile, ROOT } from './sh.js';

const APPROVED_REGISTRY = 'public.ecr.aws/docker/library/';

function packageVersion(name) {
  const manifest = JSON.parse(readRepoFile('projects/marketing/package.json'));
  return { ...manifest.dependencies, ...manifest.devDependencies }[name];
}

function filesUnder(directory, extension) {
  return readdirSync(path.join(ROOT, directory), { recursive: true })
    .filter((file) => file.endsWith(extension))
    .map((file) => path.join(directory, file));
}

function extract(file, patterns) {
  return executableLines(readRepoFile(file)).flatMap((line) =>
    patterns
      .map((pattern) => pattern.exec(line))
      .filter(Boolean)
      .map((match) => ({ file, image: match[1] })),
  );
}

const IMAGE_LINE = /^\s*(?:image|container):\s*['"]?([^'"\s$]+)/;

function references() {
  return {
    Makefile: extract('Makefile', [/^\s*[A-Z_]*IMAGE\s*[:?]?=\s*(\S+)/]),
    Dockerfile: extract('Dockerfile', [/^FROM\s+(\S+)/i]),
    'docker-compose.yml': extract('docker-compose.yml', [IMAGE_LINE]),
    scripts: filesUnder('scripts', '.sh').flatMap((file) =>
      extract(file, [/_IMAGE:-([^}"'\s]+)/, /^\s*(?:readonly\s+)?[A-Z_]*IMAGE=["']?([^"'$\s]+)["']?\s*$/]),
    ),
    workflows: filesUnder('.github/workflows', '.yml').flatMap((file) => extract(file, [IMAGE_LINE])),
  };
}

describe('container image provenance', () => {
  const found = references();

  it('finds the image references it is meant to check', () => {
    expect(found.Makefile.length).toBeGreaterThanOrEqual(2);
    expect(found.Dockerfile.length).toBeGreaterThanOrEqual(1);
    expect(found['docker-compose.yml'].length).toBeGreaterThanOrEqual(1);
    expect(found.scripts.length).toBeGreaterThanOrEqual(1);
  });

  it('pulls every image from the approved registry, the pinned Playwright image excepted', () => {
    const playwrightVersion = packageVersion('@playwright/test');
    expect(playwrightVersion).toMatch(/^\d+\.\d+\.\d+$/);
    const playwrightImage = `mcr.microsoft.com/playwright:v${playwrightVersion}-noble`;

    const offending = Object.values(found)
      .flat()
      .filter(({ image }) => !image.startsWith(APPROVED_REGISTRY) && image !== playwrightImage);

    expect(offending).toEqual([]);
  });

  it('pins every Node image to the major version the workflows run', () => {
    const workflowMajors = filesUnder('.github/workflows', '.yml').flatMap((file) =>
      [...readRepoFile(file).matchAll(/NODE_VERSION:\s*["']?(\d+)/g)].map((match) => match[1]),
    );
    expect(workflowMajors.length).toBeGreaterThanOrEqual(1);
    expect(new Set(workflowMajors).size).toBe(1);

    const nodeImages = Object.values(found)
      .flat()
      .filter(({ image }) => /\/node:/.test(image) || /^node:/.test(image));
    expect(nodeImages.length).toBeGreaterThanOrEqual(3);
    for (const { image } of nodeImages) {
      expect(image).toMatch(new RegExp(`node:${workflowMajors[0]}(?:[.-]|$)`));
    }
  });

  it('pins every other official image to a major version', () => {
    const unpinned = Object.values(found)
      .flat()
      .filter(({ image }) => image.startsWith(APPROVED_REGISTRY))
      .filter(({ image }) => !/:\d+/.test(image));
    expect(unpinned).toEqual([]);
  });
});
