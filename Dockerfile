# syntax=docker/dockerfile:1

# Production image for the Elemwave marketing app (projects/marketing/).
# Build context is the repository root; the app is nested under projects/marketing/.

FROM node:22-alpine AS base
WORKDIR /app

# --- Install dependencies (cached on lockfile changes) ---
FROM base AS deps
COPY projects/marketing/package.json projects/marketing/package-lock.json ./
RUN npm ci

# --- Build the standalone Next.js output ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ARG CALENDLY_URL
ENV CALENDLY_URL=$CALENDLY_URL
COPY --from=deps /app/node_modules ./node_modules
COPY projects/marketing/ ./
RUN npm run build

# --- Minimal runtime image ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
