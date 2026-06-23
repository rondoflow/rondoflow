-- CreateTable
CREATE TABLE "ExternalFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "containerPath" TEXT NOT NULL,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExternalFolder" (
    "agentId" TEXT NOT NULL,
    "externalFolderId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AgentExternalFolder_pkey" PRIMARY KEY ("agentId","externalFolderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalFolder_containerPath_key" ON "ExternalFolder"("containerPath");

-- AddForeignKey
ALTER TABLE "AgentExternalFolder" ADD CONSTRAINT "AgentExternalFolder_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentExternalFolder" ADD CONSTRAINT "AgentExternalFolder_externalFolderId_fkey" FOREIGN KEY ("externalFolderId") REFERENCES "ExternalFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
