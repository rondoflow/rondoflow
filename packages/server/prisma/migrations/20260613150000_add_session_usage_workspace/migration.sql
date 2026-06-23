-- Add a workspace dimension to cost tracking so analytics can break usage down
-- per workspace.
ALTER TABLE "SessionUsage" ADD COLUMN "workspaceId" TEXT;

-- CreateIndex
CREATE INDEX "SessionUsage_workspaceId_createdAt_idx" ON "SessionUsage"("workspaceId", "createdAt");

-- ---------------------------------------------------------------------------
-- Backfill historical usage into SessionUsage.
--
-- Until now SessionUsage was never written; token usage was only recorded in
-- ChainStepResult (chain runs) and ActivityEvent.metadata (single agent runs).
-- Recover that history so analytics shows data immediately instead of starting
-- empty. Going forward both paths also write SessionUsage directly.
-- ---------------------------------------------------------------------------

-- Chain steps already carry real token + cost data, and their workspace is on
-- the parent ChainRun.
INSERT INTO "SessionUsage" ("id", "sessionId", "agentId", "workspaceId", "model", "inputTokens", "outputTokens", "costUsd", "createdAt")
SELECT
  gen_random_uuid(),
  cr."chainId" || '-step-' || s."stepIndex"::text,
  s."agentId",
  cr."workspaceId",
  NULL,
  s."tokensIn",
  s."tokensOut",
  s."costUsd",
  s."startedAt"
FROM "ChainStepResult" s
JOIN "ChainRun" cr ON cr."id" = s."chainRunId"
WHERE (s."tokensIn" > 0 OR s."tokensOut" > 0 OR s."costUsd" > 0)
  -- Idempotency guard: skip steps already persisted by a live write, so the
  -- backfill never double-counts (e.g. if re-run, or if the new server served
  -- traffic before this migration applied).
  AND NOT EXISTS (
    SELECT 1 FROM "SessionUsage" su
    WHERE su."sessionId" = cr."chainId" || '-step-' || s."stepIndex"::text
  );

-- Single agent runs recorded usage in the `agent_completed` ActivityEvent. The
-- matching `agent_started` event (same metadata.sessionId) carries the workspace
-- and model, so join back to it to recover those dimensions.
INSERT INTO "SessionUsage" ("id", "sessionId", "agentId", "workspaceId", "model", "inputTokens", "outputTokens", "costUsd", "createdAt")
SELECT
  gen_random_uuid(),
  COALESCE(done."metadata"->>'sessionId', done."id"),
  done."agentId",
  started."workspaceId",
  started."model",
  COALESCE((done."metadata"->'usage'->>'inputTokens')::int, 0),
  COALESCE((done."metadata"->'usage'->>'outputTokens')::int, 0),
  COALESCE((done."metadata"->'usage'->>'estimatedCostUsd')::double precision, 0),
  done."createdAt"
FROM "ActivityEvent" done
LEFT JOIN LATERAL (
  SELECT s."workspaceId", s."metadata"->>'model' AS "model"
  FROM "ActivityEvent" s
  WHERE s."type" = 'agent_started'
    AND s."metadata"->>'sessionId' = done."metadata"->>'sessionId'
  ORDER BY s."createdAt" DESC
  LIMIT 1
) started ON true
WHERE done."type" = 'agent_completed'
  AND done."metadata"->'usage' IS NOT NULL
  AND (
    COALESCE((done."metadata"->'usage'->>'inputTokens')::int, 0) > 0
    OR COALESCE((done."metadata"->'usage'->>'outputTokens')::int, 0) > 0
    OR COALESCE((done."metadata"->'usage'->>'estimatedCostUsd')::double precision, 0) > 0
  )
  -- Idempotency guard: skip runs already persisted by a live write (same
  -- sessionId), so the backfill never double-counts on re-run or if the new
  -- server served traffic before this migration applied.
  AND NOT EXISTS (
    SELECT 1 FROM "SessionUsage" su
    WHERE su."sessionId" = COALESCE(done."metadata"->>'sessionId', done."id")
  );
