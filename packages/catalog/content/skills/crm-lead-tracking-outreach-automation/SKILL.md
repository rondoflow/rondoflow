---
name: crm-lead-tracking-outreach-automation
description: "CRM integration, lead tracking, outreach automation, and pipeline management. Transform your AI agent into a sales assistant that never lets leads slip through the cracks."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# Sales Skill 💼

**Turn your AI agent into an elite sales operations partner.**

Track leads, manage pipelines, automate outreach, and never lose a deal to poor follow-up again.

---

## What This Skill Does

✅ **Lead Tracking** — Capture, qualify, and track leads through your pipeline
✅ **CRM Integration** — Work with your existing CRM or use built-in tracking
✅ **Outreach Automation** — Generate personalized outreach sequences
✅ **Pipeline Management** — Track deals, forecast revenue, identify bottlenecks
✅ **Follow-up Automation** — Never miss a follow-up again
✅ **Sales Analytics** — Track conversion rates, velocity, and win/loss reasons

---

## Quick Start

1. Set up your sales workspace:
```bash
./scripts/sales-init.sh
```

2. Configure your preferences in `TOOLS.md`:
```markdown
### Sales
- CRM: [HubSpot/Salesforce/Notion/Built-in]
- Default pipeline stages: [Stages]
- Follow-up cadence: [Days between touchpoints]
- Meeting booking link: [URL]
```

3. Start tracking leads!

---

## Lead Management

### Lead Qualification Framework (BANT)

| Criteria | Question | Weight |
|----------|----------|--------|
| **Budget** | Can they afford it? | 25% |
| **Authority** | Are they the decision-maker? | 25% |
| **Need** | Do they have a real problem you solve? | 30% |
| **Timeline** | When do they need a solution? | 20% |

**Lead Score Thresholds:**
- 80-100: Hot 🔥 — Contact immediately
- 60-79: Warm — Nurture actively
- 40-59: Cool — Keep in nurture sequence
- 0-39: Cold — Low priority

### Lead Capture Template

```markdown
# Lead: [Company Name]

## Contact Info
- **Name:** [Full Name]
- **Title:** [Job Title]
- **Email:** [Email]
- **Phone:** [Phone]
- **LinkedIn:** [URL]
- **Company:** [Company]
- **Website:** [URL]

## Qualification (BANT)
- **Budget:** [Yes/No/Unknown] — [Notes]
- **Authority:** [Decision-maker/Influencer/User] — [Notes]
- **Need:** [Strong/Moderate/Weak] — [Notes]
- **Timeline:** [Immediate/1-3mo/3-6mo/6mo+] — [Notes]
- **Lead Score:** [X/100]

## Source
- **How they found us:** [Source]
- **First touchpoint:** [Date]
- **Initial interest:** [What they asked about]

## Notes
[Relevant context, pain points, opportunities]

## Next Action
- [ ] [Action] — Due: [Date]
```

---

## Pipeline Management

### Standard Pipeline Stages

| Stage | Definition | Typical Actions |
|-------|------------|-----------------|
| **Lead** | Initial contact, not yet qualified | Qualify, research, initial outreach |
| **Qualified** | BANT criteria met | Discovery call, needs analysis |
| **Discovery** | Understanding needs | Demo prep, stakeholder mapping |
| **Demo/Proposal** | Presenting solution | Demo, proposal creation |
| **Negotiation** | Terms discussion | Handle objections, negotiate |
| **Closed Won** | Deal signed | Onboarding handoff |
| **Closed Lost** | Deal lost | Loss analysis, nurture |

### Pipeline Tracking Template

```markdown
# Sales Pipeline — [Month]

## Summary
- Total pipeline value: $[X]
- Weighted pipeline: $[X]
- Deals in pipeline: [X]
- Expected closes this month: [X]

## By Stage

### Lead ([X] deals, $[X])
| Company | Value | Owner | Last Activity | Next Step |
|---------|-------|-------|---------------|-----------|
| [Name] | $[X] | [You] | [Date] | [Action] |

### Qualified ([X] deals, $[X])
...

### Demo/Proposal ([X] deals, $[X])
...

### Negotiation ([X] deals, $[X])
...

## Stale Deals (>14 days no activity)
| Company | Stage | Last Activity | Recommended Action |
|---------|-------|---------------|-------------------|
```

### Pipeline Velocity Metrics

| Metric | How to Calculate | Target |
|--------|------------------|--------|
| **Win Rate** | Won ÷ (Won + Lost) | >25% |
| **Average Deal Size** | Total Won ÷ # Won | Track trend |
| **Sales Cycle** | Avg days from Lead → Won | <30 days |
| **Pipeline Coverage** | Pipeline ÷ Quota | 3x+ |

---

## Outreach Automation

### Cold Outreach Sequence

**Day 1: Initial Email**
```
Subject: [Personalized hook based on research]

Hi [Name],

[Observation about their company/role — show you did research].

[One sentence about what you do and why it's relevant to them].

[Specific question or soft CTA].

Best,
[Your name]
```

**Day 3: Follow-up 1**
```
Subject: Re: [Original subject]

Hi [Name],

Wanted to make sure this didn't get buried — [brief restate of value].

[New angle or additional value point].

Worth a quick chat?

[Your name]
```

**Day 7: Follow-up 2 (Value Add)**
```
Subject: [Related resource or insight]

Hi [Name],

Found this [article/resource/insight] and thought of you: [link]

[Brief explanation of why it's relevant].

If this resonates, happy to share how we helped [similar company] with [similar challenge].

[Your name]
```

**Day 14: Break-up Email**
```
Subject: Should I close your file?

Hi [Name],

I haven't heard back, so I'm assuming the timing isn't right.

No worries — I'll close out my notes for now.

If things change, feel free to reply anytime.

[Your name]
```

### Personalization Research Checklist

Before outreach, gather:
- [ ] Recent company news (funding, launch, hire)
- [ ] LinkedIn activity (posts, comments, likes)
- [ ] Company blog/newsletter
- [ ] Mutual connections
- [ ] Tech stack (if relevant)
- [ ] Competitors they might use

---

## Follow-up System

### Never Miss a Follow-up

**The Rule:** Every deal has a next action with a due date. No exceptions.

**Follow-up Cadence by Stage:**
| Stage | Check-in Frequency |
|-------|--------------------|
| Lead | Every 3-5 days |
| Qualified | Every 2-3 days |
| Demo/Proposal | Every 1-2 days |
| Negotiation | Daily |

### Follow-up Reminder Template

```markdown
# Daily Follow-up Queue

## Due Today
| Lead | Stage | Last Contact | Reason | Next Action |
|------|-------|--------------|--------|-------------|
| [Co] | [Stage] | [Date] | [Context] | [Action] |

## Overdue
| Lead | Stage | Days Overdue | Priority |
|------|-------|--------------|----------|
| [Co] | [Stage] | [X] days | 🔥/⚠️ |
```

---

## Meeting Management

### Pre-Meeting Research Template

```markdown
# Meeting Prep: [Company]
**Date:** [Date/Time]
**Attendees:** [Names, titles]

## Company Research
- Founded: [Year]
- Size: [Employees]
- Funding: [Stage/Amount]
- Recent news: [Key items]

## Attendee Research
- [Name 1]: [Background, relevant info]
- [Name 2]: [Background, relevant info]

## Their Likely Pain Points
1. [Pain point based on research]
2. [Pain point based on research]

## Questions to Ask
1. [Discovery question]
2. [Discovery question]
3. [Qualification question]

## Our Value Proposition for Them
[Customized pitch based on research]

## Objections to Expect
1. [Likely objection] → [Response]
2. [Likely objection] → [Response]

## Meeting Goals
1. [Specific goal]
2. [Specific goal]
```

### Post-Meeting Notes Template

```markdown
# Meeting Notes: [Company] — [Date]

## Attendees
- [Name, Title]

## Key Takeaways
1. [Insight]
2. [Insight]

## Pain Points Confirmed
- [Pain point]

## Decision Process
- Decision maker: [Name]
- Influencers: [Names]
- Timeline: [When]
- Budget: [Range if discussed]

## Objections Raised
- [Objection]: [How we handled it]

## Next Steps
- [ ] [Action] — Owner: [Name] — Due: [Date]
- [ ] [Action] — Owner: [Name] — Due: [Date]

## Follow-up Email
[Draft the follow-up email here]
```

---

## Objection Handling

### Common Objections & Responses

| Objection | Response Framework |
|-----------|-------------------|
| **"Too expensive"** | Explore value vs cost: "What's the cost of NOT solving this?" |
| **"We use [competitor]"** | "What made you choose them? What's working/not working?" |
| **"Not the right time"** | "What would make it the right time? Can we reconnect then?" |
| **"Need to think about it"** | "Of course. What specifically do you want to think through?" |
| **"Send me info"** | "Happy to. What specifically would be most helpful to see?" |
| **"We're too small"** | "That's actually perfect for [reason]. [Similar customer example]" |

### Objection Documentation

Track objections to improve pitch:
```markdown
# Objection Log

| Date | Company | Objection | Our Response | Result |
|------|---------|-----------|--------------|--------|
| [Date] | [Co] | [Objection] | [Response] | Won/Lost |
```

---

## Sales Analytics

### Weekly Sales Report Template

```markdown
# Sales Report — Week of [Date]

## Summary
- New leads: [X]
- Deals advanced: [X]
- Deals closed won: [X] ($[X])
- Deals closed lost: [X]

## Pipeline Health
- Total pipeline: $[X]
- Change from last week: +/-[X]%
- Weighted pipeline: $[X]
- Forecast this month: $[X]

## Activity Metrics
- Outreach sent: [X]
- Meetings held: [X]
- Proposals sent: [X]
- Follow-ups completed: [X]

## Wins
| Company | Value | Time to Close | Key Factor |
|---------|-------|---------------|------------|
| [Name] | $[X] | [X] days | [What won it] |

## Losses
| Company | Value | Stage Lost | Reason |
|---------|-------|------------|--------|
| [Name] | $[X] | [Stage] | [Why] |

## Focus for Next Week
1. [Priority]
2. [Priority]
```

### Win/Loss Analysis

```markdown
# Win/Loss Analysis — [Quarter]

## Win Patterns
- Common traits of won deals: [Patterns]
- Average deal size: $[X]
- Average sales cycle: [X] days
- Top win reasons:
  1. [Reason]
  2. [Reason]

## Loss Patterns
- Where deals die: [Stage]
- Common objections: [List]
- Top loss reasons:
  1. [Reason]
  2. [Reason]

## Insights & Actions
- [Insight] → [Action to take]
```

---

## Scripts

### sales-init.sh
Initialize your sales workspace with templates and tracking.

### lead-tracker.sh
CLI tool for quick lead management.

```bash
# Add new lead
./scripts/lead-tracker.sh add "Company Name" "Contact Name" "email@company.com"

# List all leads
./scripts/lead-tracker.sh list

# Update lead stage
./scripts/lead-tracker.sh update "Company Name" --stage "demo"

# Get daily follow-ups
./scripts/lead-tracker.sh followups
```

### pipeline-report.sh
Generate pipeline reports.

```bash
# Weekly pipeline summary
./scripts/pipeline-report.sh weekly

# Monthly forecast
./scripts/pipeline-report.sh forecast
```

---

## CRM Integration

### Built-in Tracking

If you don't use an external CRM, use markdown files:

```
sales/
├── leads/
│   ├── company-name.md
│   └── ...
├── pipeline.md
├── analytics/
│   ├── weekly-YYYY-MM-DD.md
│   └── ...
└── templates/
```

### External CRM Integration

**HubSpot:** Use HubSpot API for syncing
**Salesforce:** Use Salesforce API for syncing
**Notion:** Export/import via CSV or API

---

## Best Practices

1. **Follow up relentlessly** — 80% of sales need 5+ touchpoints
2. **Personalize everything** — Generic outreach = ignore
3. **Always have next step** — Every conversation ends with clear action
4. **Track why you lose** — More valuable than why you win
5. **Speed to lead** — Respond within 5 minutes when possible
6. **Listen more than talk** — Discovery > Pitching
7. **Document everything** — Your future self will thank you
8. **Review pipeline weekly** — Stale deals kill forecasts

---

## Common Mistakes

❌ **Pitching before understanding** — Do discovery first
❌ **Forgetting to follow up** — Use reminders religiously
❌ **Vanity metrics** — Calls made matters less than meetings held
❌ **Ignoring closed-lost** — They can become wins later
❌ **No CRM hygiene** — Bad data = bad decisions

---

## License

**License:** MIT — use freely, modify, distribute.

---

*"Sales is not about selling anymore, but about building trust and educating." — Siva Devaki*
