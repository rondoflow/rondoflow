---
name: find-domain-experts-online
description: "Find domain experts, thought leaders, and subject-matter authorities on any topic. Searches Twitter and Reddit for people who demonstrate deep knowledge, frequent discussion, and above-average expertise in a specific field. Expert discovery, talent sourcing, researcher identific…"
category: "AI & Agents"
author: community
version: "1.4.0"
icon: bot
---

# Expert Finder

Find domain experts by analyzing social media activity. Expands topics into search terms, searches Twitter/Reddit, classifies by type, and ranks.

## Setup

Run `xpoz-setup` skill. Verify: `mcporter call xpoz.checkAccessKeyStatus`

## 4-Phase Process

### Phase 1: Query Expansion

Research domain with `web_search`/`web_fetch`. Generate tiered queries:

| Tier | Purpose | Example (RLHF) |
|------|---------|----------------|
| Tier 1: Core | Exact terms | `"RLHF"` |
| Tier 2: Technical | Deep jargon (strongest signal) | `"reward model overfitting"` |
| Tier 3: Adjacent | Related | `"preference optimization"` |
| Tier 4: Discussion | Opinion | `"RLHF vs"` |

### Phase 2: Search & Aggregate

```bash
mcporter call xpoz.getTwitterPostsByKeywords query='"RLHF"' startDate="<6mo>"
mcporter call xpoz.checkOperationStatus operationId="op_..." # Poll every 5s
```

Download CSVs via `dataDumpExportOperationId` (64K rows). Build author frequency: ≥3 posts, ≥2 tiers. Weight Tier 2 highest.

### Phase 3: Classify & Score

Fetch profiles for top 20-30:
```bash
mcporter call xpoz.getTwitterUser identifier="user" identifierType="username"
```

**Types:** 🔬 Deep Expert (uses Tier 2 naturally) | 💡 Thought Leader (trends, large audience) | 🛠️ Practitioner ("I built") | 📣 Evangelist (aggregates) | 🎓 Educator (explains)

**Score (0-100):** Domain depth 30%, consistency 20%, peer recognition 20%, breadth 15%, credentials 15%.

### Phase 4: Report

```markdown
## Expert Report: [Domain] — X,XXX posts analyzed

#### 🥇 @username — 🔬 Deep Expert (92/100)
**Followers:** 12.4K | **Why:** 23 posts on reward optimization, advanced terminology
**Key:** "[quote]" — ❤️ 342
```

## Tips

Narrow > broad | Tier 2 jargon = gold | Reddit comments reveal depth | 6mo window ideal
