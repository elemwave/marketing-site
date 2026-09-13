# syntax=docker/dockerfile:1

# Development image for the Elemwave marketing app (projects/marketing/).
# Build context is the repository root; the app is nested under projects/marketing/.
#
# There is no production stage: the site is a static export served from S3 and
# CloudFront (see specs/decisions/staging-on-s3-and-cloudfront.md), so nothing runs a Next.js server.

FROM public.ecr.aws/docker/library/node:24-alpine AS base
WORKDIR /app