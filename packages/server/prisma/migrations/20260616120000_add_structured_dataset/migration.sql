-- Persist structured datasets produced by canvas Structurer nodes and saved by
-- Save-to-DB nodes. Rows live in a child table so they stay queryable/paginatable.

-- CreateTable
CREATE TABLE "StructuredDataset" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "chainRunId" TEXT,
    "nodeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "sourceAgentIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StructuredDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructuredRow" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "StructuredRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StructuredDataset_workspaceId_createdAt_idx" ON "StructuredDataset"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "StructuredDataset_chainRunId_idx" ON "StructuredDataset"("chainRunId");

-- CreateIndex
CREATE INDEX "StructuredRow_datasetId_idx_idx" ON "StructuredRow"("datasetId", "idx");

-- AddForeignKey
ALTER TABLE "StructuredRow" ADD CONSTRAINT "StructuredRow_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "StructuredDataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
