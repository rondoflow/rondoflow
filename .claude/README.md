# `.claude/` — RondoFlow agent assets

Project-scoped configuration for Claude Code. These files are shared with the team (commit them);
`settings.local.json` is the only per-machine, untracked file here.

## Skills — `skills/<name>/SKILL.md`

Auto-loaded by Claude when the task matches the skill's `description`.

| Skill | Use it when |
|-------|-------------|
| **karpathy-guidelines** | Writing/reviewing/refactoring any code — bias toward simplicity, surgical edits, explicit assumptions, verifiable success criteria. ([source](https://github.com/forrestchang/andrej-karpathy-skills), MIT) |
| **rondoflow-i18n** | Adding/renaming/removing a UI translation key or namespace — keeps the `en`/`sk`/`es` catalogs in parity so the catalog test passes. |
| **rondoflow-canvas-node** | Adding/changing/debugging a canvas node type — covers the two-compiler sync (`chain-utils.ts` ⇄ `canvas-chain.ts`) that silently drops nodes from scheduled runs. |

## Agents — `agents/<name>.md`

Subagents you delegate to (via the Agent tool or by name).

| Agent | Does |
|-------|------|
| **rondoflow-reviewer** | Read-only review of a diff against RondoFlow's conventions + security rules (spawn safety, `{ success, error }` envelope, per-user ownership/IDOR, Zod boundaries, immutability, i18n parity, size limits, Claude-auth handling). |
| **rondoflow-i18n-translator** | Translates UI strings into `sk` + `es`, writes them into the locale catalogs, and verifies parity. |

## Commands — `commands/<name>.md`

Slash commands you invoke explicitly.

| Command | Does |
|---------|------|
| `/i18n-check` | Runs the locale parity test and reports/fixes failures. |
| `/db-migrate <name>` | Creates + applies a Prisma migration the drift-safe way (hand-authored SQL + `migrate deploy`). |
| `/preflight` | Format + lint/typecheck + tests across the workspace before committing. |
| `/release [bump]` | Bumps all workspace versions in sync, generates/updates `CHANGELOG.md` from Conventional Commits, commits + tags (push gated on confirmation). |

## Conventions these encode

Everything here mirrors `CLAUDE.md` and the project's hard-won quirks: never `shell: true` /
`execSync` when spawning; spawn the Claude CLI with `--output-format stream-json`; the
`{ success, data?, error?, meta? }` envelope; per-user ownership; Zod at boundaries; immutable
data; files < 800 lines / functions < 50 lines; all UI strings through `react-i18next` in three
locales; and the two known footguns — the canvas compiler drift and the Prisma dev-DB drift.
