-- CreateTable
CREATE TABLE "ChainRun" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "initialMessage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ChainRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChainStepResult" (
    "id" TEXT NOT NULL,
    "chainRunId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT,
    "output" TEXT NOT NULL DEFAULT '',
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ChainStepResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChainRun_chainId_key" ON "ChainRun"("chainId");

-- CreateIndex
CREATE INDEX "ChainStepResult_chainRunId_idx" ON "ChainStepResult"("chainRunId");

-- AddForeignKey
ALTER TABLE "ChainStepResult" ADD CONSTRAINT "ChainStepResult_chainRunId_fkey" FOREIGN KEY ("chainRunId") REFERENCES "ChainRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
