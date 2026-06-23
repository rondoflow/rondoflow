-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('idle', 'running', 'waiting_approval', 'error');

-- CreateEnum
CREATE TYPE "PolicyLevel" AS ENUM ('global', 'agent', 'session');

-- CreateEnum
CREATE TYPE "SkillSource" AS ENUM ('marketplace', 'git');

-- CreateEnum
CREATE TYPE "DiscussionFormat" AS ENUM ('brainstorm', 'review', 'deliberation');

-- CreateEnum
CREATE TYPE "DiscussionStatus" AS ENUM ('draft', 'active', 'concluded');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('participant', 'observer', 'devil_advocate');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant', 'system', 'tool');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('pending', 'in_progress', 'passed', 'failed');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "description" TEXT,
    "persona" TEXT NOT NULL,
    "purpose" TEXT,
    "scope" TEXT[],
    "allowedTools" TEXT[],
    "memoryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT,
    "status" "AgentStatus" NOT NULL DEFAULT 'idle',
    "loopEnabled" BOOLEAN NOT NULL DEFAULT false,
    "loopCriteria" JSONB,
    "maxIterations" INTEGER NOT NULL DEFAULT 10,
    "teamEnabled" BOOLEAN NOT NULL DEFAULT false,
    "canvasX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "canvasY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" "SkillSource" NOT NULL,
    "gitUrl" TEXT,
    "path" TEXT NOT NULL,
    "version" TEXT,
    "author" TEXT,
    "category" TEXT,
    "icon" TEXT,
    "mcpConfig" JSONB,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSkill" (
    "agentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AgentSkill_pkey" PRIMARY KEY ("agentId","skillId")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "PolicyLevel" NOT NULL,
    "rules" JSONB NOT NULL,
    "agentId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "agentId" TEXT,
    "tableId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "toolUse" JSONB,
    "rawEvent" JSONB,
    "tokenCount" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionTable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "format" "DiscussionFormat" NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "status" "DiscussionStatus" NOT NULL DEFAULT 'draft',
    "conclusion" TEXT,
    "maxRounds" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscussionTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableParticipant" (
    "tableId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'participant',

    CONSTRAINT "TableParticipant_pkey" PRIMARY KEY ("tableId","agentId")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanvasLayout" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "workspaceId" TEXT NOT NULL,
    "viewport" JSONB NOT NULL,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanvasLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "McpServer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'stdio',
    "command" TEXT NOT NULL,
    "args" TEXT[],
    "env" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McpServer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMcpServer" (
    "agentId" TEXT NOT NULL,
    "mcpServerId" TEXT NOT NULL,

    CONSTRAINT "AgentMcpServer_pkey" PRIMARY KEY ("agentId","mcpServerId")
);

-- CreateTable
CREATE TABLE "PRD" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PRD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "prdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "acceptanceCriteria" TEXT NOT NULL,
    "status" "StoryStatus" NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "Message_sessionId_timestamp_idx" ON "Message"("sessionId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Memory_agentId_key_key" ON "Memory"("agentId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "McpServer_name_key" ON "McpServer"("name");

-- CreateIndex
CREATE INDEX "Story_prdId_priority_idx" ON "Story"("prdId", "priority");

-- AddForeignKey
ALTER TABLE "AgentSkill" ADD CONSTRAINT "AgentSkill_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSkill" ADD CONSTRAINT "AgentSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DiscussionTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionTable" ADD CONSTRAINT "DiscussionTable_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableParticipant" ADD CONSTRAINT "TableParticipant_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "DiscussionTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TableParticipant" ADD CONSTRAINT "TableParticipant_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanvasLayout" ADD CONSTRAINT "CanvasLayout_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMcpServer" ADD CONSTRAINT "AgentMcpServer_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMcpServer" ADD CONSTRAINT "AgentMcpServer_mcpServerId_fkey" FOREIGN KEY ("mcpServerId") REFERENCES "McpServer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_prdId_fkey" FOREIGN KEY ("prdId") REFERENCES "PRD"("id") ON DELETE CASCADE ON UPDATE CASCADE;
