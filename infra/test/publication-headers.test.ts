import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const workflow = readFileSync(join(__dirname, '../../.github/workflows/deploy.yml'), 'utf8');

function namedStepScript(name: string): string {
    const heading = `- name: ${name}`;
    const start = workflow.indexOf(heading);

    if (start === -1) {
        throw new Error(`deploy.yml has no step named ${name}`);
    }

    const fromHeading = workflow.slice(start);
    const nextStep = fromHeading.indexOf('\n      - name: ', heading.length);
    const block = nextStep === -1 ? fromHeading : fromHeading.slice(0, nextStep);
    const runMarker = block.search(/\n\s+run:\s+\|\n/);

    if (runMarker === -1) {
        throw new Error(`step ${name} has no run script`);
    }

    return block.slice(runMarker).replace(/^\n\s+run:\s+\|\n/, '');
}

describe('publication Cache-Control headers', () => {
    it('uploads hashed build assets as immutable for a year', () => {
        const script = namedStepScript('Upload fingerprinted assets');

        expect(script).toContain('aws s3 sync projects/marketing/out/_next/static');
        expect(script).toContain('--cache-control "public, max-age=31536000, immutable"');
    });

    it('uploads public images with a one-day browser lifetime and a long shared-cache lifetime', () => {
        const script = namedStepScript('Upload public images');

        expect(script).toContain('aws s3 sync projects/marketing/out/images');
        expect(script).toContain('s3://$SITE_BUCKET/images');
        expect(script).toContain('--delete');
        expect(script).toContain('--cache-control "public, max-age=86400, s-maxage=31536000"');
    });

    it('uploads remaining objects so browsers revalidate and the site cache keeps them', () => {
        const script = namedStepScript('Upload page documents');

        expect(script).toContain('aws s3 sync projects/marketing/out "s3://$SITE_BUCKET"');
        expect(script).toContain('--delete');
        expect(script).toContain('--exclude "_next/static/*"');
        expect(script).toContain('--exclude "images/*"');
        expect(script).toContain('--cache-control "public, max-age=0, s-maxage=31536000, must-revalidate"');
    });
});
