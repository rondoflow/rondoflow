---
description: Create + apply a Prisma migration the drift-safe way (hand-authored SQL + migrate deploy)
argument-hint: <migration_name e.g. add_widget_table>
allowed-tools: Bash, Read, Edit, Write
---

Create and apply a database migration named **"$ARGUMENTS"** using the drift-safe flow.

**Why this exists:** this dev database carries historical drift, so `prisma migrate dev` (i.e.
`npm run db:migrate`) proposes a **destructive reset**. When that happens, hand-author the
migration and apply it with `migrate deploy` instead. (On a clean database `migrate dev` is fine —
this command is the fallback for the drift case.)

Steps:

1. Make the schema change in `packages/server/prisma/schema.prisma`.
2. Create a new migration directory matching the existing naming convention
   (`<UTC timestamp YYYYMMDDHHMMSS>_$ARGUMENTS/migration.sql`); the timestamp must sort **after**
   the latest folder in `packages/server/prisma/migrations/`. Get the timestamp with
   `date -u +%Y%m%d%H%M%S`.
3. Hand-write the forward SQL in that `migration.sql`. Derive it from the schema diff
   (CREATE/ALTER/…) and follow the SQL style of the most recent migrations in that folder.
4. Apply it **from the repo root**:
   ```bash
   npx prisma migrate deploy --schema=packages/server/prisma/schema.prisma
   ```
5. Regenerate the Prisma client:
   ```bash
   npm run generate
   ```
6. Verify and report:
   ```bash
   npx prisma migrate status --schema=packages/server/prisma/schema.prisma
   ```

⚠️ Do **not** run `npm run db:migrate` / `prisma migrate dev` for this — on the drifted dev DB it
will offer to wipe data.
