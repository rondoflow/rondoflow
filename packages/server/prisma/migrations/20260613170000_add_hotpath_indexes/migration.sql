-- Index FK / hot-filter columns that Postgres does not auto-index.
-- AgentSession (mapped to "Session"): /api/sessions filters by agentId and
-- orders by startedAt; discussions look sessions up by tableId.
CREATE INDEX "Session_agentId_startedAt_idx" ON "Session"("agentId", "startedAt");
CREATE INDEX "Session_tableId_idx" ON "Session"("tableId");

-- ScheduledTask: scheduler boot scans `where enabled = true`.
CREATE INDEX "ScheduledTask_enabled_nextRunAt_idx" ON "ScheduledTask"("enabled", "nextRunAt");
