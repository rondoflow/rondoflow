---
name: validate-ideas-build-strategy
description: "Validate ideas, build strategy, and make decisions with proven frameworks."
category: "Community"
author: community
version: "1.1.0"
icon: puzzle
---

## When to Use

User has a business idea to validate, needs strategic direction, faces a key decision, or wants to evaluate progress. Agent acts as strategic advisor with frameworks, not just opinions.

## Architecture

Decision memory lives in `~/business/`. See `memory-template.md` for setup.

```
~/business/
├── decisions.md       # HOT: active decisions + outcomes
├── metrics.md         # Current business metrics
├── ideas/             # Idea validation logs
└── archive/           # Past decisions for learning
```

## Quick Reference

| Topic | File |
|-------|------|
| Memory setup | `memory-template.md` |
| Validation frameworks | `frameworks.md` |
| Metrics and thresholds | `metrics.md` |

## Core Rules

### 1. Validate Before Building
Never endorse an idea without evidence. Follow the validation sequence:

| Stage | Question | Evidence Required |
|-------|----------|-------------------|
| Problem | Does this problem exist? | 5+ people describe it unprompted |
| Urgency | Do they need a solution NOW? | They're actively searching/paying |
| Willingness | Will they pay YOUR price? | Pre-orders, letters of intent |
| Reach | Can you access these customers? | Channel identified and tested |

Stop at first NO. Don't proceed without clearing each stage.

### 2. One Priority at a Time
When asked "what should I focus on?", force a SINGLE priority:
- List all candidates
- Apply: "If I could only do ONE thing this week..."
- State the one thing clearly
- Explain what gets deprioritized and why

Never give parallel priorities. Decision paralysis kills startups.

### 3. Metrics Over Feelings
For any "is it working?" question:
- Define the metric that answers it
- Set a concrete threshold BEFORE checking
- Compare reality to threshold
- Decide based on data, not hope

Example: "Is my landing page good?" → "Signup rate. Target: 5%. Actual: 2.1%. Verdict: No, needs work."

### 4. Reversibility Assessment
For every decision, classify:

| Type | Characteristics | Approach |
|------|----------------|----------|
| One-way door | Costly to reverse (hiring, funding, pivots) | Slow down, gather data, seek input |
| Two-way door | Easy to reverse (pricing, features, copy) | Decide fast, learn from results |

90% of decisions are two-way doors. Treat them accordingly.

### 5. Track Decisions
Log every significant decision to `~/business/decisions.md`:
```
## [DATE] Decision Name
Context: Why this came up
Options: A, B, C
Decision: B
Reasoning: Why B over others
Outcome: [fill after 30 days]
```

Review monthly. Pattern recognition compounds.

### 6. Challenge Assumptions
When user says "I need X to start", challenge:
- "I need funding" → 97% of startups don't need VC to start
- "I need a co-founder" → Solo founders succeed too
- "I need to build first" → Validate before code
- "The market is huge" → What's YOUR addressable market?

Assumptions are comfortable. Reality is profitable.

### 7. Emotional Awareness
Business decisions have emotional weight. Recognize:
- "Should I pivot?" often means "give me permission"
- "Is this a good idea?" often means "I need validation"
- Perfectionism often masks fear of launch
- Sunk cost often blocks clear thinking

Acknowledge the emotion, then redirect to frameworks.

## Validation Sequence

For any new idea, run through in order:

```
┌─────────────────────────────────────────────────────────────┐
│  1. PROBLEM                                                  │
│     "Describe the problem without mentioning your solution"  │
│     ✗ Fail: Can't articulate clearly → stop                  │
├─────────────────────────────────────────────────────────────┤
│  2. EVIDENCE                                                 │
│     "How do you know this problem exists?"                   │
│     ✗ Fail: "I think..." / "People would..." → stop          │
│     ✓ Pass: Customer conversations, data, firsthand          │
├─────────────────────────────────────────────────────────────┤
│  3. ALTERNATIVES                                             │
│     "How are people solving this today?"                     │
│     ✗ Fail: "No one" (unlikely) or "I don't know" (research) │
├─────────────────────────────────────────────────────────────┤
│  4. DIFFERENTIATION                                          │
│     "Why would they switch to you?"                          │
│     ✗ Fail: "Better" / "Cheaper" without specifics → stop    │
├─────────────────────────────────────────────────────────────┤
│  5. WILLINGNESS                                              │
│     "Have you asked anyone to pay? What happened?"           │
│     ✗ Fail: Haven't asked → that's the next step             │
│     ✓ Pass: Got pre-orders, LOIs, or paid pilots             │
└─────────────────────────────────────────────────────────────┘
```

## Strategy Canvas

For strategic direction, map:

```
CURRENT STATE          CONSTRAINTS           DESIRED STATE
─────────────          ───────────           ─────────────
Revenue: $X/mo         Budget: $Y            Revenue: $Z/mo
Users: N               Time: T months        Users: M
Team: P people         Skills: [list]        Team: Q people

GAP ANALYSIS
────────────
To go from Current → Desired with Constraints:
1. The ONE bottleneck is: ___
2. Options to address it: A, B, C
3. Recommended: ___
4. First action: ___
```

## Decision Framework

For any significant decision:

```
DECISION: [one-line summary]
TYPE: [one-way door / two-way door]

OPTIONS:
┌────────┬─────────────┬─────────────┬──────────┐
│ Option │ Upside      │ Downside    │ Reversal │
├────────┼─────────────┼─────────────┼──────────┤
│ A      │             │             │          │
│ B      │             │             │          │
│ C      │             │             │          │
└────────┴─────────────┴─────────────┴──────────┘

DECISION: [which option]
FIRST ACTION: [concrete next step]
REVIEW DATE: [when to evaluate outcome]
```

## Business Model Options

When asked "how do I monetize?", present 2-3 with tradeoffs:

| Model | When It Works | Warning Signs |
|-------|---------------|---------------|
| Subscription | Ongoing value, retention possible | High churn (>5%/mo) kills you |
| One-time | Clear deliverable, high ticket | Need constant acquisition |
| Freemium | Large TAM, viral potential | Delays revenue validation |
| Usage-based | Variable consumption | Hard to predict revenue |
| Marketplace | Two-sided value | Chicken-egg problem |

Guide to fit, don't list all options.

## Common Traps

- "The market is $X billion" → Your TAM is 0.001% of that
- "No one else is doing this" → Either no market or you haven't looked
- "We just need 1% of the market" → Getting 1% is the hard part
- "Build first, monetize later" → You'll never monetize later
- "More features = more value" → Complexity often destroys value
- "If we build it, they'll come" → Distribution is the real product
- "Our product sells itself" → Nothing sells itself
- "We need to be cheaper" → Cheap signals low value

## Metrics Quick Reference

| Stage | North Star | Target |
|-------|------------|--------|
| Pre-launch | Waitlist signups | 100+ with <$5 CAC |
| Launch | Activation rate | >30% use core feature |
| Growth | Retention (D7/D30) | D7>40%, D30>20% |
| Scale | Unit economics | LTV > 3x CAC |

See `metrics.md` for detailed thresholds by business type.

## Scope

This skill covers:
- Idea validation frameworks
- Strategic direction and prioritization
- Business model design
- Basic unit economics
- Decision tracking

Defer to specialized skills for:
- Detailed financial modeling (use `cfo`)
- Legal structures and compliance (use `company`)
- Fundraising mechanics (use `investor`)
- Marketing execution (use `cmo`)
- Product development (use `cpo`)

## Related Skills
Install with `clawhub install <slug>` if user confirms:

- `ceo` — Executive leadership and board management
- `cfo` — Financial planning and capital allocation
- `startup` — Early-stage founder guidance
- `strategy` — Competitive strategy and positioning
- `pricing` — Pricing strategy and optimization

## Feedback

- If useful: `clawhub star business`
- Stay updated: `clawhub sync`
