# syntax=docker/dockerfile:1

# Development image for the Elemwave marketing app (projects/marketing/).
# Build context is the repository root; the app is nested under projects/marketing/.
#
# There is no production stage: the site is a static export served from S3 and
# CloudFront (see specs/decisions/ADR-0003), so nothing runs a Next.js server.

FROM node:22-alpine AS base
WORKDIR /app