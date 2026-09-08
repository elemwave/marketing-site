# Supported browsers

The site is a static export, so support means the browsers whose rendering and
JavaScript the build targets and the browser suite exercises.

## Declared list

`browserslist` in [`projects/marketing/package.json`](../projects/marketing/package.json):

| Browser | From |
| :--- | :--- |
| Chrome | 111 |
| Edge | 111 |
| Firefox | 128 |
| Safari | 16.4 |

Those baselines are what the build's output targets. Anything older may load and
is not supported.

## What the tests cover

`playwright.config.ts` runs every spec across four projects: `chromium`,
`firefox`, `webkit` and `mobile-chromium`. Chromium covers Chrome and Edge, which
share an engine; WebKit covers Safari.

The declared list is therefore wider than the tested set in one respect: it names
version floors, and the suite runs whichever version ships with the pinned
Playwright image rather than each floor. Testing every floor would need a browser
matrix service, which is more than a four-page site warrants. The difference is
recorded here because a list that reads as fully covered when it is not is worse
than a narrower one.

## Running them

```sh
make e2e
```

`make up-prod` serves the same production bundle the suite runs against, on the
port `make up` uses.

Playwright runs in its official image, pinned to the same version as
`@playwright/test`, because the browsers need system libraries the host is not
expected to carry.
