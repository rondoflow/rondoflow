-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('file', 'url', 'note', 'variable');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "permissionMode" TEXT NOT NULL DEFAULT 'default';

-- CreateTable
CREATE TABLE "WorkspaceResource" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "url" TEXT,
    "content" TEXT,
    "varKey" TEXT,
    "varValue" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceResource_workspaceId_type_idx" ON "WorkspaceResource"("workspaceId", "type");

-- AddForeignKey
ALTER TABLE "WorkspaceResource" ADD CONSTRAINT "WorkspaceResource_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
