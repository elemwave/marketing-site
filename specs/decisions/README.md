# Architecture Decision Records

`specs/decisions/` stores ADRs that preserve architectural and workflow intent.

- Keep one ADR per decision, stating that decision as it stands today.
- Name each ADR file after the decision in lowercase, hyphen-separated form,
  with no sequence number, timestamp, or identifier prefix.
- Use the human-readable decision title as the ADR heading,
  with no identifier prefix.
- Reference an ADR by its full repository path,
  for example `specs/decisions/staging-on-s3-and-cloudfront.md`.
- When a decision changes, edit its ADR in place so it stays consolidated.
  Git history keeps the earlier versions.
- When two ADRs state overlapping positions, merge them into one.
- When a decision no longer applies, delete its ADR
  and update every reference to it.
- Do not add statuses, dates, or markers such as `Supersedes`, `Amends`,
  or `Superseded by`.
- Read relevant ADRs before changing areas they govern.

## Index

- [`automated-accessibility-inspection.md`](automated-accessibility-inspection.md)
- [`calendly-popup-modal-booking-dialog.md`](calendly-popup-modal-booking-dialog.md)
- [`production-on-s3-and-cloudfront.md`](production-on-s3-and-cloudfront.md)
- [`record-unpublished-trusted-branch-revisions.md`](record-unpublished-trusted-branch-revisions.md)
- [`shared-site-chrome-and-navigation.md`](shared-site-chrome-and-navigation.md)
- [`staging-on-s3-and-cloudfront.md`](staging-on-s3-and-cloudfront.md)
- [`verification-gate-tiers-and-ci-parity.md`](verification-gate-tiers-and-ci-parity.md)
