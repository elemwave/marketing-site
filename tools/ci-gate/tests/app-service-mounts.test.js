import { describe, expect, it } from 'vitest';
import { executableLines, readRepoFile } from './sh.js';

/** The list entries under the `volumes:` key of one Compose service. */
function serviceVolumes(compose, service) {
  const entries = [];
  let inService = false;
  let volumesIndent = null;
  for (const line of executableLines(compose)) {
    if (line.trim() === '') continue;
    const indent = line.search(/\S/);
    if (indent === 2 && /^\s*[\w-]+:\s*$/.test(line)) {
      inService = line.trim() === `${service}:`;
      volumesIndent = null;
      continue;
    }
    if (!inService) continue;
    if (volumesIndent !== null && indent > volumesIndent && /^\s*-\s*/.test(line)) {
      entries.push(line.replace(/^\s*-\s*/, '').replace(/^['"]|['"]\s*$/g, '').trim());
      continue;
    }
    volumesIndent = /^\s*volumes:\s*$/.test(line) ? indent : null;
  }
  return entries;
}

describe('app service mounts', () => {
  it('mounts the shared config directory read-only where the vitest config imports it from', () => {
    const volumes = serviceVolumes(readRepoFile('docker-compose.yml'), 'app');

    expect(volumes).toContain('./projects/marketing:/app');
    expect(volumes).toContain('./config:/config:ro');
  });
});
