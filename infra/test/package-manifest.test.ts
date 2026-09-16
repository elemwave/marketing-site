import { readFileSync } from 'node:fs';
import { join } from 'node:path';

type PackageManifest = {
    name: string;
    bin?: unknown;
};

type PackageLock = {
    name: string;
    packages: {
        '': {
            name?: string;
            bin?: unknown;
        };
    };
};

function readJson<T>(filename: string): T {
    return JSON.parse(readFileSync(join(__dirname, '..', filename), 'utf8')) as T;
}

describe('infrastructure package identity', () => {
    const manifest = readJson<PackageManifest>('package.json');
    const lockfile = readJson<PackageLock>('package-lock.json');
    const rootPackage = lockfile.packages[''];

    it('names the package without a staging-only qualifier', () => {
        expect(manifest.name).toBe('elemwave_website');
        expect(manifest.name).not.toContain('staging');
    });

    it('does not advertise a command whose target file is absent', () => {
        expect(manifest).not.toHaveProperty('bin');
    });

    it('records the same environment-neutral name in the lockfile', () => {
        expect(lockfile.name).toBe(manifest.name);
        expect(rootPackage.name).toBe(manifest.name);
        expect(rootPackage).not.toHaveProperty('bin');
    });
});
