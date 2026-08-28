# Elemwave Website

Marketing website for Elemwave,
built with [Next.js](https://nextjs.org/) 16, React 19, TypeScript and Tailwind CSS 4.
The app lives in [`projects/marketing/`](./projects/marketing) and runs in Docker behind an nginx reverse proxy.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) with the Compose plugin
- GNU Make

No local Node.js installation is needed;
all npm commands run inside the app container.

## First-time setup

1. Build the image, install dependencies and start the containers:

   ```sh
   make init
   ```

2. Open http://test.localhost.elemwave.com in your browser.

The dev server runs with hot reload;
changes under `projects/marketing/` are picked up automatically.

## Day-to-day commands

Run `make help` for the full list. The most useful targets:

| Command          | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `make up`        | Start containers (detached)                          |
| `make stop`      | Stop containers                                      |
| `make logs`      | Follow container logs (`c=app` for a single service) |
| `make bash`      | Open a shell in the app container                    |
| `make install`   | Install dependencies (`npm ci`)                      |
| `make lint`      | Lint the app                                         |
| `make app-build` | Static export of the app (`projects/marketing/out`)  |
| `make rm`        | Stop and remove containers and volumes               |

## Architecture

- **app** — Next.js dev server (`npm run dev`) on port 3000, with `projects/marketing/` bind-mounted into the container and `node_modules` kept in a named volume.
- **nginx** — reverse proxy listening on port 80, serving `test.localhost.elemwave.com` and proxying to the app (including WebSocket upgrades for HMR).

The app declares that hostname in `allowedDevOrigins`
([`projects/marketing/next.config.ts`](./projects/marketing/next.config.ts))
so the Next.js dev server accepts requests proxied from it.

The [`Dockerfile`](./Dockerfile) provides the `base` target Compose uses for development.
There is no production image:
the site is a static export (`output: "export"`),
served from S3 behind CloudFront.

## Deployment

Pushing to the `staging` branch publishes the site to
`https://staging.elemwave.com` through the
[Deploy staging](./.github/workflows/deploy-staging.yml) workflow.
Staging is behind shared basic auth credentials and is excluded from search engines.

The AWS resources are defined with CDK in [`infra/`](./infra);
its [README](./infra/README.md) holds the one-off setup runbook.

## Project structure

```
projects/
  marketing/ Next.js app (pages, components, styles)
infra/       AWS CDK definitions for the staging environment
docker/      nginx configuration
specs/       Living specifications and style guide
docs/        Framework capability docs
```

## Contributing

This repository follows the Aircury engineering framework —
read [FRAMEWORK.md](./FRAMEWORK.md) before making changes.
Canonical behaviour specs live in `specs/features/`.

<!-- development-standards:begin -->

## Development standards

This project is assessed against
[Aircury's development standards](https://curipedia.aircury.net/development-standards).
It is a production product: a public marketing site for Elemwave.

Commitment: `R3 D2 C2 E2 L2 S2 Y2 O1 P2 U1 T1 A2`

Observed: `R1 D2 E1 Y1 P1 A1`; `C`, `L`, `S`, `O`, `U` and `T` are below
their lowest defined level.
One dimension meets its agreed level and eleven are short.

Not applicable:

- `I` — the site exposes no HTTP API.
  It is a static export, and the booking route handlers described in
  [ADR-0001](./specs/decisions/ADR-0001-mocked-booking-flow-behind-api-routes.md)
  were superseded by the embedded Calendly widget
  ([ADR-0002](./specs/decisions/ADR-0002-embed-calendly-inline-widget.md)).
- `B` — the project retains no data of its own.
  The site is rebuilt from the repository on every deployment, the staging
  bucket is republished each time, and scheduling data is held by Calendly.

Agreed below the published minimum for a production product (`C3 S3 O2 U2 T2`):
`C`, `S`, `O`, `U` and `T`.
These are deliberate deviations rather than gaps:

- `C` — C2. The site is presentational: content and layout with no backend
  behaviour, so most of what a C3 bar would cover is markup.
- `S` — S2. No authentication, no data of our own and no backend; S2 is the
  floor the standards set for any repository where security applies.
- `O` — O1. There is no server process to instrument: the site is a static
  export, so distribution access logs are the whole of what production
  activity there is to record.
- `U` — U1. No availability target has been agreed with Elemwave.
- `T` — T1. No support response times have been agreed.

Assessed on 2026-08-28 — see
[docs/development-standards-assessment.md](./docs/development-standards-assessment.md).

<!-- development-standards:end -->
