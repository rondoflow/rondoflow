# Changelog

All notable changes to RondoFlow are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-25

### Added

- Apify Actor node, with configuration and canvas UI, for running Apify actors in a workflow (`58c944d`)
- New facilitator and workspace presets in the content catalog (`3afa6e5`)

### Fixed

- Use basePath-relative doc links and add a back-link to rondoflow.app (docs) (`d716567`)
- Point site and docs URLs at the rondoflow.app domain (landing) (`5bebad9`)

### Changed

- Centralize timeout values behind shared `TIMEOUTS` constants (server) (`c999489`)
- Refactor prompt and planner logic for clearer modularity (`5d8279d`)

### Documentation

- Add a Community & Support section to the README (`69d2625`)
- Update project status and development notes in the README (`13f5c65`)

## [1.0.0] - 2026-06-23

First public release of RondoFlow — a local-first visual orchestration platform for Claude Code agents.

### Added

- Drag-and-drop React Flow canvas to build multi-agent workflows from agent, skill, policy, resource, MCP, condition, transform, template, email, output, and note nodes.
- Multi-agent execution engine: Planner (pre-run analysis), Director (mid-run orchestration), Advisor (post-run suggestions), Scheduler (cron-based recurring runs), and a DAG ChainExecutor with parallel branches and conditional routing.
- AI WorkflowGenerator that builds multi-agent workflows from a plain-language task description.
- Content catalog (`@rondoflow/catalog`) of shipped, extensible agents, skills, canvas templates, workspace presets, and facilitator presets, validated against Zod schemas at build time.
- Security policies with most-restrictive-wins resolution, plus a documented threat model in `SECURITY.md`.
- Better Auth authentication with optional GitHub and Google OAuth providers.
- Email node that sends combined workflow output as HTML via SMTP.
- Internationalized UI (English, Slovak, Spanish, French, German) with enforced locale key parity.
- Local-first stack: Next.js 14 frontend, Fastify + Socket.IO backend, PostgreSQL 16 + Prisma, orchestrated as an npm + Turborepo monorepo with Docker Compose for the database.

[1.1.0]: https://github.com/rondoflow/rondoflow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rondoflow/rondoflow/releases/tag/v1.0.0
