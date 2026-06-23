-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'claude-code',
ADD COLUMN     "providerConfig" JSONB;
