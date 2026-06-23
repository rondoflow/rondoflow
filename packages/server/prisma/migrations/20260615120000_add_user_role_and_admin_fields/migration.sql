-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'editor', 'viewer');

-- AlterTable: User — global role + Better Auth admin-plugin ban fields
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'viewer',
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banExpires" TIMESTAMP(3);

-- AlterTable: auth_session — admin-plugin impersonation column (note @@map name)
ALTER TABLE "auth_session" ADD COLUMN     "impersonatedBy" TEXT;

-- Backfill: existing accounts predate roles. Everyone becomes an editor, then
-- the oldest account is promoted to admin so the instance stays manageable.
UPDATE "User" SET "role" = 'editor';
UPDATE "User" SET "role" = 'admin'
WHERE "id" = (SELECT "id" FROM "User" ORDER BY "createdAt" ASC, "id" ASC LIMIT 1);
