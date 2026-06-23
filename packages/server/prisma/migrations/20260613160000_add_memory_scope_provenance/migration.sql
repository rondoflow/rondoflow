-- Persistent cross-session memory: evolve the single Memory table to support
-- BOTH agent-scoped and workspace-scoped rows, with provenance (manual/auto/director),
-- pinning and importance. Backward-compatible: every existing row is agent-scoped.

-- Allow workspace-scoped rows (no agent).
ALTER TABLE "Memory" ALTER COLUMN "agentId" DROP NOT NULL;

-- New columns. NOT NULL columns carry a DEFAULT in the same statement so Postgres
-- backfills all existing rows atomically (the table is non-empty in real deployments).
ALTER TABLE "Memory" ADD COLUMN "workspaceId" TEXT;
ALTER TABLE "Memory" ADD COLUMN "scope"      TEXT    NOT NULL DEFAULT 'agent';
ALTER TABLE "Memory" ADD COLUMN "source"     TEXT    NOT NULL DEFAULT 'manual';
ALTER TABLE "Memory" ADD COLUMN "pinned"     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Memory" ADD COLUMN "importance" INTEGER NOT NULL DEFAULT 0;

-- Tag historical Director learnings by their key prefix (the only director-written key).
UPDATE "Memory" SET "source" = 'director' WHERE "key" LIKE 'director:learning:%';

-- Enforce that exactly one scope target is set. Prisma cannot model CHECK constraints,
-- so this lives only here — re-add it if you ever run `prisma migrate diff` / `db push`.
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_scope_xor"
  CHECK (("agentId" IS NOT NULL) <> ("workspaceId" IS NOT NULL));

-- Workspace relation (cascade matches WorkspaceResource).
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New unique for the workspace upsert path (workspaceId_key). The existing
-- "Memory_agentId_key_key" unique is intentionally left untouched.
CREATE UNIQUE INDEX "Memory_workspaceId_key_key" ON "Memory"("workspaceId", "key");

-- Helper indexes for pinned-first ordering and the auto-captured filtered view.
CREATE INDEX "Memory_workspaceId_pinned_idx" ON "Memory"("workspaceId", "pinned");
CREATE INDEX "Memory_agentId_pinned_idx"     ON "Memory"("agentId", "pinned");
CREATE INDEX "Memory_scope_source_idx"       ON "Memory"("scope", "source");
