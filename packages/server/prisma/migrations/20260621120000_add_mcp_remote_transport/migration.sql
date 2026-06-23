-- Remote (http/sse) MCP transport support.
-- stdio servers use command/args/env; remote servers use url + auth.

-- command is only required for stdio servers
ALTER TABLE "McpServer" ALTER COLUMN "command" DROP NOT NULL;

-- remote transport fields
ALTER TABLE "McpServer" ADD COLUMN "url" TEXT;
ALTER TABLE "McpServer" ADD COLUMN "auth" JSONB;
