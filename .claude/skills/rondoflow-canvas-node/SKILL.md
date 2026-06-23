---
name: rondoflow-canvas-node
description: Add, modify, or debug a canvas node type in RondoFlow (agent, skill, policy, resource, mcp, condition, structurer, db-save, http-request, duckduckgo-search, template, email, output, note). Use when changing node behavior or how a node participates in a workflow run — especially to avoid the interactive-vs-scheduled execution drift.
---

# RondoFlow Canvas Nodes

A workflow is a React Flow graph that gets **compiled into an ordered/branched list of
execution steps**. The critical thing to know: there are **two independent compilers**, and a
node that only one of them understands works in one run path and is silently dropped in the
other.

## The two run paths (keep them in sync!)

| Path | Compiler | Trigger |
|------|----------|---------|
| **Interactive** (user clicks Run in the canvas) | `packages/ui/src/lib/chain-utils.ts` | browser → socket |
| **Headless / scheduled** (Scheduler, cron, API) | `packages/server/src/engine/canvas-chain.ts` | server-side |

Both turn `{ nodes, edges }` into steps for `chain-executor.ts`, but they are **separate
codebases that must agree**. They have already drifted:

- `chain-utils.ts` (UI) treats `'agent' | 'structurer' | 'db-save' | 'http-request' |
  'duckduckgo-search'` as executable steps (see its `StepNodeType` union, ~L10 and the
  `nodeType` mapping ~L249-266).
- `canvas-chain.ts` (server) only recognizes `'agent' | 'structurer' | 'db-save'`
  (the executable filter ~L118). **`http-request` and `duckduckgo-search` are NOT compiled
  server-side**, so they run interactively but vanish from scheduled runs.

> ⚠️ **Whenever you add or change an executable node type, edit BOTH `chain-utils.ts` and
> `canvas-chain.ts`.** If you only touch one, the node will work in one run path and silently
> no-op in the other. This is the single most common bug class for nodes.

## Where each piece lives

```
packages/shared/src/canvas.ts                       # node/edge/data TYPES (shared contract)
packages/ui/src/components/canvas/nodes/*.tsx        # React Flow node components (visuals + editing)
packages/ui/src/components/canvas/canvas-palette.tsx # drag-to-canvas palette entry
packages/ui/src/lib/chain-utils.ts                   # UI compiler: graph → steps (interactive)
packages/server/src/engine/canvas-chain.ts           # server compiler: graph → steps (headless)
packages/server/src/engine/chain-executor.ts         # DAG runner (parallel branches), both paths
packages/server/src/engine/<kind>-runner.ts          # per-kind execution (agent-runner, http-request-runner, duckduckgo-search-runner, ...)
```

Node kinds seen in the UI today: `agent`, `skill`, `policy`, `resource`, `mcp`, `start`,
`condition`, `structurer`, `db-save`, `http-request`, `duckduckgo-search`, `template-text`,
`email`, `output`, `sticky-note`.

## Node roles

- **Executable steps** — `agent` (spawns Claude Code CLI) and the *transform* nodes
  (`structurer`, `db-save`, `http-request`, `duckduckgo-search`) produce output and pass it
  downstream. These are what both compilers must list.
- **Attachment nodes** — `skill`, `policy`, `resource`, `mcp` configure a connected agent
  rather than executing themselves.
- **Control flow** — `condition` routes on an agent's last output line; it compiles to grouped
  exclusive edges so the run path branches instead of linearising the DAG.
- **Sinks** — `output` (captures result) and `email` (sends combined output via SMTP, only when
  `data.enabled`).
- **Annotation** — `sticky-note` (no execution).

## Checklist: adding a new executable node type

1. **Type** — add the node-data shape + kind to `packages/shared/src/canvas.ts`.
2. **Component** — create `packages/ui/src/components/canvas/nodes/<kind>-node.tsx`; register it
   in the React Flow `nodeTypes` map and add it to `canvas-palette.tsx`.
3. **UI compiler** — handle the kind in `chain-utils.ts` (`StepNodeType` + the `nodeType`/config
   mapping).
4. **Server compiler** — handle the kind in `canvas-chain.ts` (executable filter + step mapping).
   **Mirror step 3 exactly.**
5. **Runner** — add `packages/server/src/engine/<kind>-runner.ts` and dispatch to it from
   `chain-executor.ts`.
6. **i18n** — any visible label goes through the `canvas` namespace in all three locales
   (see the `rondoflow-i18n` skill).
7. **Tests** — extend `chain-executor.test.ts` / `chain-utils.test.ts`.

## Verify

```bash
cd packages/server && npx vitest run src/engine/__tests__/chain-executor.test.ts
cd packages/ui && npx vitest run src/lib/__tests__/chain-utils.test.ts
```

Sanity check for drift — the executable node kinds should match between the two compilers:

```bash
grep -nE "structurer|db-save|http-request|duckduckgo-search" \
  packages/ui/src/lib/chain-utils.ts \
  packages/server/src/engine/canvas-chain.ts
```
