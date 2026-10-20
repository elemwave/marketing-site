import { describe, expect, it } from 'vitest';
import { NPM_AUDIT_ARGUMENTS } from '../audit-command.js';

describe('NPM_AUDIT_ARGUMENTS', () => {
  it('requests the JSON report', () => {
    expect(NPM_AUDIT_ARGUMENTS).toEqual(expect.arrayContaining(['audit', '--json']));
  });

  it.each(['--omit', '--omit=dev', '--only', '--only=prod', '--production'])(
    'does not narrow the audit with %s, so development dependencies are covered',
    (flag) => {
      const narrowing = NPM_AUDIT_ARGUMENTS.filter(
        (argument) =>
          argument === flag || argument.startsWith('--omit') || argument.startsWith('--only'),
      );

      expect(narrowing).toEqual([]);
      expect(NPM_AUDIT_ARGUMENTS).not.toContain(flag);
    },
  );
});
