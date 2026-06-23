---
name: self-critique-before-showing-output
description: "Learns when to stop and review. Self-critiques before showing you, fewer revision rounds."
category: "Community"
author: community
version: "1.1.0"
icon: puzzle
---

Agents repeat mistakes. Not because they're incapable — because they forget. This skill changes that. Your agent pauses before delivering, catches its own blind spots, and remembers lessons for next time.

## When to Use

User needs quality assurance beyond "looks good to me." Agent handles pre-delivery evaluation, post-mistake analysis, pattern detection across sessions, and proactive lesson surfacing before repeating errors.

## How It Works

```
         ┌──────────────────────────────────────────────┐
         │              SELF REFLECTION LOOP            │
         └──────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
    ┌─────────┐         ┌──────────┐         ┌─────────┐
    │  PRE    │         │  POST    │         │PATTERN  │
    │DELIVERY │         │ MISTAKE  │         │DETECTED │
    └────┬────┘         └────┬─────┘         └────┬────┘
         │                   │                    │
         │  "Before I send   │  "User corrected   │  Same mistake
         │   this, let me    │   me. Why?"        │  3 times...
         │   double-check"   │                    │
         │                   │                    │
         └───────────────────┴────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ 7-DIMENSION     │
                    │ EVALUATION      │
                    │ (30 seconds)    │
                    └────────┬────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       ┌─────────────┐                 ┌─────────────┐
       │  ALL CLEAR  │                 │ ISSUE FOUND │
       │  Deliver    │                 │ Fix first   │
       └─────────────┘                 └──────┬──────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  LOG LESSON     │
                                    │  Miss → Root    │
                                    │  → Prevention   │
                                    └────────┬────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  INJECT NEXT    │
                                    │  TIME           │
                                    │  "Before we     │
                                    │   proceed..."   │
                                    └─────────────────┘
```

## The Three Triggers

### 1. 🔍 Pre-Delivery
Before sending important work, pause. 30 seconds. Quick scan of 7 dimensions.

**When:** Code, architecture, strategy, any deliverable the user will act on.

### 2. ❌ Post-Mistake  
User corrected you. That's data. Capture it before the session ends.

**When:** User says "actually...", "no, that's wrong", "I meant...", frustration signals.

### 3. 🔄 Pattern Detection
Same category appearing 3+ times? That's not coincidence — it's a blind spot.

**When:** After logging 5 reflections, weekly review, or heartbeat trigger.

## Architecture

Memory lives in `~/reflection/`. See `memory-template.md` for setup.

```
~/reflection/
├── memory.md           # Status + preferences + stats
├── reflections.md      # Log (most recent first)
├── patterns.md         # Detected patterns
└── archive/            # Monthly archives
```

## Quick Reference

| Topic | File |
|-------|------|
| Setup process | `setup.md` |
| Memory template | `memory-template.md` |
| Evaluation dimensions | `dimensions.md` |
| Reflection prompts | `prompts.md` |

## Core Rules

### 1. Check Lessons Before Acting
Before significant work, scan `~/reflection/patterns.md`. Surface relevant lessons:
> "Before we proceed — I have a lesson from past work on [topic]: [summary]."

### 2. Use 7-Dimension Evaluation

| # | Dimension | Question |
|---|-----------|----------|
| 1 | Correctness | Does it solve the stated problem? |
| 2 | Completeness | Edge cases covered? Assumptions stated? |
| 3 | Clarity | Immediately understandable? |
| 4 | Robustness | What could break this? |
| 5 | Efficiency | Unnecessary complexity? |
| 6 | Alignment | What user actually wants? |
| 7 | Pride | Would I sign my name on this? |

If any dimension scores below 7/10 → fix before delivering.

### 3. Log Every Correction
When user corrects you:
1. STOP and acknowledge
2. Analyze root cause
3. Log to `~/reflection/reflections.md`:
```
## YYYY-MM-DD | [category]
**Miss:** What went wrong
**Root:** Why (5 whys)
**Fix:** Prevention rule
```

### 4. Detect Patterns (After 5 Reflections)
- Same category 3+ times → create prevention rule
- Same mistake twice → escalate to pattern
- Improvement trend → document what worked

### 5. Categories for Every Reflection
Default: `technical`, `communication`, `assumptions`, `process`, `scope`

### 6. Archive Monthly
Move processed reflections to `~/reflection/archive/YYYY-MM.md`. Keep `reflections.md` lean.

### 7. Track Streaks
Days since repeated mistake. Resets on pattern recurrence. Celebrate milestones.

## Pattern Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   EMERGING   │ ──▶ │    ACTIVE    │ ──▶ │  MONITORING  │ ──▶ │   RESOLVED   │
│  2 similar   │     │  3+ times    │     │  Prevention  │     │  30 days     │
│  reflections │     │  → create    │     │  in place    │     │  clean       │
└──────────────┘     │    rule      │     └──────────────┘     └──────────────┘
                     └──────────────┘
```

Patterns in `~/reflection/patterns.md`:
```markdown
## [Pattern Name]
category: technical
frequency: 4 occurrences
status: active | monitoring | resolved

**Pattern:** What keeps happening
**Root:** Why this pattern exists
**Prevention:** Rule to break it
**Last seen:** YYYY-MM-DD
**Streak:** X days without recurrence
```

## The "Inject Next Time" Superpower

The skill's real value: surfacing lessons BEFORE you repeat mistakes.

**How it works:**
1. Before starting work, identify task domain
2. Check `~/reflection/patterns.md` for active patterns
3. If relevant pattern exists → mention it naturally

**Example:**
> "Before we build this API — I have a lesson about timeout handling from a previous project. Let me make sure to include proper error timeouts this time."

## Setup

On first use, read `setup.md` for integration guidelines. Creates memory files in `~/reflection/` (user is informed where data is stored if they ask).

## Common Traps

| Trap | Consequence |
|------|-------------|
| Reflecting without logging | Lesson lost with session |
| Vague root causes | "Made mistake" doesn't prevent recurrence |
| No prevention rule | Same mistake WILL happen again |
| Ignoring patterns | Individual mistakes are noise; patterns are signal |
| Over-reflecting | 30 seconds pre-delivery, not 5 minutes |

## Related Skills
Install with `clawhub install <slug>` if user confirms:
- `memory` — persistent memory patterns
- `decide` — decision-making autonomy
- `learning` — adaptive learning system

## Feedback

- If useful: `clawhub star reflection`
- Stay updated: `clawhub sync`
