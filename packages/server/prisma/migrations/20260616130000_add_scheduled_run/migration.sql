-- Persist each execution of a ScheduledTask (a cron tick or a manual "run now")
-- so the UI can show scheduled-run history and per-agent output. Scheduled runs
-- execute headless via the scheduler's simple sequential path, so they get their
-- own lightweight history rather than reusing the ChainRun/socket pipeline.

-- CreateTable
CREATE TABLE "ScheduledRun" (
    "id" TEXT NOT NULL,
    "scheduledTaskId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL DEFAULT 'cron',
    "status" TEXT NOT NULL DEFAULT 'running',
    "output" TEXT NOT NULL DEFAULT '',
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScheduledRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledRunStep" (
    "id" TEXT NOT NULL,
    "scheduledRunId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "agentName" TEXT NOT NULL,
    "output" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ScheduledRunStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledRun_scheduledTaskId_startedAt_idx" ON "ScheduledRun"("scheduledTaskId", "startedAt");

-- CreateIndex
CREATE INDEX "ScheduledRunStep_scheduledRunId_idx" ON "ScheduledRunStep"("scheduledRunId");

-- AddForeignKey
ALTER TABLE "ScheduledRun" ADD CONSTRAINT "ScheduledRun_scheduledTaskId_fkey" FOREIGN KEY ("scheduledTaskId") REFERENCES "ScheduledTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledRunStep" ADD CONSTRAINT "ScheduledRunStep_scheduledRunId_fkey" FOREIGN KEY ("scheduledRunId") REFERENCES "ScheduledRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
