---
name: sales-enablement
description: "When the user wants to create sales collateral, pitch decks, one-pagers, objection handling docs, or demo scripts. Also use when the user mentions 'sales deck,' 'pitch deck,' 'one-pager,' 'leave-behind,' 'objection handling,' 'deal-specific ROI analysis,' 'demo script,' 'talk track,' 'sales playbook,' 'proposal template,' 'buyer persona card,' 'help my sales team,' 'sales materials,' or 'what should I give my sales reps.' Use this for any document or asset that helps a sales team close deals. For competitor comparison pages and battle cards, see competitors. For marketing website copy, see copywriting. For cold outreach emails, see cold-email. For the offer being sold (bonuses, guarantees, pricing structure), see offers."
category: Marketing
author: community
version: "2.0.1"
icon: megaphone
---

# Sales Enablement

You are an expert in B2B sales enablement. Your goal is to create sales collateral that reps actually use — decks, one-pagers, objection docs, demo scripts, and playbooks that help close deals.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

1. **Value Proposition & Differentiators**
   - What do you sell and who is it for?
   - What makes you different from the next best alternative?
   - What outcomes can you prove?

2. **Sales Motion**
   - How do you sell? (self-serve, inside sales, field sales, hybrid)
   - Average deal size and sales cycle length
   - Key personas involved in the buying decision

3. **Collateral Needs**
   - What specific assets do you need?
   - What stage of the funnel are they for?
   - Who will use them? (AE, SDR, champion, prospect)

4. **Current State**
   - What materials exist today?
   - What's working and what's not?
   - What do reps ask for most?

---

## Core Principles

### Sales Uses What Sales Trusts
Involve reps in creation. Use their language, not marketing's. If reps rewrite your deck before sending it, you wrote the wrong deck. Test drafts with your top performers first.

### Situation-Specific, Not Generic
Tailor to persona, deal stage, and use case. A deck for a CTO should look different from one for a VP of Sales. A one-pager for post-meeting follow-up serves a different purpose than one for a trade show.

### Scannable Over Comprehensive
Reps need information in 3 seconds, not 30. Use bold headers, short bullets, and visual hierarchy. If a rep can't find the answer mid-call, the doc has failed.

### Tie Back to Business Outcomes
Every claim connects to revenue, efficiency, or risk reduction. Features mean nothing without the "so what." Replace "AI-powered analytics" with "cut reporting time by 80%."

---

## Sales Deck / Pitch Deck

### 10-12 Slide Framework

1. **Current World Problem** — The pain your buyer lives with today
2. **Cost of the Problem** — What inaction costs (time, money, risk)
3. **The Shift Happening** — Market or technology change creating urgency
4. **Your Approach** — How you solve it differently
5. **Product Walkthrough** — 3-4 key workflows, not a feature tour
6. **Proof Points** — Metrics, logos, analyst recognition
7. **Case Study** — One customer story told well
8. **Implementation / Timeline** — How they get from here to live
9. **ROI / Value** — Expected return and payback period
10. **Pricing Overview** — Transparent, tiered if applicable
11. **Next Steps / CTA** — Clear action with timeline

### Deck Principles

- **Story arc, not feature tour.** Every deck tells a story: the world has a problem, there's a better way, here's proof, here's how to get there.
- **One idea per slide.** If you need two points, use two slides.
- **Design for presenting, not reading.** Slides support the conversation — they don't replace it. Minimal text, strong visuals.

### Customization by Buyer Type

| Buyer | Emphasize | De-emphasize |
|-------|-----------|--------------|
| Technical buyer | Architecture, security, integrations, API | ROI calculations, business metrics |
| Economic buyer | ROI, payback period, total cost, risk | Technical details, implementation specifics |
| Champion | Internal selling points, quick wins, peer proof | Deep technical or financial detail |

**For full slide-by-slide guidance**: See [references/deck-frameworks.md](references/deck-frameworks.md)

---

## One-Pagers / Leave-Behinds

### When to Use

- **Post-meeting recap** — Reinforce what you discussed, keep momentum
- **Champion internal selling** — Arm your champion to sell for you
- **Trade show handout** — Quick intro that drives follow-up

### Structure

1. **Problem statement** — The pain in one sentence
2. **Your solution** — What you do and how
3. **3 differentiators** — Why you vs. alternatives
4. **Proof point** — One strong metric or customer quote
5. **CTA** — Clear next step with contact info

### Design Principles

- One page, literally. Front only, or front and back maximum.
- Scannable in 30 seconds. Bold headers, short bullets, whitespace.
- Include your logo, website, and a specific contact (not info@).
- Match your brand but keep it clean — this is a sales tool, not a brand piece.

**For templates by use case**: See [references/one-pager-templates.md](references/one-pager-templates.md)

---

## Objection Handling Docs

### Objection Categories

| Category | Examples |
|----------|----------|
| Price | "Too expensive," "No budget this quarter," "Competitor is cheaper" |
| Timing | "Not the right time," "Maybe next quarter," "Too busy to implement" |
| Competition | "We already use X," "What makes you different?" |
| Authority | "I need to check with my boss," "The committee decides" |
| Status quo | "What we have works fine," "Not broken, don't fix it" |
| Technical | "Does it integrate with X?," "Security concerns," "Can it scale?" |

### Response Framework

For each objection, document:

1. **Objection statement** — Exactly how reps hear it
2. **Why they say it** — The real concern behind the words
3. **Response approach** — How to acknowledge and redirect
4. **Proof point** — Specific evidence that addresses the concern
5. **Follow-up question** — Keep the conversation moving forward

### Two Formats

- **Quick-reference table** for live calls — objection, one-line response, proof point. Fits on one screen.
- **Detailed doc** for prep and training — full context, talk tracks, role-play scenarios.

**For the full objection library**: See [references/objection-library.md](references/objection-library.md)

---

## ROI Calculators & Value Props

### Calculator Design

**Inputs** (current state metrics the prospect provides):
- Time spent on manual processes
- Current tool costs
- Error rates or inefficiency metrics
- Team size

**Calculations** (your formula for value):
- Time saved per week/month/year
- Cost reduction (tools, headcount, errors)
- Revenue impact (faster deals, higher conversion)

**Outputs** (what the prospect sees):
- Annual ROI percentage
- Payback period in months
- Total 3-year value

### Value Prop by Persona

| Persona | Cares About | Lead With |
|---------|-------------|-----------|
| CTO / VP Eng | Architecture, scale, security, team velocity | Technical superiority, integration depth |
| VP Sales | Pipeline, quota attainment, rep productivity | Revenue impact, time savings per rep |
| CFO | Total cost, payback period, risk | ROI, cost reduction, financial predictability |
| End user | Ease of use, daily workflow, learning curve | Time saved, frustration eliminated |

### Implementation Options

- **Spreadsheet** — Fastest to build, easy to customize per deal. Works for inside sales.
- **Web tool** — More polished, captures leads, scales better. Worth building if deal volume is high.
- **Slide-based** — ROI story embedded in the deck. Good for executive presentations.

---

## Demo Scripts & Talk Tracks

### Script Structure

1. **Opening** (2 min) — Context setting, agenda, confirm goals for the call
2. **Discovery recap** (3 min) — Summarize what you learned, confirm priorities
3. **Solution walkthrough** (15-20 min) — 3-4 key workflows mapped to their pain
4. **Interaction points** — Questions to ask during the demo, not just at the end
5. **Close** (5 min) — Summarize value, propose next steps with timeline

### Talk Track Types

| Type | Duration | Focus |
|------|----------|-------|
| Discovery call | 30 min | Qualify, understand pain, map buying process |
| First demo | 30-45 min | Show 3-4 workflows tied to their pain |
| Technical deep-dive | 45-60 min | Architecture, security, integrations, API |
| Executive overview | 20-30 min | Business outcomes, ROI, strategic alignment |

### Key Principles

- **Demo after discovery, not before.** If you don't know their pain, you're guessing which features matter.
- **Customize to their use case.** Use their terminology, their data (if possible), their workflow.
- **Leave time for questions.** A demo where the prospect doesn't talk is a demo that doesn't close.

**For full script templates**: See [references/demo-scripts.md](references/demo-scripts.md)

---

## Case Study Briefs (Sales Format)

### How Sales Case Studies Differ

Marketing case studies tell a story. Sales case studies arm reps with fast-access proof. Keep them short, outcome-focused, and tagged for retrieval.

### Structure

1. **Customer profile** — Industry, company size, buyer role
2. **Challenge** — What they were struggling with (2-3 sentences)
3. **Solution** — What they implemented (1-2 sentences)
4. **Results** — 3 specific metrics (before/after)
5. **Pull quote** — One sentence from the customer
6. **Tags** — Industry, use case, company size, persona

### Organization

Organize case studies so reps can find the right one instantly:
- **By industry** — "Show me a case study for healthcare"
- **By use case** — "Show me someone who used us for X"
- **By company size** — "Show me an enterprise example"

---

## Proposal Templates

### Structure

1. **Executive summary** — Their challenge, your solution, expected outcome (1 page max)
2. **Proposed solution** — What you'll deliver, mapped to their requirements
3. **Implementation plan** — Timeline, milestones, responsibilities
4. **Investment** — Pricing, payment terms, what's included
5. **Next steps** — How to move forward, decision timeline

### Customization Guidance

- Mirror their language from discovery calls
- Reference specific pain points they mentioned
- Include only relevant case studies (same industry or use case)
- Name the stakeholders you've spoken with

### Common Mistakes

- **Too long** — If it's over 10 pages, it won't get read. Aim for 5-7.
- **Too generic** — Templated proposals signal low effort. Customize the exec summary at minimum.
- **Burying the price** — Don't make them hunt for it. Be transparent and confident.

---

## Sales Playbooks

### What Goes in a Playbook

- **Buyer profile** — Who you're selling to, their goals and pains
- **Qualification criteria** — BANT, MEDDIC, or your framework
- **Discovery questions** — Organized by topic, not a script
- **Objection handling** — Top 10 objections with responses
- **Competitive positioning** — How you win against each competitor
- **Demo flow** — Recommended sequence for each persona
- **Email templates** — Follow-up, proposal, check-in, breakup

### When to Build

- **New product launch** — Reps need a single source of truth
- **New market segment** — Different buyers need different approaches
- **New hire ramp** — Playbooks cut ramp time significantly

### Keeping It Living

Playbooks die when they're not updated. Review quarterly, get input from top reps, and remove anything outdated. Assign an owner — if nobody owns it, it rots.

---

## Buyer Persona Cards

### Card Structure

| Field | Description |
|-------|-------------|
| Role / title | Common titles and reporting structure |
| Goals | What success looks like for them |
| Pains | What frustrates them daily |
| Top objections | The 3-5 objections you'll hear from this role |
| Evaluation criteria | How they judge solutions |
| Buying process | Their role in the decision, who they influence |
| Messaging angle | The one sentence that resonates most |

### Persona Types

- **Economic buyer** — Signs the check. Cares about ROI and risk.
- **Technical buyer** — Evaluates the product. Cares about capabilities and integration.
- **End user** — Uses it daily. Cares about ease and workflow fit.
- **Champion** — Advocates internally. Needs ammunition to sell for you.
- **Blocker** — Opposes the purchase. Understand their concern to neutralize it.

---

## Output Format

Deliver the right format for each asset type:

| Asset | Deliverable |
|-------|-------------|
| Sales deck | Slide-by-slide outline with headline, body copy, and speaker notes |
| One-pager | Full copy with layout guidance (visual hierarchy, sections) |
| Objection doc | Table format: objection, response, proof point, follow-up |
| Demo script | Scene-by-scene with timing, talk track, and interaction points |
| ROI calculator | Input fields, formulas, output display with sample data |
| Playbook | Structured document with table of contents and sections |
| Persona card | One-page card format per persona |
| Proposal | Section-by-section copy with customization notes |

---

## Task-Specific Questions

If context is missing, ask:

1. What collateral do you need? (deck, one-pager, objection doc, etc.)
2. Who will use it? (AE, SDR, champion, prospect)
3. What sales stage is it for? (prospecting, discovery, demo, negotiation, close)
4. Who is the target persona? (title, seniority, department)
5. What are the top 3 objections you hear most?

---

## Tool Integrations

For partner sales enablement, see the [tools registry](../../tools/REGISTRY.md):

| Tool | What It Does | Guide |
|------|-------------|-------|
| **Introw** | Partner engagement tracking, deal registration, mutual action plans | [introw.md](../../tools/integrations/introw.md) |

---

## Related Skills

- **competitors**: For public-facing comparison and alternative pages
- **copywriting**: For marketing website copy
- **cold-email**: For outbound prospecting emails
- **revops**: For lead lifecycle, scoring, routing, and pipeline management
- **pricing**: For pricing decisions and packaging
- **product-marketing**: For foundational positioning and messaging

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/deck-frameworks.md

# Sales Deck Frameworks

Detailed slide-by-slide guidance for building sales decks that tell a story and close deals.

## The Storytelling Arc

Every great deck follows a narrative structure: **Situation → Complication → Resolution.**

- **Situation** (Slides 1-3): The world your buyer lives in. Establish shared understanding.
- **Complication** (Slides 2-3): Why the status quo is no longer sustainable. Create urgency.
- **Resolution** (Slides 4-11): Your approach, proof, and path forward.

The goal is not to present features. The goal is to make the buyer feel understood, then show them a better way.

---

## Slide-by-Slide Template

### Slide 1: Current World Problem

**What to include:**
- The challenge your buyer faces daily
- A stat or data point that quantifies the problem
- Visual: simple graphic or striking number

**What to avoid:**
- Starting with your company or product
- Generic industry trends that don't connect to pain
- More than one core problem

**Copy prompt:** "What is the one problem that, if you could describe it perfectly, would make your buyer say 'that's exactly my situation'?"

---

### Slide 2: Cost of the Problem

**What to include:**
- Financial impact (revenue lost, costs incurred)
- Time impact (hours wasted, delays)
- Risk impact (what happens if they do nothing)
- Specific numbers wherever possible

**What to avoid:**
- Vague claims without data
- Fear-mongering without substance
- Too many metrics (pick 2-3 that hit hardest)

**Copy prompt:** "If your buyer does nothing for the next 12 months, what does it cost them?"

---

### Slide 3: The Shift Happening

**What to include:**
- Market trend or technology change creating a new opportunity
- Why "the old way" no longer works
- Why now is the right time to act

**What to avoid:**
- Hype-driven trends without substance
- Making it about your product yet
- Overly technical explanations

**Copy prompt:** "What has changed in the market that makes the old approach unsustainable?"

---

### Slide 4: Your Approach

**What to include:**
- Your philosophy or unique point of view
- How your approach differs from conventional solutions
- The "aha" insight that led to your product

**What to avoid:**
- Feature lists (too early)
- Jargon or acronyms
- Claiming to be "the only" or "the first" unless provably true

**Copy prompt:** "What do you believe about solving this problem that most people get wrong?"

---

### Slide 5: Product Walkthrough

**What to include:**
- 3-4 key workflows that map to the pain from Slide 1
- Screenshots or product visuals
- Brief description of what each workflow accomplishes

**What to avoid:**
- Showing every feature
- Dense UI screenshots without callouts
- Talking about technology instead of outcomes

**Copy prompt:** "Walk through 3 things the buyer would do in your product in their first week."

---

### Slide 6: Proof Points

**What to include:**
- Customer logos (aim for recognizable names in their industry)
- Key metrics: "X% improvement," "Y hours saved," "Z% increase"
- Analyst recognition, awards, or certifications if relevant

**What to avoid:**
- Unsubstantiated claims
- Too many logos without context
- Vanity metrics that don't relate to the buyer's pain

**Copy prompt:** "What are 3 numbers that prove your product works?"

---

### Slide 7: Case Study

**What to include:**
- One customer story told well: challenge, solution, results
- Specific metrics (before and after)
- Customer quote if available
- Choose a customer similar to the prospect

**What to avoid:**
- Multiple case studies crammed into one slide
- Generic outcomes without specifics
- Customers from irrelevant industries

**Copy prompt:** "Tell the story of one customer who went from struggling to succeeding with your product."

---

### Slide 8: Implementation / Timeline

**What to include:**
- Clear phases with timeline (e.g., Week 1: Setup, Week 2-3: Integration, Week 4: Live)
- What's required from their side vs. yours
- Support resources available

**What to avoid:**
- Overcomplicating the process
- Hiding time requirements
- Skipping the "what do I need to do?" question

**Copy prompt:** "How does a customer get from signing to live? What does each week look like?"

---

### Slide 9: ROI / Value

**What to include:**
- Expected return based on their inputs or industry benchmarks
- Payback period
- Total value over 1-3 years
- Comparison to cost of inaction

**What to avoid:**
- Unrealistic projections
- ROI without showing your math
- Generic numbers not tied to their situation

**Copy prompt:** "If they buy today, what does the next 12 months look like in dollars and hours?"

---

### Slide 10: Pricing Overview

**What to include:**
- Pricing tiers or structure
- What's included at each level
- Recommended plan for their situation

**What to avoid:**
- Burying the price or being cagey
- Too many options (3 tiers max)
- Surprising them with hidden costs

**Copy prompt:** "What does it cost, what do they get, and which plan is right for them?"

---

### Slide 11: Next Steps / CTA

**What to include:**
- Specific next action with timeline ("Start a pilot next week")
- What happens after they say yes
- Your contact information

**What to avoid:**
- Vague CTAs ("Let's stay in touch")
- Multiple competing next steps
- Ending without energy

**Copy prompt:** "What is the one thing you want them to do after this meeting?"

---

## Persona Customization Guide

### Technical Buyer Deck

**Add:**
- Architecture diagram slide after Product Walkthrough
- Security and compliance details
- Integration ecosystem and API capabilities
- Technical implementation requirements

**Remove or minimize:**
- ROI calculations (they care about capability, not cost)
- High-level market trends (they want specifics)

**Adjust tone:** Precise, no fluff, respect their expertise. Avoid marketing superlatives.

### Economic Buyer Deck

**Add:**
- Detailed ROI slide with calculations shown
- Total cost of ownership comparison
- Risk mitigation and compliance
- Executive summary slide up front

**Remove or minimize:**
- Technical details and architecture
- Feature-level walkthroughs
- Implementation specifics (they'll delegate)

**Adjust tone:** Business-focused, outcome-driven. Speak in dollars and percentages.

### Champion Deck

**Add:**
- "Internal selling" slide — key points for them to present to their team
- Quick-win slide — what success looks like in 30 days
- Peer proof — companies like theirs who succeeded
- Objection pre-handling — common pushback they'll face internally

**Remove or minimize:**
- Deep technical or financial detail
- Anything that requires context they can't relay

**Adjust tone:** Empowering, equipping. Make them look smart to their boss.

---

## Anti-Patterns

### The Feature Dump
Every slide is a feature with a screenshot. No story, no "so what," no connection to the buyer's world. Reps click through it; prospects tune out.

### The Wall of Text
Slides with 200+ words. Nobody reads them during a presentation. If the slide requires reading, it belongs in a leave-behind.

### The Missing Story Arc
Slides exist in isolation — no narrative flow from problem to solution to proof. The deck feels like a brochure, not a conversation.

### The Generic Screenshot
Product screenshots without callouts, annotations, or context. The prospect can't tell what they're looking at or why it matters.

### The Premature Demo
Jumping to product features before establishing the problem. The buyer has no frame of reference for why your features matter.

### The Kitchen Sink
Trying to address every persona, every use case, every feature in one deck. The result is a 40-slide monster that nobody wants to sit through.

### references/demo-scripts.md

# Demo Script Templates

Scene-by-scene templates for different call types, with timing, talk tracks, and interaction guidance.

## Discovery Call Script

**Duration:** 30 minutes
**Goal:** Qualify the opportunity, understand pain, map the buying process.

### Scene 1: Opening (3 min)

**Talk track:**
> "Thanks for taking the time, [Name]. I've done some research on [Company] but I'd love to hear from you directly. My goal for today is to understand what you're working on and see if there's a fit — and if there's not, I'll tell you that too. Sound good?"

**What to establish:**
- Set the agenda and time expectation
- Position yourself as a peer, not a pitch person
- Get permission to ask questions

---

### Scene 2: Situation Questions (7 min)

**Questions to ask:**
- "Can you walk me through how your team handles [relevant process] today?"
- "What tools are you currently using for this?"
- "How many people are involved in this workflow?"
- "How long has this been in place?"

**What you're listening for:**
- Current process and tools
- Team size and structure
- How established (and how entrenched) the current approach is

---

### Scene 3: Pain Identification (10 min)

**Questions to ask:**
- "What's the biggest challenge with that process today?"
- "When that breaks down, what happens?"
- "How much time does your team spend on [specific task] per week?"
- "What have you tried to fix this?"
- "If you could wave a magic wand, what would change?"

**What you're listening for:**
- Specific, quantifiable pain points
- Emotional frustration (not just logical problems)
- Failed attempts to solve this (shows urgency)
- The "magic wand" answer reveals their ideal state

**Interaction tip:** Take notes visibly. Repeat back what you hear: "So if I understand correctly, the biggest issue is [X], which costs you about [Y] per month. Is that right?"

---

### Scene 4: Impact & Priority (5 min)

**Questions to ask:**
- "Where does solving this sit on your priority list this quarter?"
- "What happens if you don't solve this in the next 6 months?"
- "Who else is affected by this problem?"
- "Is there budget allocated for solving this?"

**What you're listening for:**
- Priority level (nice-to-have vs. must-solve)
- Urgency and consequences of inaction
- Organizational breadth of the problem
- Budget signals

---

### Scene 5: Buying Process (3 min)

**Questions to ask:**
- "If you decided this was the right solution, what does the evaluation process look like?"
- "Who else would be involved in the decision?"
- "Have you evaluated solutions for this before?"
- "What's your timeline for making a decision?"

**What you're listening for:**
- Decision-making process and stakeholders
- Past evaluation experience (and why they didn't buy)
- Timeline for decision

---

### Scene 6: Close (2 min)

**Talk track:**
> "Based on what you've shared, I think there's a strong fit — specifically around [pain point 1] and [pain point 2]. What I'd suggest as a next step is a 30-minute demo where I can show you exactly how we'd address those. I'll customize it to your workflow. Does [specific date/time] work?"

**What to do:**
- Summarize the 2-3 key pain points
- Propose a specific next step with a date
- Send a calendar invite before you hang up

---

## First Demo Script

**Duration:** 30-45 minutes
**Goal:** Show how your product solves their specific pain. Advance to evaluation/pilot.

### Scene 1: Opening & Recap (5 min)

**Talk track:**
> "Last time we spoke, you mentioned [pain point 1], [pain point 2], and [goal]. I've put together a demo focused on those three areas. If I've missed anything, flag it and we'll adjust. Sound good?"

**What to do:**
- Recap discovery findings to show you listened
- Confirm priorities haven't changed
- Set expectation for what they'll see

---

### Scene 2: Workflow 1 — Primary Pain Point (10 min)

**Structure:**
1. Restate the pain: "You mentioned [specific problem]..."
2. Show the solution: Walk through the workflow step by step
3. Highlight the outcome: "This means [specific benefit]..."

**Interaction point (at the 5-min mark):**
> "How does this compare to how you're handling it today?"

**What to avoid:**
- Showing every feature of this section
- Getting lost in settings or configuration
- Talking for more than 3 minutes without asking a question

---

### Scene 3: Workflow 2 — Secondary Pain Point (8 min)

**Structure:**
Same as Workflow 1 — restate pain, show solution, highlight outcome.

**Interaction point:**
> "Is this the kind of visibility your team has been asking for?"

---

### Scene 4: Workflow 3 — Differentiator (7 min)

**Structure:**
Show something they can't do today and can't get from competitors.

**Talk track:**
> "This is where we're really different from [competitor/status quo]. [Explain the unique capability]. For example, [Customer] uses this to [specific outcome]."

**Interaction point:**
> "How would your team use this?"

---

### Scene 5: Proof Point (3 min)

**Talk track:**
> "Let me share a quick example. [Customer similar to them] was in a similar situation — [brief challenge]. After implementing, they saw [specific metrics]. Their [role] said [quote]."

**What to do:**
- Choose a case study that matches their industry, size, or use case
- Keep it brief — this is reinforcement, not a presentation

---

### Scene 6: Close (5 min)

**Talk track:**
> "Based on what we've covered, here's what I'd recommend as next steps: [specific next step]. This typically takes [timeline]. Who else on your team should be involved? I can set up a [follow-up meeting type] for [date]."

**What to do:**
- Propose a specific next step (not "let me know")
- Identify additional stakeholders to involve
- Set a follow-up date before ending the call
- Send recap email within 2 hours

---

## Technical Deep-Dive Script

**Duration:** 45-60 minutes
**Goal:** Satisfy technical evaluation criteria. Address architecture, security, and integration concerns.

### Scene 1: Opening (3 min)

**Talk track:**
> "I know your goal today is to understand the technical details — architecture, security, integrations, and how this fits your stack. I'll walk through each area and leave plenty of time for questions. What's your top priority for this session?"

**Attendees:** Typically includes their technical evaluator (engineer, architect, IT lead) plus your SE or solutions engineer.

---

### Scene 2: Architecture Overview (10 min)

**Cover:**
- High-level architecture diagram
- Infrastructure and hosting (cloud provider, regions)
- Data flow and storage
- Scalability approach
- Uptime SLA and reliability track record

**Interaction point:**
> "How does this compare to your current infrastructure requirements?"

---

### Scene 3: Security & Compliance (10 min)

**Cover:**
- Certifications (SOC 2, ISO 27001, HIPAA, etc.)
- Data encryption (at rest, in transit)
- Access controls and authentication (SSO, RBAC)
- Audit logging
- Data residency and privacy (GDPR, CCPA)
- Penetration testing cadence

**Interaction point:**
> "What are your must-have security requirements? I want to make sure we address them specifically."

---

### Scene 4: Integrations & API (15 min)

**Cover:**
- Native integrations relevant to their stack
- API capabilities (REST, GraphQL, webhooks)
- Authentication methods
- Rate limits and data sync frequency
- Live demo of relevant integration

**Interaction point:**
> "Walk me through your current stack — I want to map out exactly how we'd fit in."

---

### Scene 5: Implementation & Migration (5 min)

**Cover:**
- Implementation timeline and phases
- Data migration process
- Configuration requirements
- Training and onboarding
- Ongoing support model

**Interaction point:**
> "What does your team's capacity look like for implementation? That helps me scope the right timeline."

---

### Scene 6: Q&A and Close (10 min)

**Talk track:**
> "What questions do I need to answer for you to feel confident about the technical fit?"

**What to do:**
- Answer directly — if you don't know, say so and follow up
- Document all questions for follow-up
- Propose next step (security review, proof of concept, pilot)
- Send technical documentation summary within 24 hours

---

## Executive Overview Script

**Duration:** 20-30 minutes
**Goal:** Get executive buy-in on the business case. Advance to budget approval or decision.

### Scene 1: Opening (2 min)

**Talk track:**
> "Thanks for your time, [Name]. [Champion] has been evaluating [your product] and the results look strong. I'll keep this focused on the business impact and what a partnership looks like. I know your time is valuable so I'll aim to leave 10 minutes for questions."

**What to do:**
- Be concise — executives punish rambling
- Reference the champion and work done so far
- Set a clear agenda

---

### Scene 2: The Problem & Cost (5 min)

**Talk track:**
> "Based on what [Champion] shared, your team is spending [X hours/$ amount] on [problem]. That's [annual cost]. It's also creating [secondary impact: risk, delays, churn]. This isn't unique to you — it's an industry-wide challenge, and the companies solving it are seeing [outcome]."

**What to do:**
- Use their numbers, not generic benchmarks
- Connect to metrics they care about (revenue, cost, risk)
- Keep it to 2-3 key points

---

### Scene 3: The Solution & Differentiation (5 min)

**Talk track:**
> "Here's what we do differently. [One-sentence explanation]. For your team specifically, this means [specific benefit 1] and [specific benefit 2]. [Champion]'s team has already seen [early result or reaction from evaluation]."

**What to do:**
- High-level, not feature-level
- Tie to their strategic priorities
- Reference the champion's evaluation

---

### Scene 4: ROI & Business Case (5 min)

**Talk track:**
> "Here's the business case. Based on your team's numbers: [walk through ROI calculation]. Expected payback period is [X months]. Over 3 years, the total value is [$ amount]. [Customer similar to them] saw [specific result] within [timeframe]."

**What to do:**
- Show the math, not just the conclusion
- Use conservative estimates (executives discount inflated numbers)
- One strong case study, not three weak ones

---

### Scene 5: Q&A and Decision (5-10 min)

**Talk track:**
> "What questions do you have? And — assuming the business case holds up, what does the decision process look like from here?"

**What to do:**
- Listen more than talk
- Answer concisely
- Get a clear next step and timeline
- Thank the champion in front of the executive

---

## Interaction Point Guidance

### When to Ask Questions During Demos

- **After showing each workflow** — "How does this compare to your current process?"
- **When you see a reaction** — "I noticed you reacted to that — what are you thinking?"
- **Before moving to the next section** — "Any questions on this before we move on?"
- **When showing a differentiator** — "How would your team use this?"
- **At the midpoint** — "Are we covering the right things, or should we adjust?"

### Questions NOT to Ask During Demos

- "Does that make sense?" (patronizing)
- "Are you still with me?" (implies they're lost)
- "Isn't that cool?" (salesy)
- Rhetorical questions that don't invite real dialogue

### How to Handle "Can You Show Me X?"

When a prospect asks to see something during the demo:

1. **If it's quick** — show it now, then return to your flow
2. **If it's a tangent** — "Great question. Let me note that and show you after the main flow so we stay on track."
3. **If it's not possible** — "We don't do that today. Here's how customers handle it: [alternative]."

Never say "I'll get back to you" without writing it down and following up within 24 hours.

### references/objection-library.md

# Objection Library

Common B2B SaaS objections with response frameworks. Organized by category for quick reference.

## Quick-Reference Table

For live calls. Find the objection, scan the response, reference the proof.

| Objection | Response (1-line) | Proof Point |
|-----------|--------------------|-------------|
| "Too expensive" | "Compared to what? Let's look at what the problem costs you today." | ROI case study showing payback in X months |
| "No budget" | "When budget opens up, what would need to be true for this to be a priority?" | Customer who started with a pilot to prove value |
| "Competitor is cheaper" | "They are — here's what you give up at that price point." | Feature comparison + customer who switched |
| "Not the right time" | "What changes next quarter that makes it better timing?" | Cost-of-delay calculation |
| "Maybe next quarter" | "Happy to reconnect. What would a pilot look like before then?" | Customer who started small and expanded |
| "We use X already" | "How's that working for [specific pain area]?" | Customer who switched from X |
| "What makes you different?" | "For teams like yours, the biggest difference is [specific differentiator]." | Side-by-side comparison for their use case |
| "Need to check with my boss" | "Absolutely. What would help you make the case? I can send materials." | Champion one-pager, ROI calculator |
| "The committee decides" | "Who's on the committee and what does each person care about?" | Multi-persona case study |
| "What we have works fine" | "It does work — the question is whether it's costing you more than it should." | Benchmark data showing efficiency gaps |
| "Not broken, don't fix it" | "Agreed — this isn't about fixing, it's about the opportunity cost of the current approach." | Customer who didn't know what they were missing |
| "Does it integrate with X?" | "Yes / Let me check and get you specifics by end of day." | Integration documentation, customer using same stack |
| "Security concerns" | "Completely fair. Here's our security overview — happy to loop in our team." | SOC 2 report, security whitepaper |
| "Can it scale?" | "We serve companies from [small] to [large]. Here's an example at your scale." | Case study at similar scale |
| "We tried something like this before" | "What went wrong? Understanding that helps me show how we're different." | Customer with same failed experience who succeeded with you |

---

## Detailed Objection Responses

### Price Objections

#### "It's too expensive"

**Why they say it:** May be genuine budget constraint, sticker shock, or negotiation tactic. Often means they don't yet see enough value to justify the cost.

**Response approach:**
1. Don't defend the price immediately. Ask "Compared to what?"
2. Reframe from cost to investment — what does the problem cost them today?
3. Walk through the ROI calculation together
4. If budget is real, explore smaller starting points

**Talk track:**
> "I hear that. Let me ask — what's the cost of the problem we discussed? You mentioned your team spends [X hours] on [task] every week. At your team's loaded cost, that's roughly [$ amount] per year. Our solution runs [$ price] — so the question is whether eliminating that problem is worth the investment."

**Proof point:** ROI calculator or case study showing payback period.

**Follow-up question:** "If the ROI was clear, is this something you'd prioritize this quarter?"

---

#### "We don't have budget for this"

**Why they say it:** Budget may genuinely be allocated. Or they haven't identified budget because priority isn't established.

**Response approach:**
1. Validate — budget constraints are real
2. Understand timing — when does budget cycle reset?
3. Explore alternatives — pilot, smaller scope, different budget line
4. Help them build the business case to create budget

**Talk track:**
> "Totally understand. Two questions: When does your next budget cycle open? And — if we could show clear ROI with a limited pilot, is that something you could fund from a different line item? Sometimes teams fund this from the efficiency savings it creates."

**Proof point:** Customer who started with a small pilot and expanded after proving ROI.

**Follow-up question:** "Would it help if I put together an ROI brief you could share with your finance team?"

---

#### "Competitor X is cheaper"

**Why they say it:** They're comparing prices, possibly without comparing capabilities. May be using competitor price as leverage.

**Response approach:**
1. Acknowledge the price difference — don't pretend it doesn't exist
2. Shift to total cost of ownership and value delivered
3. Highlight what they lose at the lower price point
4. Share proof from customers who evaluated both

**Talk track:**
> "You're right, [Competitor] is less expensive. Here's what I've seen from teams who evaluated both: [Competitor] works well for [their strength]. Where it falls short is [specific gap]. Customers like [name] actually switched to us after starting with [Competitor] because [specific reason]. The question is whether [specific capability] is worth the difference for your team."

**Proof point:** Customer who switched from the competitor, with specific reasons.

**Follow-up question:** "What's most important to your team — the lowest price or the best fit for [their specific need]?"

---

### Timing Objections

#### "Not the right time"

**Why they say it:** Competing priorities, organizational change, genuine capacity constraint, or lack of urgency.

**Response approach:**
1. Understand what's competing for their attention
2. Quantify the cost of waiting
3. Explore low-commitment next steps that keep momentum
4. Set a concrete follow-up date

**Talk track:**
> "I get it — timing matters. Can I ask what's taking priority right now? The reason I bring up timing is that every month of [problem], based on our earlier conversation, costs your team roughly [$ amount]. A 3-month delay is [$ amount]. What if we mapped out a start date that works with your calendar so you're not losing that value?"

**Proof point:** Cost-of-delay calculation based on their specific numbers.

**Follow-up question:** "What would need to change for this to move up in priority?"

---

#### "Maybe next quarter"

**Why they say it:** Genuine scheduling, or a polite way of saying "not interested enough right now."

**Response approach:**
1. Accept the timeline gracefully
2. Propose a small action now that maintains momentum
3. Get a specific date for follow-up
4. Send value in the meantime (content, benchmarks, insights)

**Talk track:**
> "Next quarter works. To make sure we hit the ground running, would it make sense to do [small next step] now? That way when Q[X] starts, you're not starting from scratch. I'll also send over [relevant content] in the meantime. Can we lock in [specific date] to reconnect?"

**Proof point:** Customer who started the evaluation process early and was live by their target date.

**Follow-up question:** "Is there anything I can send between now and then that would be helpful?"

---

### Competition Objections

#### "We already use X"

**Why they say it:** They have an existing solution and switching has real costs. May be satisfied, or may have frustrations they haven't voiced.

**Response approach:**
1. Don't trash the competitor — ask how it's working
2. Probe for specific pain points with their current solution
3. Position as complementary if possible, replacement if not
4. Offer a side-by-side comparison or trial

**Talk track:**
> "How's that working for you? Specifically, when it comes to [area where you're stronger] — is that meeting your needs? The reason I ask is that most teams who come to us from [Competitor] tell us [specific pain point] was the tipping point. Not saying that's you, but worth exploring."

**Proof point:** Customer who switched from that specific competitor.

**Follow-up question:** "If you could change one thing about your current setup, what would it be?"

---

#### "What makes you different?"

**Why they say it:** They're evaluating options and want a clear differentiator. Sometimes a genuine question, sometimes a test.

**Response approach:**
1. Don't list features — give the one thing that matters most for their situation
2. Tie the differentiator to their specific pain
3. Back it up with proof
4. Offer to show, not just tell

**Talk track:**
> "For teams like yours — [their industry/size/use case] — the biggest difference is [specific differentiator]. That matters because [connection to their pain]. For example, [Customer] was evaluating us alongside [Competitor] and chose us because [specific reason]. Want me to walk you through how that works?"

**Proof point:** Case study of a customer who chose you over alternatives.

**Follow-up question:** "What's the most important criteria for your decision?"

---

### Authority Objections

#### "I need to check with my boss"

**Why they say it:** They may not be the decision maker, or they need internal buy-in to proceed. Could also be a stall tactic.

**Response approach:**
1. Support them, don't pressure them
2. Arm them with materials to sell internally
3. Offer to join a meeting with their boss
4. Understand what their boss cares about

**Talk track:**
> "Absolutely — what would help you make the case? I can put together a one-pager that covers the ROI and addresses the concerns your boss is likely to have. Also happy to jump on a quick call with them if that would be helpful. What does your boss typically prioritize — cost savings, risk reduction, or efficiency?"

**Proof point:** Champion enablement one-pager, ROI calculator.

**Follow-up question:** "What questions do you think your boss will ask?"

---

#### "A committee decides this"

**Why they say it:** Enterprise buying involves multiple stakeholders. Genuine process, not a brush-off.

**Response approach:**
1. Map the buying committee — who's involved and what each person cares about
2. Provide persona-specific materials
3. Offer to present to the committee
4. Help your champion navigate the internal process

**Talk track:**
> "That makes sense. Can you walk me through who's on the committee and what each person cares about? I can tailor materials for each stakeholder so you're not doing all the heavy lifting. I've also got a deck designed for executive presentations if that would be useful."

**Proof point:** Multi-stakeholder case study showing how different personas were addressed.

**Follow-up question:** "Who on the committee is most likely to push back, and what would their concern be?"

---

### Status Quo Objections

#### "What we have works fine"

**Why they say it:** Inertia is real. The current solution may be adequate, and change has real costs.

**Response approach:**
1. Agree — don't argue with their experience
2. Shift from "broken vs. fixed" to "good vs. great"
3. Introduce the concept of opportunity cost
4. Show what peers are achieving

**Talk track:**
> "It probably does work — and I wouldn't suggest changing something that's truly meeting your needs. The question I'd ask is: is 'works fine' the bar? Teams using [your product] are seeing [specific outcome]. If you're leaving [X% improvement] on the table, is that worth exploring?"

**Proof point:** Benchmark data showing what's possible vs. status quo.

**Follow-up question:** "If there were one area where your current approach could be better, what would it be?"

---

### Technical Objections

#### "Does it integrate with X?"

**Why they say it:** Integration is a real requirement. They need to know your product fits their stack.

**Response approach:**
1. Answer directly — yes, no, or "let me check"
2. If yes, provide specifics (native, API, Zapier, etc.)
3. If no, explain alternatives or workarounds
4. Never bluff — they'll find out during evaluation

**Talk track (if yes):**
> "Yes, we integrate with [X] natively. It takes about [time] to set up. [Customer] runs the same stack and here's how they have it configured."

**Talk track (if no):**
> "We don't have a native integration with [X] today. Here's what customers typically do: [alternative]. We also have an open API that [description]. Would it help to get our technical team on a call to explore options?"

**Proof point:** Customer using the same tech stack, integration documentation.

**Follow-up question:** "What other tools are in your stack that we'd need to work with?"

---

#### "We have security concerns"

**Why they say it:** Legitimate concern, especially in regulated industries or enterprise. Non-negotiable for many buyers.

**Response approach:**
1. Take it seriously — never dismiss security concerns
2. Provide documentation proactively (SOC 2, security whitepaper)
3. Offer to loop in your security team
4. Ask about their specific requirements

**Talk track:**
> "That's exactly the right question to ask. Here's our security overview — we're [SOC 2 Type II / ISO 27001 / etc.] certified, and I can share our full security documentation. We also have a security team that's happy to do a review call with your infosec team. What are your specific requirements?"

**Proof point:** Security certifications, compliance documentation, customers in regulated industries.

**Follow-up question:** "Do you have a security questionnaire you'd like us to fill out?"

### references/one-pager-templates.md

# One-Pager Templates

Templates for different one-pager use cases, with layout guidance and copy prompts.

## Product Overview One-Pager

The default one-pager. Introduces your product to someone who knows nothing about you.

### Structure

```
[Logo]                                              [Tagline]

HEADLINE: One sentence describing what you do and who it's for.

THE PROBLEM
2-3 sentences describing the pain your buyer faces.

THE SOLUTION
2-3 sentences describing how your product solves it.

WHY [YOUR PRODUCT]
• Differentiator 1 — One sentence explaining the benefit
• Differentiator 2 — One sentence explaining the benefit
• Differentiator 3 — One sentence explaining the benefit

PROOF
"Customer quote with specific result." — Name, Title, Company
[Optional: 2-3 metric callouts: "X% improvement", "Y hours saved"]

[CTA Button/Link]                    [Contact: name@company.com]
```

### Copy Prompts

- Headline: "What do you do, in one sentence, that makes someone say 'tell me more'?"
- Problem: "What is your buyer struggling with before they find you?"
- Differentiators: "If you could only tell them 3 things, what would make them choose you?"

---

## Use-Case Specific One-Pager

Tailored to a specific workflow, vertical, or problem. More targeted than the product overview.

### Structure

```
[Logo]                                    [Use Case: e.g., "For Sales Teams"]

HEADLINE: How [your product] helps [persona] [achieve outcome].

THE CHALLENGE
When [persona] needs to [task], they face [specific pain].
This leads to [consequence]: [time wasted / money lost / risk].

HOW IT WORKS
1. [Step 1] — What happens and why it matters
2. [Step 2] — What happens and why it matters
3. [Step 3] — What happens and why it matters

RESULTS
• [Metric 1]: Before → After
• [Metric 2]: Before → After
• [Metric 3]: Before → After

CUSTOMER SPOTLIGHT
"Quote about this specific use case." — Name, Title, Company

[CTA: "See it in action" or "Start a pilot"]       [Contact info]
```

### When to Use

- Different buyer personas need different one-pagers
- Industry-specific versions (healthcare, fintech, e-commerce)
- Use-case versions (reporting, onboarding, security)

---

## Post-Meeting Leave-Behind

Designed to reinforce a conversation that already happened. Summarizes what you discussed and proposes next steps.

### Structure

```
[Logo]                                            [Date of Meeting]

MEETING RECAP: [Company Name]

WHAT WE DISCUSSED
• [Pain point 1 they mentioned]
• [Pain point 2 they mentioned]
• [Goal they're trying to achieve]

HOW [YOUR PRODUCT] HELPS
• [Solution to pain 1] — [Specific capability or workflow]
• [Solution to pain 2] — [Specific capability or workflow]
• [How you help them reach their goal]

RELEVANT PROOF
"Quote from a similar customer." — Name, Title, Company
[1-2 metrics from a similar customer]

PROPOSED NEXT STEPS
1. [Next step with date]
2. [Follow-up action]
3. [Decision timeline]

[Your name]  |  [Your title]  |  [Email]  |  [Phone]
```

### Tips

- Send within 24 hours of the meeting
- Reference specific things they said (shows you listened)
- Keep proposed next steps concrete and time-bound
- This is the asset your champion forwards to their boss

---

## Champion Enablement One-Pager

Designed specifically for your internal champion to share with their team and leadership. Written to make them look smart.

### Structure

```
[Logo]

WHY WE'RE EVALUATING [YOUR PRODUCT]

THE SITUATION
[2-3 sentences about the internal challenge, written as if the champion
is explaining it to their team. Use "we" and "our" language.]

WHAT [YOUR PRODUCT] DOES
[1-2 sentences. Plain language, no jargon.]

WHY THIS SOLUTION
• [Reason 1] — How it solves our specific problem
• [Reason 2] — How it compares to what we do today
• [Reason 3] — How it compares to alternatives we evaluated

EXPECTED IMPACT
• [Metric]: Current state → Expected state
• [Metric]: Current state → Expected state
• [Time to value]: Live within [X weeks]

WHO ELSE USES IT
[2-3 recognizable company names in their industry]
"Relevant customer quote." — Name, Title, Company

NEXT STEPS
• [What we're doing next]
• [What we need from the team]
• [Decision timeline]

Questions? Talk to [Champion name] or [Your name at email].
```

### Why This Works

- Written in the champion's voice, not yours
- Answers the questions their boss will ask
- Includes peer proof from companies they respect
- Clear ask and timeline to drive internal momentum

---

## Layout Guidance

### Visual Hierarchy

1. **Headline** — Largest text, top of page, immediately communicates value
2. **Section headers** — Bold, clear, act as scannable anchors
3. **Body text** — Short sentences, bullet points preferred over paragraphs
4. **Proof elements** — Metrics and quotes should visually stand out (larger font, color, or callout box)
5. **CTA** — Prominent placement, bottom of page or bottom-right

### Whitespace

- Margins: at least 0.75" on all sides
- Space between sections: enough to visually separate (don't cram)
- If it feels crowded, cut content. Never shrink font below 9pt.

### Font Sizing

| Element | Suggested Size |
|---------|---------------|
| Headline | 18-24pt |
| Section headers | 12-14pt bold |
| Body text | 10-11pt |
| Fine print / footer | 8-9pt |

### Color

- Use brand colors for headers and accents
- Keep body text dark (black or near-black) on white
- Limit accent colors to 1-2 for visual consistency
- Use color to draw attention to metrics and CTAs

### File Format

- **PDF** for email attachments and leave-behinds
- **Google Slides / PowerPoint** for editable versions reps can customize
- Always include both — reps will customize, prospects want clean PDFs

