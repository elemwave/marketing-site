# Marketing App Packaging

How the marketing app's own developer README and published files stay
aligned with the site that actually ships.

### Requirement: The app-folder README describes the current site

The README beside the marketing app SHALL name the home-page file that
exists, the typefaces the site loads, and the hosting the project uses.
It MUST NOT send the reader to a home-page file that is absent, a
typeface the site does not load, or a host the project does not use.

#### Scenario: A developer reads the app-folder README
- **WHEN** a developer opens the README beside the marketing app
- **THEN** it names the home-page file `app/(home)/page.tsx`
- **AND** it names the typefaces Montserrat and Inter
- **AND** it describes hosting on S3 behind CloudFront
- **AND** it does not tell the reader to edit `app/page.tsx`
- **AND** it does not name Geist
- **AND** it does not recommend deploying on Vercel

### Requirement: The app-folder README points at the repository-root guide

The README beside the marketing app SHALL point a reader at the
repository-root README for first-time setup, day-to-day commands,
architecture, and deployment.
It MUST NOT restate those instructions.

#### Scenario: A developer looks for setup and deployment instructions
- **WHEN** a developer reads the README beside the marketing app for
  setup, commands, architecture, or deployment
- **THEN** it links to the repository-root README with the relative
  Markdown path `../../README.md`
- **AND** it does not copy those sections into itself

### Requirement: Leftover starter graphics are not published

The five leftover starter graphics SHALL NOT be present under the
marketing app's published-assets folder and SHALL NOT be returned at
their public addresses.

#### Scenario: The published-assets folder is listed
- **WHEN** the marketing app's published-assets folder is inspected
- **THEN** it does not contain `file.svg`, `globe.svg`, `next.svg`,
  `vercel.svg`, or `window.svg`

#### Scenario: A visitor requests a leftover starter graphic
- **WHEN** a visitor requests `/file.svg`, `/globe.svg`, `/next.svg`,
  `/vercel.svg`, or `/window.svg`
- **THEN** the response is not the leftover starter graphic
