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
