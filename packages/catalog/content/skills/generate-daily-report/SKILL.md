---
name: generate-daily-report
description: "Track progress, report metrics, manage memory."
category: "Data & Analytics"
author: community
version: "1.0.0"
icon: chart-bar
---

# SKILL.md - Daily Report

## Purpose
Track progress, report metrics, manage memory.

## Model to Use
**local** (ollama) - simple aggregation, FREE

## Morning Report (Send at 9:30 AM Spain)

```
🤖 SKYNET MORNING BRIEFING - {{date}}

📊 PIPELINE
├─ Total leads: X
├─ Ready for outreach: X
├─ In sequence: X
├─ Awaiting reply: X

📬 OVERNIGHT
├─ Leads found: X
├─ Emails drafted: X
├─ Cost: $X.XX

🎯 TODAY'S PRIORITIES
1. [Based on pipeline status]
2. [Based on day of week]
3. [Based on targets]

💰 BUDGET
├─ Spent today: $X.XX
├─ Daily remaining: $X.XX
├─ Monthly remaining: $X.XX
```

## End of Day Report (Send at 9 PM Spain)

```
🤖 SKYNET EOD - {{date}}

📈 TODAY'S NUMBERS
├─ Leads sourced: X / 40 target
├─ DMs drafted: X / 25 target
├─ Emails drafted: X / 30 target
├─ Notion updated: ✓

💰 COST REPORT
├─ Today: $X.XX
├─ This week: $X.XX
├─ Budget remaining: $X.XX

🔥 HOT LEADS
[List any Priority A leads found]

⚠️ ISSUES
[List any blockers or errors]

📋 TOMORROW
[Next day priorities]

💾 Saved to memory/{{date}}.md
```

## Weekly Report (Sunday 8 PM)

```
🤖 SKYNET WEEKLY - Week of {{date}}

📊 TOTALS
├─ Leads sourced: X
├─ Outreach sent: X (DMs + Emails)
├─ Replies: X
├─ Qualified: X
├─ Closes: X

💰 COSTS
├─ This week: $X.XX
├─ Avg per lead: $X.XX
├─ Avg per qualified: $X.XX

📈 CONVERSION
├─ Source → Qualified: X%
├─ Outreach → Reply: X%
├─ Reply → Meeting: X%

🎯 VS TARGETS
├─ Revenue: $X / $5,000 goal
├─ Days remaining: X
├─ Needed per day: $X
```

## Memory File Format

Save to memory/YYYY-MM-DD.md:

```markdown
# {{date}} - Daily Log

## Metrics
- Leads sourced: X
- DMs drafted: X
- Emails drafted: X
- Cost: $X.XX

## Leads Found (Summary)
- Priority A: X
- Priority B: X
- Skipped: X

## Issues
[Any problems encountered]

## Notes
[Context for future sessions]

## Tomorrow
- [ ] Task 1
- [ ] Task 2
```

## Alerts (Send Immediately)

Trigger immediate Telegram alert for:
- Any reply detected
- Budget 75% depleted
- API error / rate limit
- Overnight run complete
- Task blocked / needs input
