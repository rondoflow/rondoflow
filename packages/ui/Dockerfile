# syntax=docker/dockerfile:1
# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json turbo.json ./

# Copy all package.json files for install
COPY packages/ui/package.json packages/ui/
COPY packages/shared/package.json packages/shared/
COPY packages/catalog/package.json packages/catalog/

# Install dependencies. The BuildKit cache mount on /root/.npm persists npm's
# download cache across builds, so even when the install layer is invalidated
# (e.g. a lockfile bump) only changed tarballs are re-fetched rather than the
# whole dependency tree. --no-audit/--no-fund skip the audit & funding network
# round-trips. The mount is build-only and never part of an image layer, so the
# runtime image is byte-identical.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace=@rondoflow/ui --workspace=@rondoflow/shared --workspace=@rondoflow/catalog --include-workspace-root --no-audit --no-fund

# Copy source code
COPY packages/shared/ packages/shared/
COPY packages/catalog/ packages/catalog/
COPY packages/ui/ packages/ui/

# Build Next.js (standalone output for Docker). @rondoflow/shared is consumed as
# raw TS (its package main is ./src/index.ts), so no separate tsc build of it is
# needed — next build resolves the source directly.
#
# DOCS_ORIGIN must be present at BUILD time, not just runtime: the /docs reverse
# proxy is an external (absolute-URL) rewrite, which Next.js freezes into
# routes-manifest.json during `next build`. A runtime env var is ignored for
# these rules. Default to localhost:3002 (correct for `npm run dev`); compose
# overrides it to the docs service origin via build args.
ARG DOCS_ORIGIN=http://localhost:3002
ENV DOCS_ORIGIN=${DOCS_ORIGIN}
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=1
RUN npm run build --workspace=@rondoflow/ui

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy Next.js standalone build
COPY --from=builder /app/packages/ui/.next/standalone ./
COPY --from=builder /app/packages/ui/.next/static ./packages/ui/.next/static
COPY --from=builder /app/packages/ui/public ./packages/ui/public

EXPOSE 3000

CMD ["node", "packages/ui/server.js"]
