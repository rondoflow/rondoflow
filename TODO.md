# Roadmap

A living list of what's planned and what has recently shipped. For the high-level
status (stable / experimental / planned), see the **Project Status & Roadmap**
section in the [README](README.md). Discussion and tracking happen in
[GitHub issues](https://github.com/arzzen/rondoflow/issues).

## Planned

### Features
- [x] Multi-user authentication + roles (admin, editor, viewer)
- [x] Internationalization / i18n (English default; de-DE, es-ES, fr-FR)

### Security / authorization
- [ ] Make the policy gate block tools **pre-execution** (native `--permission-prompt-tool` / `canUseTool`) instead of detect-and-kill; stop defaulting to `dontAsk`; tokenize commands — `spawner.ts`, `policy-checker.ts`
- [x] Filesystem browse/save allowlist for `/api/fs/*` (deferred: it is an intentional local-first host picker; needs a product decision before restricting, since it would affect the working-directory picker in any multi-tenant mode)

### Engine / reliability
- [x] Add `SPAWN_TIMEOUT_MS` to spawned CLI processes and tear down in-flight runs on socket disconnect / shutdown (avoids orphaned, billable processes) — `spawner.ts`, `handlers.ts`, `index.ts`

### Frontend
- [ ] Check `res.ok` before `res.json()` in `api.ts` and surface autosave failures instead of swallowing them (prevents silent data loss on reload) — `api.ts`, `use-canvas-persistence.ts`

### Tooling / DX
- [x] Fix `npm test` (wire test tasks into `turbo.json`), add a CI workflow (typecheck / lint / test / build), and add spawner auth tests

## Recently shipped

- [x] Full audit-log dashboard, activity feed, and usage/cost analytics
- [x] Pre-configured agent templates ("Frontend Dev", "Data Analyst", etc.)
- [x] Export / import of entire canvases (share setups)
- [x] Mount external folders via Docker Compose for use as workspace resources
- [x] Per-user ownership enforcement (IDOR protection) across REST routes and socket handlers
- [x] Scope every Socket.IO emit to the owning user via per-user rooms
- [x] Server-side rate limiting (global, auth, and workflow-generation buckets)
- [x] Global Fastify error + not-found handlers so the `{ success, error }` envelope is an invariant
- [x] Hot-path database indexes for sessions and scheduled tasks
- [x] Auto-save workflow output on completion, with an "Open result" shortcut
- [x] Docker Compose v1/v2 compatibility fix for `npm run setup` (+ Postgres readiness wait, Node >= 20 engine)
- [x] Simpler, smaller minimap; redesigned login / register pages
