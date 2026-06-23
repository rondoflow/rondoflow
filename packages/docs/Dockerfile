# syntax=docker/dockerfile:1
# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json turbo.json ./

# Copy the docs package manifest for install
COPY packages/docs/package.json packages/docs/

# Install dependencies. The BuildKit cache mount on /root/.npm persists npm's
# download cache across builds. --no-audit/--no-fund skip network round-trips.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --workspace=@rondoflow/docs --include-workspace-root --no-audit --no-fund

# Copy source code
COPY packages/docs/ packages/docs/

# Build Nextra (standalone output) and generate the Pagefind search index. The
# `postbuild` script (pagefind) runs automatically after `build` and writes to
# packages/docs/public/_pagefind, which is copied into the runtime image below.
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=1
RUN npm run build --workspace=@rondoflow/docs

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

# Copy Next.js standalone build. `public` MUST be copied explicitly — the
# standalone output does not bundle it, and it holds the Pagefind search index
# (public/_pagefind) without which search 404s in production.
COPY --from=builder /app/packages/docs/.next/standalone ./
COPY --from=builder /app/packages/docs/.next/static ./packages/docs/.next/static
COPY --from=builder /app/packages/docs/public ./packages/docs/public

EXPOSE 3002

CMD ["node", "packages/docs/server.js"]
