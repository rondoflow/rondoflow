# ── Install stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS installer

WORKDIR /app

# Copy workspace root files
COPY package.json package-lock.json turbo.json ./

# Copy all package.json files for install
COPY packages/server/package.json packages/server/
COPY packages/shared/package.json packages/shared/
COPY packages/catalog/package.json packages/catalog/

# Install dependencies
RUN npm ci --workspace=@rondoflow/server --workspace=@rondoflow/shared --workspace=@rondoflow/catalog --include-workspace-root

# Copy source code
COPY packages/shared/ packages/shared/
COPY packages/catalog/ packages/catalog/
COPY packages/server/ packages/server/

# Generate Prisma client
RUN npx prisma generate --schema=packages/server/prisma/schema.prisma

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /app

# Copy dependencies and source
COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages/server ./packages/server
COPY --from=installer /app/packages/shared ./packages/shared
COPY --from=installer /app/packages/catalog ./packages/catalog
COPY --from=installer /app/package.json ./

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code || true

WORKDIR /app/packages/server

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
