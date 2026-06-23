---
description: Pre-commit checks for RondoFlow — format, lint/typecheck, and tests across the workspace
allowed-tools: Bash, Read
---

Run RondoFlow's pre-commit checks from the repo root and give a concise pass/fail summary.

1. **Format** — `npm run format:check`
2. **Lint / typecheck** — `npm run lint`  (ui: `next lint`; server + shared: `tsc --noEmit`)
3. **Tests** — `npm test`  (turbo → `vitest run` in each package)

For each step report ✓ / ✗. On failure, surface the key error lines with `file:line` and propose
a fix — **do not fix automatically unless asked**. Stop early only if a step's failure makes later
steps meaningless (e.g. a typecheck error that the tests would just re-hit); otherwise run all
three so the report is complete.

Notes:
- `npm run format:check` is repo-wide; if it flags only pre-existing, unrelated files, say so
  rather than reformatting them (keep changes surgical).
- A full `npm run build` also builds `packages/docs` (Nextra), which builds **only** with the root
  `zod` pinned to `4.3.6` (newer zod breaks `nextra-theme-docs`). Run `build` only if asked, and
  watch for that constraint.
