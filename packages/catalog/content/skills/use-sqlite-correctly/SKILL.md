---
name: use-sqlite-correctly
description: "Use SQLite correctly with proper concurrency, pragmas, and type handling."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

## Concurrency (Biggest Gotcha)

- Only one writer at a time—concurrent writes queue or fail; not for high-write workloads
- Enable WAL mode: `PRAGMA journal_mode=WAL`—allows reads during writes, huge improvement
- Set busy timeout: `PRAGMA busy_timeout=5000`—waits 5s before SQLITE_BUSY instead of failing immediately
- WAL needs `-wal` and `-shm` files—don't forget to copy them with main database
- `BEGIN IMMEDIATE` to grab write lock early—prevents deadlocks in read-then-write patterns

## Foreign Keys (Off by Default!)

- `PRAGMA foreign_keys=ON` required per connection—not persisted in database
- Without it, foreign key constraints silently ignored—data integrity broken
- Check before relying: `PRAGMA foreign_keys` returns 0 or 1
- ON DELETE CASCADE only works if foreign_keys is ON

## Type System

- Type affinity, not strict types—INTEGER column accepts "hello" without error
- `STRICT` tables enforce types—but only SQLite 3.37+ (2021)
- No native DATE/TIME—use TEXT as ISO8601 or INTEGER as Unix timestamp
- BOOLEAN doesn't exist—use INTEGER 0/1; TRUE/FALSE are just aliases
- REAL is 8-byte float—same precision issues as any float

## Schema Changes

- `ALTER TABLE` very limited—can add column, rename table/column; that's mostly it
- Can't change column type, add constraints, or drop columns (until 3.35)
- Workaround: create new table, copy data, drop old, rename—wrap in transaction
- `ALTER TABLE ADD COLUMN` can't have PRIMARY KEY, UNIQUE, or NOT NULL without default

## Performance Pragmas

- `PRAGMA optimize` before closing long-running connections—updates query planner stats
- `PRAGMA cache_size=-64000` for 64MB cache—negative = KB; default very small
- `PRAGMA synchronous=NORMAL` with WAL—good balance of safety and speed
- `PRAGMA temp_store=MEMORY` for temp tables in RAM—faster sorts and temp results

## Vacuum & Maintenance

- Deleted data doesn't shrink file—`VACUUM` rewrites entire database, reclaims space
- `VACUUM` needs 2x disk space temporarily—ensure enough room
- `PRAGMA auto_vacuum=INCREMENTAL` with `PRAGMA incremental_vacuum`—partial reclaim without full rewrite
- After bulk deletes, always vacuum or file stays bloated

## Backup Safety

- Never copy database file while open—corrupts if write in progress
- Use `.backup` command in sqlite3—or `sqlite3_backup_*` API
- WAL mode: `-wal` and `-shm` must be copied atomically with main file
- `VACUUM INTO 'backup.db'` creates standalone copy (3.27+)

## Indexing

- Covering indexes work—add extra columns to avoid table lookup
- Partial indexes supported (3.8+): `CREATE INDEX ... WHERE condition`
- Expression indexes (3.9+): `CREATE INDEX ON t(lower(name))`
- `EXPLAIN QUERY PLAN` shows index usage—simpler than PostgreSQL EXPLAIN

## Transactions

- Autocommit by default—each statement is own transaction; slow for bulk inserts
- Batch inserts: `BEGIN; INSERT...; INSERT...; COMMIT`—10-100x faster
- `BEGIN EXCLUSIVE` for exclusive lock—blocks all other connections
- Nested transactions via `SAVEPOINT name` / `RELEASE name` / `ROLLBACK TO name`

## Common Mistakes

- Using SQLite for web app with concurrent users—one writer blocks all; use PostgreSQL
- Assuming ROWID is stable—`VACUUM` can change ROWIDs; use explicit INTEGER PRIMARY KEY
- Not setting busy_timeout—random SQLITE_BUSY errors under any concurrency
- In-memory database `':memory:'`—each connection gets different database; use `file::memory:?cache=shared` for shared
