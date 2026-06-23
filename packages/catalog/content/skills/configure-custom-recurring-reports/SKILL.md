---
name: configure-custom-recurring-reports
description: "Configure custom recurring reports. User defines data sources, skill handles scheduling and formatting."
category: "Data & Analytics"
author: community
version: "1.0.3"
icon: chart-bar
---

## Data Storage

```
~/report/
├── memory.md               # Index + preferences
├── {name}/
│   ├── config.md           # Report configuration
│   ├── data.jsonl          # Historical data
│   └── generated/          # Past reports
```

Create on first use: `mkdir -p ~/report`

## Scope

This skill:
- ✅ Stores report configurations in ~/report/
- ✅ Generates reports on schedule
- ✅ Delivers via channels user configures

**User-driven model:**
- User defines WHAT data to include
- User grants access to any needed sources
- User provides API keys if external data needed
- Skill handles SCHEDULING and FORMATTING

This skill does NOT:
- ❌ Access APIs without user-provided credentials
- ❌ Pull data from sources user hasn't specified
- ❌ Store credentials (user provides via environment)

## Environment Variables

**No fixed requirements.** User provides API keys as needed:

```bash
# Example: if user wants Stripe data
export STRIPE_API_KEY="sk_..."

# Example: if user wants GitHub data  
export GITHUB_TOKEN="ghp_..."
```

Config references env var name, never the value.

## Delivery Security

External delivery (Telegram/webhook/email) sends report content off-device.
- User explicitly configures each channel
- User responsible for trusting destination
- `file` delivery stays local (~/report/{name}/generated/)

## Quick Reference

| Task | File |
|------|------|
| Configuration schema | `schema.md` |
| Output formats | `formats.md` |
| Delivery options | `delivery.md` |

## Core Rules

### 1. User Defines Data Sources
When creating a report:
1. User specifies what data to track
2. If external API needed, user provides credentials
3. Credentials stored as env var references, not values

Example:
```
User: "Weekly report on my Stripe revenue"
Agent: "I'll need Stripe API access. Please set 
        STRIPE_API_KEY in your environment."
User: "Done"
→ Config stored with "source": {"type": "api", "env": "STRIPE_API_KEY"}
```

### 2. Report Configuration
In ~/report/{name}/config.md:
```yaml
name: weekly-revenue
schedule: "0 9 * * 1"  # Monday 9am
sources:
  - type: api
    env: STRIPE_API_KEY  # User provides
format: chat
delivery: telegram
```

### 3. Scheduling
| Frequency | Cron | Example |
|-----------|------|---------|
| Daily | `0 9 * * *` | 9am daily |
| Weekly | `0 9 * * 1` | Monday 9am |
| Monthly | `0 9 1 * *` | 1st of month |
| On-demand | - | When user asks |

### 4. Delivery Channels
User configures in config.md:
- `chat` — Reply in conversation
- `telegram` — Send to Telegram (user provides chat ID)
- `file` — Save to ~/report/{name}/generated/
- `email` — Send via user's configured mail

### 5. Managing Reports
```
"List my reports" → Read ~/report/memory.md
"Pause X report" → Update config
"Run X now" → Generate on-demand
```
