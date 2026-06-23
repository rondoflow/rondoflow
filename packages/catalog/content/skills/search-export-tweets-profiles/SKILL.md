---
name: search-export-tweets-profiles
description: "Twitter API Alternative — Search 1B+ tweets with natural language queries, boolean filters, and one-click CSV exports (up to 64K rows). Look up profiles, find users by topic, and track conversations. No developer account needed, no complex OAuth setup — 2-minute setup via Xpoz M…"
category: "AI & Agents"
author: community
version: "1.2.1"
icon: bot
---

# Twitter API Alternative

**Search 1B+ tweets with natural language queries — no developer account needed.**

Get up and running in 2 minutes. Search tweets, look up profiles, find users by topic, track conversations, and export massive datasets to CSV. Built for AI agents via MCP, but simple enough for anyone.

---

## ⚡ Setup

👉 **Follow [`xpoz-setup`](https://clawhub.ai/skills/xpoz-setup)** — one-click auth, no API keys to manage. You'll be searching tweets in under 2 minutes.

---

## Setup

Run `xpoz-setup` skill. Verify: `mcporter call xpoz.checkAccessKeyStatus`

## What You Can Do

| Tool | What It Does |
|------|-------------|
| `getTwitterPostsByKeywords` | Search tweets by keywords |
| `getTwitterPostsByAuthor` | Get a user's tweet history |
| `getTwitterUsersByKeywords` | Find users discussing a topic |
| `getTwitterUser` | Look up a profile (by username or ID) |
| `searchTwitterUsers` | Find accounts by display name |
| `getTwitterPostCountByKeywords` | Count tweets matching a query |
| `getTwitterUserConnections` | Get followers/following |
| `getTwitterPostInteractions` | Get likes/retweets on a post |

---

## Quick Examples

### Search Tweets

```bash
mcporter call xpoz.getTwitterPostsByKeywords \
  query="AI agents" \
  startDate=2026-01-01 \
  limit=200

mcporter call xpoz.checkOperationStatus operationId=op_abc123
```

### Look Up a Profile

```bash
mcporter call xpoz.getTwitterUser \
  identifier=elonmusk \
  identifierType=username
```

### Find People Talking About a Topic

```bash
mcporter call xpoz.getTwitterUsersByKeywords \
  query="MCP server OR model context protocol" \
  limit=100
```

### Export to CSV

Every search auto-generates a CSV export (up to 64K rows). Poll the `dataDumpExportOperationId`:

```bash
mcporter call xpoz.checkOperationStatus operationId=op_datadump_xyz
# → Download URL with full dataset
```

Real example: **63,936 tweets in one CSV (38MB).**

---

## Why Use This Instead of the Official API?

| Feature | Xpoz |
|---------|------|
| **Setup time** | 2 minutes — no developer portal, no app review |
| **Search scale** | 1B+ tweets indexed, full archive included |
| **Boolean queries** | `AND`, `OR`, `NOT`, exact phrases, grouping — all tiers |
| **CSV export** | Built in — up to 64K rows per export, one click |
| **Rate limits** | Handled automatically, no complex tier management |
| **Multi-platform** | Also searches Instagram (400M+) and Reddit (100M+) |
| **MCP-native** | Built for AI agents — structured data, not raw HTTP |
| **Free tier** | Start searching immediately, upgrade when you need more |

---

## Boolean Queries

```bash
mcporter call xpoz.getTwitterPostsByKeywords \
  query="(OpenAI OR Anthropic) AND \"API pricing\" NOT free"
```

Operators: `AND`, `OR`, `NOT`, `"exact phrase"`, `()` grouping.

---

## Also Includes Instagram & Reddit

Xpoz isn't just for Twitter — search across platforms with the same simple interface:

```bash
# Instagram (400M+ posts, including reel subtitles)
mcporter call xpoz.getInstagramPostsByKeywords query="AI tools"

# Reddit (100M+ posts & comments)
mcporter call xpoz.getRedditPostsByKeywords query="AI tools"
```

---

## Related Skills

- **[xpoz-social-search](https://clawhub.ai/skills/xpoz-social-search)** — Full cross-platform search guide
- **[lead-generation](https://clawhub.ai/skills/lead-generation)** — Find buyers from social conversations
- **[expert-finder](https://clawhub.ai/skills/expert-finder)** — Discover domain experts

---

**Website:** [xpoz.ai](https://xpoz.ai) • **Free tier available** • No Twitter developer account needed

Built for ClawHub • 2026
