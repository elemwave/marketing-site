import { describe, expect, it } from 'vitest';
import { readRepoFile, sh } from './sh.js';

/** The list entries under every `ports:` key in a Compose file. */
function publishedPorts(compose) {
  const entries = [];
  let portsIndent = null;
  for (const line of compose.split('\n')) {
    const indent = line.search(/\S/);
    if (portsIndent !== null && indent > portsIndent && /^\s*-\s*/.test(line)) {
      entries.push(line.replace(/^\s*-\s*/, '').replace(/^['"]|['"]\s*$/g, '').trim());
      continue;
    }
    portsIndent = /^\s*ports:\s*$/.test(line) ? indent : null;
  }
  return entries;
}

describe('published host ports', () => {
  it('takes every published host port from a variable with a default', () => {
    const ports = publishedPorts(readRepoFile('docker-compose.yml'));

    expect(ports.length).toBeGreaterThanOrEqual(1);
    for (const entry of ports) {
      expect(entry).toMatch(/^\$\{[A-Z_]+:-\d+\}:\d+$/);
    }
    expect(ports).toContain('${APP_HTTP_PORT:-80}:80');
  });

  it('prints the address without a port suffix on port 80', () => {
    const { stdout, status } = sh('sh scripts/print-urls.sh 80');
    expect(status).toBe(0);
    expect(stdout).toBe('app: http://test.localhost.elemwave.com\n');
  });

  it('prints the address with any other port', () => {
    const { stdout, status } = sh('sh scripts/print-urls.sh 8081');
    expect(status).toBe(0);
    expect(stdout).toBe('app: http://test.localhost.elemwave.com:8081\n');
  });

  it('is what make urls runs, with the port make exports', () => {
    const makefile = readRepoFile('Makefile');
    expect(makefile).toMatch(/^export APP_HTTP_PORT \?= 80$/m);
    expect(makefile).toMatch(/^urls: ## .*\n\t@sh scripts\/print-urls\.sh "\$\(APP_HTTP_PORT\)"$/m);
  });
});
