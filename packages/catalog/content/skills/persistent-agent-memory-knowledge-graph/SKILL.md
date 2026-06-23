---
name: persistent-agent-memory-knowledge-graph
description: "Persistent memory for OpenClaw agents. Store decisions, preferences, and context that survive across sessions. Build knowledge graphs that compound over time. Hybrid search (BM25 + vector + graph) recalls what matters when you need it."
category: "AI & Agents"
author: community
version: "1.0.7"
icon: bot
---

# Penfield Memory

Persistent memory that compounds. Your agent remembers conversations, learns preferences, connects ideas, and picks up exactly where it left off—across sessions, days, and channels.

## Install

```
openclaw plugins install openclaw-penfield
openclaw penfield login
openclaw gateway restart
```

Sign up: https://portal.penfield.app/sign-up

## Every Session Starts Here

Always do this first, before anything else:

```
penfield_awaken()
penfield_reflect({ time_window: "7d" })
```

`awaken` loads your identity and personality context. `reflect` orients you on recent work. Without these, you're starting cold.

## Tools

### Memory

| Tool | Purpose | When to use |
|------|---------|-------------|
| `penfield_store` | Save a memory | User shares preferences, you make a discovery, a decision is made, you learn something worth keeping |
| `penfield_recall` | Hybrid search (BM25 + vector + graph) | Need context before responding, resuming a topic, looking up prior decisions |
| `penfield_search` | Semantic search (higher vector weight) | Fuzzy concept search when you don't have exact terms |
| `penfield_fetch` | Get memory by ID | Following up on a specific memory from recall results |
| `penfield_update_memory` | Edit existing memory | Correcting, adding detail, changing importance or tags |

### Knowledge Graph

| Tool | Purpose | When to use |
|------|---------|-------------|
| `penfield_connect` | Link two memories | New info relates to existing knowledge, building understanding over time |
| `penfield_explore` | Traverse graph from a memory | Understanding how ideas connect, finding related context |

### Context & Analysis

| Tool | Purpose | When to use |
|------|---------|-------------|
| `penfield_save_context` | Checkpoint a session | Ending substantive work, preparing for handoff to another agent |
| `penfield_restore_context` | Resume from checkpoint | Picking up where you or another agent left off |
| `penfield_list_contexts` | List saved checkpoints | Finding previous sessions to resume |
| `penfield_reflect` | Analyze memory patterns | Session start orientation, finding themes, spotting gaps |

### Artifacts

| Tool | Purpose | When to use |
|------|---------|-------------|
| `penfield_save_artifact` | Store a file | Saving diagrams, notes, code, reference docs |
| `penfield_retrieve_artifact` | Get a file | Loading previously saved work |
| `penfield_list_artifacts` | List stored files | Browsing saved artifacts |
| `penfield_delete_artifact` | Remove a file | Cleaning up outdated artifacts |

## Writing Memories That Actually Work

Memory content quality determines whether Penfield is useful or useless. The difference is specificity and context.

**Bad — vague, no context, unfindable later:**
```
"User likes Python"
```

**Good — specific, contextual, findable:**
```
"[Preferences] User prefers Python over JavaScript for backend work.
Reason: frustrated by JS callback patterns and lack of type safety.
Values type hints and explicit error handling. Uses FastAPI for APIs."
```

**What makes a memory findable:**

1. **Context prefix** in brackets: `[Preferences]`, `[Project: API Redesign]`, `[Investigation: Payment Bug]`, `[Decision]`
2. **The "why" behind the "what"** — rationale matters more than the fact itself
3. **Specific details** — names, numbers, dates, versions, not vague summaries
4. **References to related memories** — "This builds on [earlier finding about X]" or "Contradicts previous assumption that Y"

## Memory Types

Use the correct type. The system uses these for filtering and analysis.

| Type | Use for | Example |
|------|---------|---------|
| `fact` | Verified, durable information | "User's company runs Kubernetes on AWS EKS" |
| `insight` | Patterns or realizations | "Deployment failures correlate with Friday releases" |
| `correction` | Fixing prior understanding | "CORRECTION: The timeout isn't Redis — it's a hardcoded batch limit" |
| `conversation` | Session summaries, notable exchanges | "Discussed migration strategy. User leaning toward incremental approach" |
| `reference` | Source material, citations | "RFC 8628 defines Device Code Flow for OAuth on input-constrained devices" |
| `task` | Work items, action items | "TODO: Benchmark recall latency after index rebuild" |
| `strategy` | Approaches, methods, plans | "For user's codebase: always check types.ts first, it's the source of truth" |
| `checkpoint` | Milestone states | "Project at 80% — auth complete, UI remaining" |
| `identity_core` | Immutable identity facts | Set via personality config, rarely stored manually |
| `personality_trait` | Behavioral patterns | Set via personality config, rarely stored manually |
| `relationship` | Entity connections | "User works with Chad Schultz on cybersecurity content" |

## Importance Scores

Use the full range. Not everything is 0.5.

| Score | Meaning | Example |
|-------|---------|---------|
| 0.9–1.0 | Critical — never forget | Architecture decisions, hard-won corrections, core preferences |
| 0.7–0.8 | Important — reference often | Project context, key facts about user's work |
| 0.5–0.6 | Normal — useful context | General preferences, session summaries |
| 0.3–0.4 | Minor — background detail | Tangential facts, low-stakes observations |
| 0.1–0.2 | Trivial — probably don't store | If you're questioning whether to store it, don't |

## Connecting Memories

Connections are what make Penfield powerful. An isolated memory is just a note. A connected memory is understanding.

**After storing a memory, always ask:** What does this relate to? Then connect it.

### Relationship Types (24)

**Knowledge Evolution:** `supersedes` · `updates` · `evolution_of`
Use when understanding changes. "We thought X, now we know Y."

**Evidence:** `supports` · `contradicts` · `disputes`
Use when new information validates or challenges existing beliefs.

**Hierarchy:** `parent_of` · `child_of` · `sibling_of` · `composed_of` · `part_of`
Use for structural relationships. Topics containing subtopics, systems containing components.

**Causation:** `causes` · `influenced_by` · `prerequisite_for`
Use for cause-and-effect chains and dependencies.

**Implementation:** `implements` · `documents` · `tests` · `example_of`
Use when something demonstrates, describes, or validates something else.

**Conversation:** `responds_to` · `references` · `inspired_by`
Use for attribution and dialogue threads.

**Sequence:** `follows` · `precedes`
Use for ordered steps in a process or timeline.

**Dependencies:** `depends_on`
Use when one thing requires another.

## Recall Strategy

Good queries find things. Bad queries return noise.

**Tune search weights for your query type:**

| Query type | bm25_weight | vector_weight | graph_weight |
|-----------|-------------|---------------|--------------|
| Exact term lookup ("Twilio auth token") | 0.6 | 0.3 | 0.1 |
| Concept search ("how we handle errors") | 0.2 | 0.6 | 0.2 |
| Connected knowledge ("everything about payments") | 0.2 | 0.3 | 0.5 |
| Default (balanced) | 0.4 | 0.4 | 0.2 |

**Filter aggressively:**
- `memory_types: ["correction", "insight"]` to find discoveries and corrections
- `importance_threshold: 0.7` to skip noise
- `enable_graph_expansion: true` to follow connections (default, usually leave on)

## Workflows

### User shares a preference

```
penfield_store({
  content: "[Preferences] User wants responses under 3 paragraphs unless complexity demands more. Dislikes bullet points in casual conversation.",
  memory_type: "fact",
  importance: 0.8,
  tags: ["preferences", "communication"]
})
```

### Investigation tracking

```
// Start
penfield_store({
  content: "[Investigation: Deployment Failures] Reports of 500 errors after every Friday deploy. Checking release pipeline, config drift, and traffic patterns.",
  memory_type: "task",
  importance: 0.7,
  tags: ["investigation", "deployment"]
})

// Discovery — connect to the investigation
discovery = penfield_store({
  content: "[Investigation: Deployment Failures] INSIGHT: Friday deploys coincide with weekly batch job at 17:00 UTC. Both compete for DB connection pool. Not a deploy issue — it's resource contention.",
  memory_type: "insight",
  importance: 0.9,
  tags: ["investigation", "deployment", "root-cause"]
})
penfield_connect({
  from_memory_id: discovery.id,
  to_memory_id: initial_report.id,
  relationship_type: "responds_to"
})

// Correction — supersede wrong assumption
correction = penfield_store({
  content: "[Investigation: Deployment Failures] CORRECTION: Not a CI/CD problem. Friday batch job + deploy = connection pool exhaustion. Fix: stagger batch job to 03:00 UTC.",
  memory_type: "correction",
  importance: 0.9,
  tags: ["investigation", "deployment", "correction"]
})
penfield_connect({
  from_memory_id: correction.id,
  to_memory_id: initial_report.id,
  relationship_type: "supersedes"
})
```

### Session handoff

```
penfield_save_context({
  memory_ids: [discovery.id, correction.id, initial_report.id],
  session_id: "deployment-investigation-2026-02"
})
```

Next session or different agent:

```
penfield_restore_context({
  checkpoint_id: "checkpoint-uuid",
  merge_mode: "append"
})
```

## What NOT to Store

- Verbatim conversation transcripts (too verbose, low signal)
- Easily googled facts (use web search instead)
- Ephemeral task state (use working memory)
- Anything the user hasn't consented to store about themselves
- Every minor exchange (be selective — quality over quantity)

## Tags

Keep them short, consistent, lowercase. 2–5 per memory.

Good: `preferences`, `architecture`, `investigation`, `correction`, `project-name`
Bad: `2026-02-02`, `important-memory-about-deployment`, `UserPreferencesForCommunicationStyle`

## Also Available Outside OpenClaw

The native OpenClaw plugin is the fastest path, but Penfield works with any AI tool anywhere:

**Claude Connectors** 

```json
Name: Penfield
Remote MCP server URL: https://mcp.penfield.app
```

**Claude Code**
```
Claude mcp add --transport http --scope user penfield https://mcp.penfield.app
```


**MCP Server** — for Gemini CLI, Cursor, Windsurf, Intent, Perplexity Desktop or any MCP-compatible tool:

```json
{
  "mcpServers": {
    "penfield": {
      "command": "npx",
      "args": [
        "mcp-remote@latest",
        "https://mcp.penfield.app/"
      ]
    }
  }
}
```

**API** — direct HTTP access at `api.penfield.app` for custom integrations.

Same memory, same knowledge graph, same account. The plugin is 4-5x faster (no MCP proxy layer), but everything stays in sync regardless of how you connect.

## Links

- Plugin: [openclaw-penfield on npm](https://www.npmjs.com/package/openclaw-penfield)
- Source: [github.com/penfieldlabs/openclaw-penfield](https://github.com/penfieldlabs/openclaw-penfield)
- Sign up: [portal.penfield.app/sign-up](https://portal.penfield.app/sign-up)
- Website: [penfield.app](https://penfield.app)
- X: [@penfieldlabs](https://x.com/penfieldlabs)
