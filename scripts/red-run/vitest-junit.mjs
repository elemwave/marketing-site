// Writes Vitest's JSON results for one test file as the junit report Node's
// own test runner writes, for scripts/red-run/node.sh: the Overboards red run
// reads a node test's results from that report.
//
// Each test is a testcase named by its describe blocks and its own title
// joined with " > ", as the red run names a node test, and carrying the file
// it ran in. A failure's first line is written as the error's cause, as Node
// writes it. A file that failed without running a test (it did not load, for
// example) is a testcase named by the file itself.
//
// Usage: node scripts/red-run/vitest-junit.mjs <results.json> <file> <report.xml>
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [resultsPath, file, reportPath] = process.argv.slice(2);
const results = JSON.parse(readFileSync(resultsPath, 'utf8'));

const escape = (text) =>
    String(text).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);

function failure(messages) {
    const message = messages.join('\n');
    const cause = message.split('\n')[0];
    return `<failure message="${escape(cause)}">${escape(message)}\n  cause: ${escape(cause)}</failure>`;
}

function testcase(name, body) {
    return `<testcase name="${escape(name)}" file="${escape(file)}">${body}</testcase>`;
}

const cases = [];
for (const result of results.testResults ?? []) {
    if (!result.name.endsWith(path.sep + file)) {
        continue;
    }
    for (const test of result.assertionResults ?? []) {
        const name = [...(test.ancestorTitles ?? []), test.title].join(' > ');
        let body = '';
        if (test.status === 'failed') {
            body = failure(test.failureMessages ?? []);
        } else if (test.status !== 'passed') {
            body = '<skipped/>';
        }
        cases.push(testcase(name, body));
    }
    if ((result.assertionResults ?? []).length === 0 && result.status === 'failed') {
        cases.push(testcase(file, failure([result.message || 'the test file failed to run'])));
    }
}

writeFileSync(
    reportPath,
    `<?xml version="1.0" encoding="utf-8"?>\n<testsuites>\n${cases.map((c) => `  ${c}\n`).join('')}</testsuites>\n`,
);
