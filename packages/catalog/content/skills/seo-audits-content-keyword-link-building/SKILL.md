---
name: seo-audits-content-keyword-link-building
description: "SEO specialist agent with site audits, content writing, keyword research, technical fixes, link building, and ranking strategies."
category: "AI & Agents"
author: community
version: "1.0.3"
icon: bot
---

## Setup

On first use, read `setup.md` for workspace integration.

## When to Use

Agent needs to handle SEO: site audits, content optimization, keyword research, technical fixes, link strategies, local SEO, schema markup, or ranking improvements.

## Architecture

SEO workspace at `~/seo/`. See `memory-template.md` for setup.

```
~/seo/
├── memory.md        # Site profiles, audit history, keyword tracking
├── audits/          # Site audit reports
└── content/         # SEO content drafts
```

## Quick Reference

| Topic | File |
|-------|------|
| Title tags, meta descriptions, headers, keyword placement | `on-page.md` |
| Core Web Vitals, crawlability, mobile, indexing | `technical.md` |
| Search intent, E-E-A-T, content writing | `content.md` |
| Google Business, NAP consistency, local keywords | `local.md` |
| JSON-LD, Article, LocalBusiness, FAQ, Product schema | `schema.md` |
| Internal linking, anchor text, backlink strategies | `links.md` |
| Keyword research and competitive analysis | `keywords.md` |

## Core Rules

### 1. Audit Before Action
Run complete site audit before recommendations. Check: indexing, crawl errors, Core Web Vitals, mobile usability, duplicate content, broken links. No guessing.

### 2. Search Intent First
Match content format to query intent. Informational → guides. Transactional → product pages. Commercial → comparisons. Wrong format = no ranking.

### 3. Content That Ranks
Write SEO content that serves users AND search engines. Answer the query in first 100 words. Cover topic comprehensively. Include LSI keywords naturally. Add FAQ section for People Also Ask.

### 4. Technical Foundation
Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1. Mobile-first. HTTPS. Canonical URLs. Clean sitemap. No blocked resources. Technical issues kill rankings.

### 5. E-E-A-T Signals
Experience, Expertise, Authoritativeness, Trustworthiness. Author bios with credentials. About page. External citations. Especially critical for YMYL topics.

### 6. Link Strategy
Internal linking builds topical authority. Anchor text matters. External links to authoritative sources help. Never buy links or participate in schemes.

### 7. Measure Everything
Track rankings, organic traffic, CTR, conversions. Use Search Console data. Iterate based on results, not assumptions.

## SEO Audit Checklist

**Indexing:**
- [ ] Site indexed in Google (site:domain.com)
- [ ] No important pages blocked in robots.txt
- [ ] XML sitemap submitted to Search Console
- [ ] No noindex on pages that should rank

**Technical:**
- [ ] Core Web Vitals passing
- [ ] Mobile-friendly
- [ ] HTTPS with no mixed content
- [ ] No crawl errors in Search Console
- [ ] Clean URL structure

**On-Page:**
- [ ] Unique title tags (50-60 chars)
- [ ] Meta descriptions (150-160 chars)
- [ ] One H1 per page with keyword
- [ ] Proper heading hierarchy
- [ ] Images with alt text
- [ ] Internal links

**Content:**
- [ ] Search intent matched
- [ ] Comprehensive coverage
- [ ] No thin content
- [ ] No duplicate content
- [ ] Fresh and updated

**Off-Page:**
- [ ] Google Business Profile (local)
- [ ] Quality backlink profile
- [ ] No toxic links

## Content Writing Process

1. **Keyword research** — Find target keyword, search volume, difficulty
2. **Intent analysis** — What format ranks? What do users want?
3. **Outline** — Cover all subtopics competitors cover + more
4. **Write** — Answer query fast, be comprehensive, natural keywords
5. **Optimize** — Title, meta, headers, internal links, schema
6. **Publish** — Submit to Search Console, monitor rankings

## Common Traps

- Writing content without checking search intent → won't rank
- Ignoring Core Web Vitals → rankings tank
- Keyword stuffing → penalties
- Duplicate title tags → wasted crawl budget
- No internal linking → poor topical authority
- Buying links → manual action risk

## Related Skills
Install with `clawhub install <slug>` if user confirms:

- `content-marketing` — Content strategy
- `analytics` — Traffic analysis
- `market-research` — Competitive analysis
- `html` — HTML optimization
- `web` — Web development

## Feedback

- If useful: `clawhub star seo`
- Stay updated: `clawhub sync`
