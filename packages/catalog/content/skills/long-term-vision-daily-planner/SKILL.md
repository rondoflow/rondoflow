---
name: long-term-vision-daily-planner
description: "AI planning coach using the 4To1 Method™ — turn 4-year vision into daily action. Connects to Notion, Todoist, Google Calendar, or local Markdown. Use when user wants to plan goals, do weekly reviews, track projects, or set up a planning system."
category: "Productivity"
author: community
version: "2.0.0"
icon: check-square
---

# 4To1 Planner — AI Planning Coach

> **"From Vision to Action: 4to1"**

An AI-native planning coach that turns your 4-year vision into today's action — through conversation, not templates.

## The 4To1 Method™

A 4-layer strategic planning system. Each layer bridges the gap between vision and execution:

```
4 YEARS  →  Strategic Vision     (Where am I going?)
3 MONTHS →  Project Milestones   (Quarterly Gantt Log)
2 WEEKS  →  Action Execution     (1 Day in a Week sprints)
1 DAY    →  Daily Tasks          (Today's to-do list)
```

Plus two elimination layers:
- **Not-To-Do Projects**: Things you explicitly say NO to
- **Time Wasters**: Daily habits you're eliminating

**Core principle:** Every daily task connects to a 2-week sprint, which connects to a 3-month milestone, which connects to your 4-year vision. **Nothing floats.**

## Quick Start

User says any of these → this skill activates:
- "Help me set up a planning system"
- "I want to plan my next 4 years"
- "Do my weekly review"
- "What should I focus on today?"
- "Set up 4to1 planner"

## Setup: Connect Your Backend

The planner needs somewhere to store plans. Ask the user which they prefer:

### Option 1: Notion (Recommended)

```bash
# 1. Create a Notion integration at https://www.notion.so/my-integrations
# 2. Copy the API key (starts with ntn_)
# 3. Store it:
mkdir -p ~/.config/4to1
echo "BACKEND=notion" > ~/.config/4to1/config
echo "NOTION_API_KEY=ntn_your_key_here" >> ~/.config/4to1/config
```

Share a parent page with the integration in Notion (click ··· → Connections → select your integration).

**Create the planning workspace in Notion:**

```bash
NOTION_KEY=$(grep NOTION_API_KEY ~/.config/4to1/config | cut -d= -f2)
PARENT_PAGE=$(grep NOTION_PARENT_PAGE ~/.config/4to1/config | cut -d= -f2)

# Create the 4To1 Planning Hub page
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d "{
    \"parent\": {\"page_id\": \"$PARENT_PAGE\"},
    \"properties\": {\"title\": {\"title\": [{\"text\": {\"content\": \"🎯 4To1 Planning Hub\"}}]}},
    \"children\": [
      {\"type\": \"heading_1\", \"heading_1\": {\"rich_text\": [{\"text\": {\"content\": \"🔭 4-Year Vision\"}}]}},
      {\"type\": \"paragraph\", \"paragraph\": {\"rich_text\": [{\"text\": {\"content\": \"Your strategic direction. Updated annually.\"}}]}},
      {\"type\": \"heading_1\", \"heading_1\": {\"rich_text\": [{\"text\": {\"content\": \"📊 3-Month Milestones\"}}]}},
      {\"type\": \"paragraph\", \"paragraph\": {\"rich_text\": [{\"text\": {\"content\": \"Quarterly Gantt Log — project milestones for this quarter.\"}}]}},
      {\"type\": \"heading_1\", \"heading_1\": {\"rich_text\": [{\"text\": {\"content\": \"🏃 2-Week Sprint\"}}]}},
      {\"type\": \"paragraph\", \"paragraph\": {\"rich_text\": [{\"text\": {\"content\": \"1 Day in a Week — action execution in 2-week cycles.\"}}]}},
      {\"type\": \"heading_1\", \"heading_1\": {\"rich_text\": [{\"text\": {\"content\": \"🚫 Not-To-Do List\"}}]}},
      {\"type\": \"paragraph\", \"paragraph\": {\"rich_text\": [{\"text\": {\"content\": \"Projects and commitments you are explicitly saying NO to.\"}}]}},
      {\"type\": \"heading_1\", \"heading_1\": {\"rich_text\": [{\"text\": {\"content\": \"⏰ Time Wasters\"}}]}},
      {\"type\": \"paragraph\", \"paragraph\": {\"rich_text\": [{\"text\": {\"content\": \"Daily habits you are eliminating.\"}}]}}
    ]
  }"

# Create Projects database (tracks items across all 4 layers)
curl -s -X POST "https://api.notion.com/v1/databases" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d "{
    \"parent\": {\"page_id\": \"$PARENT_PAGE\"},
    \"title\": [{\"text\": {\"content\": \"📋 4To1 Projects\"}}],
    \"properties\": {
      \"Name\": {\"title\": {}},
      \"Status\": {\"select\": {\"options\": [
        {\"name\": \"Active\", \"color\": \"green\"},
        {\"name\": \"Planned\", \"color\": \"blue\"},
        {\"name\": \"On Hold\", \"color\": \"yellow\"},
        {\"name\": \"Done\", \"color\": \"gray\"},
        {\"name\": \"Not-To-Do\", \"color\": \"red\"}
      ]}},
      \"Layer\": {\"select\": {\"options\": [
        {\"name\": \"4-Year Vision\", \"color\": \"blue\"},
        {\"name\": \"3-Month Milestone\", \"color\": \"green\"},
        {\"name\": \"2-Week Sprint\", \"color\": \"orange\"},
        {\"name\": \"1-Day Task\", \"color\": \"red\"}
      ]}},
      \"Priority\": {\"select\": {\"options\": [
        {\"name\": \"Primary\", \"color\": \"red\"},
        {\"name\": \"Secondary\", \"color\": \"orange\"},
        {\"name\": \"Nice-to-have\", \"color\": \"gray\"}
      ]}},
      \"Parent Project\": {\"rich_text\": {}},
      \"Start Date\": {\"date\": {}},
      \"End Date\": {\"date\": {}},
      \"Progress\": {\"number\": {\"format\": \"percent\"}},
      \"Notes\": {\"rich_text\": {}}
    }
  }"

# Create Sprint Log database (2-week tracking cycles)
curl -s -X POST "https://api.notion.com/v1/databases" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d "{
    \"parent\": {\"page_id\": \"$PARENT_PAGE\"},
    \"title\": [{\"text\": {\"content\": \"📅 Sprint Log\"}}],
    \"properties\": {
      \"Sprint\": {\"title\": {}},
      \"Focus Areas\": {\"rich_text\": {}},
      \"Completed\": {\"number\": {}},
      \"Planned\": {\"number\": {}},
      \"Completion Rate\": {\"formula\": {\"expression\": \"if(prop(\\\"Planned\\\") > 0, round(prop(\\\"Completed\\\") / prop(\\\"Planned\\\") * 100), 0)\"}},
      \"Reflection\": {\"rich_text\": {}},
      \"Energy Level\": {\"select\": {\"options\": [
        {\"name\": \"🔥 High\", \"color\": \"green\"},
        {\"name\": \"😊 Normal\", \"color\": \"blue\"},
        {\"name\": \"😴 Low\", \"color\": \"yellow\"},
        {\"name\": \"💀 Burnt Out\", \"color\": \"red\"}
      ]}}
    }
  }"
```

### Option 2: Todoist

```bash
# 1. Get API token from https://app.todoist.com/app/settings/integrations/developer
echo "BACKEND=todoist" > ~/.config/4to1/config
echo "TODOIST_API_KEY=your_token_here" >> ~/.config/4to1/config
```

**Create the 4To1 structure:**

```bash
TODOIST_KEY=$(grep TODOIST_API_KEY ~/.config/4to1/config | cut -d= -f2)

for project in "🔭 4-Year Vision" "📊 3-Month Milestones" "🏃 2-Week Sprint" "✅ Daily Tasks" "🚫 Not-To-Do"; do
  curl -s -X POST "https://api.todoist.com/rest/v2/projects" \
    -H "Authorization: Bearer $TODOIST_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$project\"}"
done
```

### Option 3: Google Calendar + Tasks

```bash
echo "BACKEND=gcal" > ~/.config/4to1/config
# Requires Google OAuth — run the setup script:
python3 {baseDir}/scripts/gcal_setup.py
```

### Option 4: Local Markdown (No account needed)

```bash
echo "BACKEND=local" > ~/.config/4to1/config
echo "LOCAL_DIR=~/4to1-plans" >> ~/.config/4to1/config
mkdir -p ~/4to1-plans/{vision,milestones,sprints,daily,not-to-do}
```

## Core Commands

### 1. Onboarding — "Set up my planning system"

Guide the user through this conversation:

**Step 1: Choose backend** (see Setup above)

**Step 2: 4-Year Vision** (5-10 min conversation)

Ask one at a time, conversationally:
1. "If you could be anywhere in 4 years — career, life, skills — what does that look like?"
2. "What are the 2-3 biggest areas you want to transform?" (career, health, relationships, skills, finances)
3. "For each area, what does SUCCESS look like in 4 years? Be specific."
4. "What are you willing to give up to get there?" → seeds the Not-To-Do list
5. "Any daily habits stealing your time?" → seeds the Time Wasters list

After the conversation, create:
- 4-Year Vision document with their answers (Layer: 4-Year Vision)
- 2-5 vision areas with concrete success criteria
- Initial Not-To-Do list + Time Wasters list

**Step 3: 3-Month Milestones** (5 min)
1. "Of your vision areas, which 1-2 need the most progress in the next 3 months?"
2. "What specific milestones would mean real progress?"
3. "Break each into measurable deliverables."

Create items with Layer: 3-Month Milestone, linked to vision areas.

**Step 4: 2-Week Sprint** (3 min)
1. "For your quarterly milestones, what can you accomplish in the next 2 weeks?"
2. "Pick 2 Primary projects and up to 5 Secondary projects."
3. "What does 'done' look like for each?"

Create items with Layer: 2-Week Sprint.

**Step 5: Today** (1 min)
1. "What are the 3 most important tasks for today?"
2. "Which sprint project does each serve?"

Write everything to the chosen backend.

### 2. Weekly Review — "Do my weekly review"

Run every Sunday evening or Monday morning. Read {baseDir}/scripts/weekly_review.md for the full template.

Summary:
```
READ: This week's tasks + completion status + project progress + Not-To-Do list
ASK:  How did this week go? → Wins? → Blockers? → Energy level?
      → Did you spend time on Not-To-Do items? → Next week's top 3?
WRITE: Sprint log entry + next week's tasks + updated progress
```

Keep it under 10 minutes. Be a coach, not a form.

### 3. Bi-Weekly Sprint Review — Every 2 weeks

```
READ: Current 2-week sprint tasks and progress
REVIEW: What got done? What carries over? Any sprint goal changes?
PLAN: Next 2-week sprint — new primary/secondary projects
CHECK: Are sprints still aligned with 3-month milestones?
```

### 4. Quarterly Review — End of each quarter

```
READ: All projects and sprint logs for the quarter
REPORT: Projects completed/stalled/abandoned, completion trend, top win, biggest blocker
ASK: Which projects continue? Which get cut? New projects? Update Not-To-Do?
WRITE: Quarterly report + next quarter's milestones
```

### 5. Daily Check-in — "What should I focus on today?"

```
READ: Current sprint tasks + project priorities
RESPOND:
  "Based on your 2-week sprint, today's focus:
   1. [Task] → serves [3-month milestone]
   2. [Task] → serves [milestone]
   3. [Task]

   ⚠️ [Project X] hasn't had progress in a week.
   🚫 Not-To-Do reminder: You said NO to [thing]."
```

### 6. Quick Add — "Add [task] to my plan"

Parse the task. Ask which project/sprint it serves if unclear. Add to backend with correct layer linkage.

### 7. Progress Check — "How am I doing?"

```
READ: All data
SHOW:
  🔭 4-Year Vision: [areas and direction]
  📊 Q[X] Milestones: [X/Y complete]
  🏃 Current Sprint: [X/Y tasks done, Z% rate]
  📈 Sprint streak: X consecutive reviews
  🚫 Not-To-Do violations: [any this week?]
```

## Notion API Reference

```bash
NOTION_KEY=$(grep NOTION_API_KEY ~/.config/4to1/config | cut -d= -f2)

# Search planning pages
curl -s -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"query": "4To1"}'

# Query projects by layer
curl -s -X POST "https://api.notion.com/v1/databases/{db_id}/query" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"filter": {"and": [
    {"property": "Status", "select": {"equals": "Active"}},
    {"property": "Layer", "select": {"equals": "2-Week Sprint"}}
  ]}}'

# Update progress
curl -s -X PATCH "https://api.notion.com/v1/pages/{page_id}" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Progress": {"number": 0.75}, "Status": {"select": {"name": "Active"}}}}'

# Create sprint log entry
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "{sprint_log_db_id}"},
    "properties": {
      "Sprint": {"title": [{"text": {"content": "2026-W07 Sprint Review"}}]},
      "Completed": {"number": 8},
      "Planned": {"number": 10},
      "Reflection": {"rich_text": [{"text": {"content": "Good sprint. Hit main milestones."}}]},
      "Energy Level": {"select": {"name": "😊 Normal"}}
    }
  }'
```

## Todoist API Reference

```bash
TODOIST_KEY=$(grep TODOIST_API_KEY ~/.config/4to1/config | cut -d= -f2)

# Get all projects
curl -s "https://api.todoist.com/rest/v2/projects" -H "Authorization: Bearer $TODOIST_KEY"

# Get active tasks in a project
curl -s "https://api.todoist.com/rest/v2/tasks?project_id={id}" -H "Authorization: Bearer $TODOIST_KEY"

# Create task linked to sprint
curl -s -X POST "https://api.todoist.com/rest/v2/tasks" \
  -H "Authorization: Bearer $TODOIST_KEY" -H "Content-Type: application/json" \
  -d '{"content": "Task name", "project_id": "xxx", "priority": 4, "due_string": "next monday", "description": "Sprint: 2-Week Sprint | Milestone: Q1 Goal"}'

# Complete task
curl -s -X POST "https://api.todoist.com/rest/v2/tasks/{id}/close" -H "Authorization: Bearer $TODOIST_KEY"
```

## Local Markdown Backend

```
~/4to1-plans/
├── vision.md            # 4-year vision document
├── not-to-do.md         # Not-To-Do projects + Time Wasters
├── milestones/
│   └── 2026-Q1.md       # 3-month milestone plan
├── sprints/
│   ├── 2026-W07.md      # 2-week sprint plan
│   └── 2026-W09.md
├── daily/
│   └── 2026-02-10.md    # Daily task list
└── reviews/
    ├── sprint-2026-W07.md  # Sprint review log
    └── quarterly-2026-Q1.md
```

Use YAML frontmatter for structured data:

```markdown
---
project: Launch MVP
layer: 3-month-milestone
status: active
priority: primary
progress: 45
start: 2026-01-01
end: 2026-03-31
parent_vision: "Build a profitable SaaS"
---
# Launch MVP
## Tasks (2-week sprint)
- [x] Define feature scope
- [x] Build prototype
- [ ] User testing round 1
- [ ] Iterate on feedback
```

## Automation (Heartbeat/Cron)

For OpenClaw users with heartbeats or cron:

**Weekly review reminder (Sunday 8pm):**
```
"Run 4to1 weekly review: read sprint progress, generate summary, ask for next week's priorities"
```

**Daily focus (weekdays 8am):**
```
"Check 4to1 plan, suggest today's top 3 focus tasks based on current 2-week sprint"
```

**Stall detection (every 3 days):**
```
"Check if any active 4to1 sprint project hasn't been updated in 1+ week. Alert if stalled."
```

## Coach Principles

1. **Respect the 4-3-2-1 hierarchy** — every task connects up through sprint → milestone → vision
2. **Protect the Not-To-Do list** — if user adds something conflicting, remind them why they said no
3. **Never fabricate progress** — only report what's actually tracked
4. **Keep it lightweight** — weekly review = 5-10 min, daily check-in = 1 min
5. **Be encouraging but honest** — celebrate wins, flag stalls kindly
6. **Think in 2-week cycles** — the sprint is the core execution rhythm

## Learn More

- Website: https://4to1planner.com
- Free starter kit: https://4to1planner.com/free-download.html
- Templates: https://4to1planner.com/shop.html
- YouTube: https://www.youtube.com/@markzhou5213
- Twitter: https://twitter.com/xiucat
