# Contributing to RondoFlow

Thanks for your interest in contributing! RondoFlow is a local-first, self-hosted, visual orchestration platform for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) agents — a React Flow canvas front-end backed by a Fastify server that spawns the Claude Code CLI as child processes to run AI agents under a policy system.

Contributions of all kinds are welcome: bug fixes, features, docs, and especially tests.

For deeper architecture and usage docs, see the full documentation site in [`packages/docs`](packages/docs) (run it locally with `npm run dev:docs`), and the [README](README.md) for a feature tour.

## Prerequisites

You'll need:

- **Node.js 18+** (20+ recommended — the repo's `engines` field targets Node 20)
- **Docker Desktop** (for the PostgreSQL container; full Docker mode runs everything in containers)
- **Claude Code CLI** — [installed](https://docs.anthropic.com/en/docs/claude-code) and authenticated. Agents are real Claude Code subprocesses, so the CLI must be working on your machine.

## Getting Started

1. **Fork** the repository on GitHub (https://github.com/rondoflow/rondoflow).
2. **Clone** your fork:

   ```bash
   git clone https://github.com/<your-username>/rondoflow.git
   cd rondoflow
   ```

3. **Set up** the project — installs dependencies, generates `.env` (with a random `BETTER_AUTH_SECRET`), starts Postgres via Docker, then migrates and seeds the database:

   ```bash
   npm run setup
   ```

4. **Run** the dev environment (Turborepo — UI on http://localhost:3000, server on http://localhost:3001):

   ```bash
   npm run dev
   ```

Useful targeted commands:

```bash
npm run dev:ui       # Next.js frontend only (port 3000)
npm run dev:server   # Fastify backend only (port 3001)
npm run dev:docs     # Documentation site
npm run db:studio    # Visual database browser (Prisma Studio)
```

> Prefer running everything in containers? `docker compose up` builds and starts all services. See the README "Get Started" section for details.

## Project Structure

The codebase is an npm-workspaces + Turborepo monorepo with three main packages under `packages/`:

- `ui/` — Next.js 15 + React 18 front-end (React Flow canvas)
- `server/` — Fastify + Socket.IO backend, Prisma schema, the agent engine
- `shared/` — TypeScript types and user-facing terminology
- `docs/` — documentation site

Rather than duplicating it here, please refer to the **"Project Layout"** section of the [README](README.md#project-layout) for the annotated directory tree.

## Development Workflow

- **Branch off `master`.** Create a focused feature branch, e.g. `git checkout -b feat/my-feature` or `fix/some-bug`.
- **Use Conventional-Commits-style messages**, matching the existing git history:
  - `feat: add Perplexity provider support`
  - `feat(docs): add security model documentation`
  - `fix: handle empty agent output`
- **Keep PRs focused.** One logical change per pull request makes review faster and easier to revert if needed.

## Running Checks Before a PR

Before opening a PR, run:

```bash
npm run build   # build all packages (turbo build)
npm run lint    # lint / typecheck all packages (turbo lint)
npm run test    # run tests (turbo test)
```

**Honest note on tests:** automated test coverage is still growing, and the Turborepo `test` task wiring is being finalized. The server package runs its tests with `vitest run` (`npm run test --workspace @rondoflow/server`). There is no comprehensive CI/test suite yet — so **contributions that add tests are very welcome** and a great first PR.

## Code Conventions

These come from the project's `CLAUDE.md` and are enforced by review:

- **Immutable data patterns** — `readonly` types and the spread operator; no in-place mutation.
- **Explicit error handling** — fail with context, don't swallow errors.
- **Validate inputs at boundaries** — use Zod schemas on every endpoint and at system edges.
- **Keep it small** — files under 800 lines, functions under 50 lines.
- **Consistent API envelope** — responses use `{ success, data?, error?, meta? }`.
- **Never `shell: true`** in `child_process.spawn` — always pass an args array (security).
- **Never `execSync`** — use `spawnSync` with an args array instead.
- **User-facing terminology** comes from `@rondoflow/shared/terminology` (Agent→Assistant, Persona→Personality, Policy→Safety Rule, MCP→Connection). Use these in anything users see.

Because agents execute code on the host within a policy system, be especially careful with anything touching process spawning, the filesystem routes (`/api/fs/*`), policy resolution, or secret handling. When in doubt, ask in the issue or PR.

## Pull Request Process

1. Make sure `npm run build` and `npm run lint` pass locally.
2. Open a PR against `master` with a clear description of **what** changed and **why**.
3. **Link related issues** (e.g. "Closes #123").
4. **Include screenshots or a short clip** for any UI changes.
5. Keep the PR scoped — split unrelated changes into separate PRs.

A maintainer will review your PR. Be responsive to feedback, and feel free to ask questions.

## License

By contributing, you agree that your contributions are accepted under the project's [MIT License](LICENSE).
