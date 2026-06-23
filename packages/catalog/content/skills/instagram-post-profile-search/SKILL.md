---
name: instagram-post-profile-search
description: "Instagram Search — Search 400M+ Instagram posts, reels, and profiles. Find influencers, track hashtags, analyze engagement, and export data. No Instagram API or Meta developer account needed — works through Xpoz MCP."
category: "AI & Agents"
author: community
version: "1.1.1"
icon: bot
---

# Instagram Search

**Search 400M+ Instagram posts and reels — captions AND video subtitles.**

Find influencers, track hashtags, discover content trends, and export results. No Meta developer account, no Instagram Graph API setup, no app review process.

---

## ⚡ Setup

👉 **Follow [`xpoz-setup`](https://clawhub.ai/skills/xpoz-setup)** — handles auth automatically.

---

## Setup

Run `xpoz-setup` skill. Verify: `mcporter call xpoz.checkAccessKeyStatus`

## What You Can Search

| Tool | What It Does |
|------|-------------|
| `getInstagramPostsByKeywords` | Search posts & reels by keywords |
| `getInstagramUsersByKeywords` | Find users posting about a topic |
| `getInstagramUser` | Look up a specific profile |
| `searchInstagramUsers` | Find accounts by display name |
| `getInstagramPostsByAuthor` | Get a user's post history |

---

## Quick Examples

### Search Posts & Reels

```bash
mcporter call xpoz.getInstagramPostsByKeywords \
  query="sustainable fashion" \
  startDate=2026-01-01 \
  limit=100

# Poll for results:
mcporter call xpoz.checkOperationStatus operationId=op_abc123
```

Xpoz indexes both **captions** and **video subtitles** — so you can find reels by what people *say*, not just what they type.

### Find Influencers by Topic

```bash
mcporter call xpoz.getInstagramUsersByKeywords \
  query="fitness transformation OR workout routine" \
  limit=200
```

### Look Up a Profile

```bash
mcporter call xpoz.getInstagramUser \
  identifier=natgeo \
  identifierType=username
```

### Search by Display Name

```bash
mcporter call xpoz.searchInstagramUsers query="National Geographic" limit=20
```

---

## Boolean Queries

```bash
mcporter call xpoz.getInstagramPostsByKeywords \
  query="(vegan OR plant-based) AND recipe NOT sponsored"
```

---

## CSV Export

Every search generates a full export. Poll the `dataDumpExportOperationId` for a CSV download URL (up to 64K rows).

---

## Why Not Use the Instagram API Directly?

| | Instagram Graph API | Xpoz Instagram Search |
|--|-------------------|----------------------|
| **Setup** | Meta developer account + app review | One-click Xpoz auth |
| **Keyword search** | ❌ Not available | ✅ Full-text + subtitles |
| **Find influencers** | Only if you know their username | Search by topic/content |
| **Reels content** | Metadata only | Captions + spoken words |
| **Export** | Manual pagination | One-click CSV |
| **Cost** | Free but painful setup | Free tier available |

The Instagram Graph API doesn't support keyword search at all. Xpoz fills that gap.

---

## Related Skills

- **[xpoz-social-search](https://clawhub.ai/skills/xpoz-social-search)** — Cross-platform (Twitter + Instagram + Reddit)
- **[expert-finder](https://clawhub.ai/skills/expert-finder)** — Find domain experts
- **[social-lead-gen](https://clawhub.ai/skills/social-lead-gen)** — Find potential customers

---

**Website:** [xpoz.ai](https://xpoz.ai) • **Free tier available** • No Meta developer account needed

Built for ClawHub • 2026
