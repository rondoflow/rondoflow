---
name: build-personal-project-management-system
description: "Build a personal project management system that scales from simple lists to structured planning."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

## Core Behavior
- User mentions a project → help define scope, create folder
- User adds tasks → capture in project context
- Regular review prompts → surface stalled projects
- Create `~/projects/` as workspace

## First Question
- "What does done look like?" — define success before starting
- Scope creep is the project killer — clear boundaries from day one
- If they can't define done, the project isn't ready to start

## Project Types to Recognize
- One-time goal: clear end state, then archive (move apartments, plan trip)
- Ongoing area: never truly done, maintain indefinitely (health, career)
- Client work: external deadline, deliverables, often paid
- Learning: skill acquisition, may spawn other projects
- Creative: writing, art, building — process matters as much as output

## Minimal Project Structure
- Folder with project name: `~/projects/kitchen-renovation/`
- README.md: what, why, done criteria, deadline if any
- tasks.md: simple checklist, add as discovered
- notes.md: decisions made, research, reference material

## When User Starts a Project
- Ask: "What's the one sentence description?"
- Ask: "When does this need to be done?" (or "no deadline")
- Ask: "What's the very next physical action?"
- Create folder with README containing answers

## Task Capture
- Quick capture: "Add to kitchen project: call contractor"
- Tasks are concrete actions, not vague goals
- "Research options" is a task, "figure out renovation" is not
- Estimate size if useful: small/medium/large or hours

## When Projects Grow
- More than 15 tasks → consider grouping into phases
- Multiple workstreams → split into areas within project
- Dependencies emerging → note which tasks block others
- Collaborators involved → note who owns what

## Phase/Milestone Structure
For larger projects:
```
~/projects/kitchen-renovation/
├── README.md
├── phase-1-planning/
│   ├── tasks.md
│   └── notes.md
├── phase-2-demo/
├── phase-3-install/
└── archive/
```

## Active Project Limits
- Suggest maximum 3-5 active projects — more means nothing progresses
- Distinguish active (working this week) from someday (parked intentionally)
- Parked projects go in `~/projects/_someday/`
- Review someday quarterly — activate, archive, or delete

## Weekly Project Review
- What progressed this week?
- What's the next action for each active project?
- Any projects stalled more than 2 weeks?
- Any someday projects ready to activate?

## Stalled Project Detection
- No task completions in 2+ weeks → surface in review
- Ask: "Is this still a priority? Block or drop?"
- Options: push forward, park to someday, kill it
- Killing projects is healthy — better than zombie projects

## Project Completion
- Define done checklist in README from start
- When complete: review what went well, what didn't
- Archive to `~/projects/_archive/year/`
- Celebrate completion — don't just move to next thing

## Client/Work Projects
- Add: deadline, contact info, rate if applicable
- Track time if billing: simple log in project folder
- Deliverables list with status
- Communication log: key decisions and approvals

## What NOT To Suggest
- Complex project management app until files fail
- Rigid methodology (Agile, GTD, etc.) — adapt to user
- Gantt charts for personal projects — overkill
- Time tracking for non-billable work — adds friction

## Project Templates
Offer to create templates for recurring project types:
- "You start client projects often — want a template?"
- Template: folder structure, README prompts, standard tasks
- Keep templates minimal — adapt per project

## Integration Points
- Calendar: deadlines, milestones
- Contacts: collaborators, stakeholders
- Invoices: if client project with billing
- Goals: projects often serve larger goals

## Someday/Maybe List
- Ideas not ready for commitment
- Review monthly — promote, delete, or keep parking
- No guilt about long lists — it's a holding pen
- "This would be cool but not now" is valid

## Project Metrics (When Asked)
- How long did similar projects take?
- Completion rate: started vs finished
- Average project duration
- Don't track obsessively — only if user finds it useful
