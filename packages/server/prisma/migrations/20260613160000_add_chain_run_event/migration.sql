-- Persist the full execution-log transcript of a chain run so it can be replayed
-- after a page refresh (previously the live log lived only in browser memory).

-- CreateTable
CREATE TABLE "ChainRunEvent" (
    "id" TEXT NOT NULL,
    "chainRunId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "stepIndex" INTEGER,
    "agentId" TEXT,
    "agentName" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChainRunEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChainRunEvent_chainRunId_seq_idx" ON "ChainRunEvent"("chainRunId", "seq");

-- CreateIndex
CREATE INDEX "ChainRun_createdAt_idx" ON "ChainRun"("createdAt");

-- CreateIndex
CREATE INDEX "ChainRun_workspaceId_createdAt_idx" ON "ChainRun"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChainRunEvent" ADD CONSTRAINT "ChainRunEvent_chainRunId_fkey" FOREIGN KEY ("chainRunId") REFERENCES "ChainRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
