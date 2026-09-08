# Performance budget

The site is a static export served from CloudFront, so what a visitor waits for
is entirely what the export contains.
The budget holds three numbers against limits enforced in CI by the
`Performance budget` job.

## Scenario

A first visit to the static export: every JavaScript chunk the browser
downloads, the heaviest single image on any page, and the total weight of
everything published.

## Metrics

| Metric | What it covers | Why |
| :--- | :--- | :--- |
| `javascriptGzippedBytes` | Every `.js` file under `_next/static`, gzipped | What the browser parses and executes before the page is interactive |
| `largestImageBytes` | The heaviest single image in the export | One oversized asset delays a page on its own, and an average hides it |
| `totalExportBytes` | Everything published | The ceiling on what the site can cost a visitor |

JavaScript alone would not be a useful budget here.
At the measurement below it is under three per cent of the export;
the weight is almost entirely images, and `next/image` runs with
`unoptimized: true` because a static export has no Image Optimization API.
A budget watching only the bundle would stay green regardless of what the site
actually weighs.

## Limits

Recorded in [`projects/marketing/performance-budget.json`](../projects/marketing/performance-budget.json),
with the measurement and its date beside each limit.
They sit just above the measurement so ordinary build variation does not fail
the gate: the same figure measured locally and on a runner differed by 13 kB.

The limits encode the weight on the day they were set, problems included.
They stop it growing; they do not make it good.
Shrinking the images is separate work.

## Changing a limit

Raising one is a decision, not maintenance.
Record why in the pull request that raises it.
Lowering one after real improvement is ordinary and needs no ceremony.

## Running it

```sh
make app-build
make performance-budget
```
