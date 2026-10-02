# Guard the shared chrome with screenshot baselines in the browser gate

## Context

The gate checked behaviour, structure and measured geometry, but nothing
compared how a page looks. Two reachable regressions, a background leaking
across sections and an invisible heading underline on a dark band, passed every
check and review and were found by eye.

## Decision

- **Playwright screenshot comparison.**
  `projects/marketing/e2e/visual-regression.spec.ts` captures the header, both
  heroes, the page wrapper on a short and a tall page, and the shared section
  heading in each background context, and compares them with baselines
  committed beside it.
- **Desktop Chromium only.**
  The spec is ignored in the other Playwright projects.
  Both known regressions are layout and colour defects visible in any browser;
  coverage widens if a browser-specific defect ever reaches staging.
- **Inside the existing `Browser tests` stage.**
  No new gate stage: `make e2e` runs it in the pinned Playwright image.
- **Baselines come only from the pinned image.**
  `make e2e-update-visuals` rewrites them there, so every machine renders the
  same pixels.
- **A strict tolerance.**
  The comparison allows 50 differing pixels.
  A ratio-based tolerance was tried and let the invisible underline through,
  because the bar is a tiny fraction of its capture.
- **Budget.**
  The check adds a few seconds to the browser stage, well inside the agreed
  ceiling of about 2 minutes.
