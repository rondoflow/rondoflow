---
name: monitor-competitor-website-changes
description: "Know what your competitors ship before their customers do. Automated monitoring of competitor websites, product pages, pricing, content, and social presence. Detects changes, extracts new features, tracks pricing updates, and alerts you with digestible summaries. Your agent watc…"
category: "AI & Agents"
author: community
version: "1.1.0"
icon: bot
---

# Competitor Watch — Your 24/7 Competitive Intelligence Agent

**They ship a feature. You know in minutes, not weeks.**

Competitor Watch monitors your competitive landscape automatically—websites, product pages, pricing, blog posts, social accounts—and alerts you when something changes. No more finding out your rival launched that feature you've been building after their customers already know about it.

**What makes it different:** Tiered monitoring (fierce rivals get deep tracking, adjacents get high-level), intelligent diffing (highlights what matters, filters noise), and digestible summaries that tell you *so what* instead of dumping raw HTML changes.

## The Problem

You're a founder or product leader. You have 3-5 direct competitors and maybe a dozen companies in adjacent spaces. They're all shipping, pricing, pivoting, and posting. You check manually when you remember (usually when a customer mentions it). By the time you notice a major move, it's too late to react strategically.

Manual competitive intelligence doesn't scale. Bookmarking competitor URLs and checking them weekly doesn't work. You need an agent that watches constantly and only interrupts when something actually matters.

## What It Does

- **Website Monitoring**: Track homepage, product pages, pricing pages, docs
- **Change Detection**: Smart diffing that filters out timestamps, session IDs, ads
- **Content Extraction**: Pull new blog posts, feature announcements, case studies
- **Pricing Tracking**: Detect price changes, plan additions, new tiers
- **Social Listening**: Monitor Twitter/LinkedIn for major announcements
- **Tiered Tracking**: Deep monitoring for direct rivals, high-level for adjacents
- **Smart Alerts**: Summaries that tell you *what changed* and *why it matters*

## Setup

1. Run `scripts/setup.sh` to initialize config and data directories
2. Edit `~/.config/competitor-watch/config.json` with your competitive landscape
3. Add competitors: `scripts/add-competitor.sh "CompanyName" https://example.com --tier=fierce`
4. Test monitoring: `scripts/check.sh --dry-run`
5. Set up cron or heartbeat: Run `check.sh` every 30-60 minutes

## Config

Config lives at `~/.config/competitor-watch/config.json`. See `config.example.json` for full schema.

Key sections:
- **competitors** — List of companies to track (name, URLs, tier, tags)
- **tiers** — Define monitoring depth (fierce, important, watching, adjacent)
- **monitoring** — What to track (pages, content, pricing, social)
- **diffing** — Change detection settings (ignore patterns, similarity threshold)
- **alerts** — When and how to notify (min change size, cooldown, channel)
- **scheduling** — Check frequency per tier

### Tiered Monitoring

**Fierce** (direct competitors in every deal):
- Check every 30 minutes
- Monitor: pricing, features, docs, blog, social
- Alert on: any meaningful change
- Keep: 90 days of snapshots

**Important** (frequent competitive overlap):
- Check every 2 hours
- Monitor: pricing, features, blog
- Alert on: medium+ changes
- Keep: 30 days of snapshots

**Watching** (potential future threat):
- Check daily
- Monitor: homepage, blog
- Alert on: major changes only
- Keep: 14 days of snapshots

**Adjacent** (different market, relevant trends):
- Check weekly
- Monitor: blog, major announcements
- Alert on: significant pivots or launches
- Keep: 7 days of snapshots

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/setup.sh` | Initialize config and data directories |
| `scripts/add-competitor.sh` | Add a competitor (interactive or flags) |
| `scripts/check.sh` | Run monitoring sweep (all or specific tier) |
| `scripts/diff.sh` | Compare snapshots, generate change report |
| `scripts/report.sh` | Format digest of recent changes |

All scripts support `--dry-run` for testing without storing snapshots.

## Monitoring Cycle

Run `scripts/check.sh` on schedule (cron or heartbeat). The check:
1. Loads competitor list filtered by tier schedule
2. Fetches each configured URL (web_fetch or browser if needed)
3. Stores snapshot with timestamp
4. Compares to previous snapshot (calls `diff.sh`)
5. Scores change significance (text diff size, pricing changes, new sections)
6. Generates alert if threshold met
7. Updates last-check timestamp and change log

## Diffing Logic

`diff.sh` does intelligent comparison:

**Filters out noise:**
- Timestamps, session IDs, cache busters (`?v=123`)
- Dynamic ad content, tracking pixels
- Social share counts, "Last updated" dates
- Common CMS artifacts

**Highlights signal:**
- New product sections or features
- Pricing/plan changes (keyword matching)
- Added/removed navigation items
- New blog posts or case studies
- Significant text additions (>200 words)

**Change scoring:**
- Minor: <5% content change, cosmetic updates → No alert
- Medium: 5-15% change, new blog post → Alert if Important+ tier
- Major: >15% change, pricing update, new product section → Always alert
- Critical: Explicit keywords ("launching", "announcing", "now available") → Urgent alert

## Alerts

When a meaningful change is detected, `report.sh` generates a summary:

```
🚨 COMPETITOR CHANGE: Acme Corp (fierce rival)

Page: https://acme.com/pricing
Detected: 2026-02-11 13:45 EST
Change: MAJOR (pricing update + new tier)

What changed:
• New "Enterprise" tier added at $999/mo
• "Pro" tier price increased from $49 to $79 (+61%)
• Added "Custom AI workflows" feature to all plans

Raw diff: ~/.config/competitor-watch/data/snapshots/acme-corp/pricing/diff-2026-02-11-1345.txt

—
View full snapshot: check.sh --snapshot acme-corp pricing
```

Alerts respect cooldown (don't spam on every tiny update) and tier settings.

## Adding Competitors

Interactive mode:
```bash
scripts/add-competitor.sh
# Prompts for: name, homepage, tier, pages to track, tags
```

Flag mode:
```bash
scripts/add-competitor.sh "Acme Corp" https://acme.com \
  --tier fierce \
  --pages pricing,features,blog \
  --tags "direct-competitor,ai-tools" \
  --twitter @acmecorp
```

## Managing Competitors

```bash
# List all
scripts/check.sh --list

# Check specific competitor
scripts/check.sh --competitor "Acme Corp"

# Check tier only
scripts/check.sh --tier fierce

# View change history
scripts/report.sh --competitor "Acme Corp" --days 30

# Update tier
# (Edit ~/.config/competitor-watch/config.json, or re-run add-competitor)
```

## Data Files

```
~/.config/competitor-watch/
├── config.json              # Competitor list and settings
├── data/
│   ├── snapshots/
│   │   ├── acme-corp/
│   │   │   ├── pricing/
│   │   │   │   ├── 2026-02-11-1000.txt
│   │   │   │   ├── 2026-02-11-1030.txt
│   │   │   │   └── diff-2026-02-11-1030.txt
│   │   │   └── features/...
│   │   └── competitor-b/...
│   ├── change-log.json      # All detected changes
│   ├── last-checks.json     # When each URL was last checked
│   └── alert-history.json   # Sent alerts (for cooldown)
└── reports/
    └── daily-digest-2026-02-11.md
```

## Scheduling

### Cron (recommended for production)
```bash
# Check fierce rivals every 30 min
*/30 * * * * /path/to/skills/competitor-watch/scripts/check.sh --tier fierce

# Check important every 2 hours
0 */2 * * * /path/to/skills/competitor-watch/scripts/check.sh --tier important

# Daily digest report at 9 AM
0 9 * * * /path/to/skills/competitor-watch/scripts/report.sh --daily
```

### Heartbeat (for integrated monitoring)
Add to your `HEARTBEAT.md`:
```markdown
## Competitor Watch
- Run `skills/competitor-watch/scripts/check.sh --tier fierce` (if >30 min since last)
- Check alert-history.json for unsent alerts
```

## Integration with Clawdbot

Alerts can be sent via:
- **Telegram/Discord/Slack**: Direct message with summary
- **File**: Write report to workspace, mention in next interaction
- **Heartbeat**: Surface in proactive check ("Acme Corp updated pricing")

## Best Practices

**Tier carefully:**
- Only 2-3 competitors should be "fierce" (high monitoring cost)
- Use "important" for companies in 30%+ of deals
- "Watching" for emerging threats or fast-growing startups
- "Adjacent" for market signals, not tactical intel

**Focus on delta:**
- You don't need to read their entire website daily
- The diff is the product—new features, pricing changes, messaging shifts
- Archive old snapshots after tier retention window

**Combine with human intel:**
- Competitor Watch automates the tedious part (checking URLs)
- You still need: sales call notes, customer chatter, market analysis
- Use this skill to ensure you never miss the *public* signals

**Avoid over-alerting:**
- Set thresholds appropriate to tier (minor changes on fierce rivals OK, but only major for adjacents)
- Use cooldown periods (don't alert twice in 6 hours for same page)
- Weekly digest > real-time spam for lower tiers

## Use Cases

**Product team:**
- Track feature launches → Validate roadmap prioritization
- Monitor docs/changelogs → Understand their capabilities
- Watch integrations page → Know their ecosystem moves

**Sales/GTM:**
- Pricing changes → Update battlecards and objection handling
- New case studies → Understand their positioning and wins
- Messaging shifts → Adjust competitive positioning

**Marketing:**
- Content velocity → Benchmark publishing cadence
- Campaign themes → Spot market narrative shifts
- Social engagement → Understand what resonates

**Founders:**
- High-level awareness without daily manual checking
- React strategically to major moves (launches, pivots, funding)
- Focus on building, not obsessing over competitors

## Privacy & Ethics

- Only monitors **public** web content
- Respects robots.txt and rate limits
- No scraping of authenticated/paywalled content
- No impersonation or deceptive data collection
- Use for competitive intelligence, not corporate espionage

## Future Enhancements

- **Social listening**: Twitter/LinkedIn post monitoring (beyond just checking profile)
- **GitHub tracking**: Public repo commits, release notes, contributor activity
- **Product Hunt launches**: Auto-add when competitor ships on PH
- **App store monitoring**: iOS/Android app updates, rating changes
- **Job postings**: Track hiring (eng roles = product expansion signals)
- **LLM-powered summaries**: GPT-4 analysis of change significance
- **Slack/Discord webhooks**: Push alerts to team channels
- **Browser automation**: Handle JS-heavy sites that web_fetch can't parse

---

**Know what they're shipping. Before their customers do.**
