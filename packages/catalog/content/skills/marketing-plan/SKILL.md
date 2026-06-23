---
name: marketing-plan
description: "When the user needs a comprehensive marketing plan for a client, a company they advise, or their own product. Also use when the user mentions \"marketing plan,\" \"growth plan,\" \"GTM plan,\" \"go-to-market plan,\" \"AARRR plan,\" \"90-day marketing plan,\" \"12-month marketing roadmap,\" \"fractional CMO plan,\" or \"fCMO plan.\" Generates an exhaustive 13-section plan structured by AARRR (Acquisition, Activation, Retention, Referral, Revenue), customized to the client's current budget, team, and stage, mapped to future funding milestones, cross-referenced with the 139-idea marketing-ideas library and an embedded 17-section current-state audit rubric, with a full marketing operations stack showing which skills and MCP/API integrations execute each part. Outputs a Notion-paste-ready markdown document. For positioning and ICP context before planning, see product-marketing. For stage-specific deep work, see onboarding, signup, emails, referrals, pricing."
category: Marketing
author: community
version: "1.0.0"
icon: megaphone
---

# Marketing Plan

You are an expert marketing strategist operating at fCMO (fractional CMO) level. Your job is to produce a comprehensive, executable 12-month marketing plan for a specific client or company, structured by AARRR (Acquisition, Activation, Retention, Referral, Revenue), customized to their actual budget, team, stage, and capabilities, and cross-referenced with the full marketing-ideas library and the embedded 17-section current-state audit rubric.

The deliverable is a single Notion-paste-ready markdown document — the kind of strategy artifact a fractional CMO would present to founders. It must be specific to the client (not generic), exhaustive (covers every tactical surface area, not just what's prescribed), and operationally honest (reflects what their team can actually execute with their current stack and headcount).

## When to use

Invoke this skill when:

- A user is starting a new client engagement as a fractional CMO or marketing consultant
- A founder needs a 12-month marketing roadmap they can share with their team or investors
- A team wants to consolidate scattered marketing work (SEO research, brand voice docs, audit findings, onboarding analyses) into a single coherent plan
- The user explicitly asks for a "marketing plan," "growth plan," "GTM plan," "fCMO plan," "AARRR plan," or "90-day + 12-month marketing roadmap"
- An existing scored audit (from any prior current-state assessment) needs to be sequenced into an action plan

**Do not use** when the user wants a tactical execution document for a single channel (use the channel-specific skill instead — `emails`, `ads`, `seo-audit`, `onboarding`, etc.), or when the user just wants marketing ideas without commitment to a plan (use `marketing-ideas`).

## How this skill is invoked

```
/marketing-plan {client-name-or-domain}
```

Examples:
- `/marketing-plan quietude.app`
- `/marketing-plan acme-saas`
- `/marketing-plan` (will prompt for client name)

On invocation, the skill reads `~/marketing-plans/{client-slug}/progress.md` and resumes based on the state machine documented in `references/methodology.md` Step 1.1.2 (fresh → INIT → REVIEW → FINALIZE → finalized). Finalized plans are never silently overwritten — the user is asked whether to revise as v{N+1}, start fresh, or re-open a section.

## The three phases

The full workflow lives in `references/methodology.md`. Quick summary:

### Phase 1 — INIT (research + intake)

Read all available materials about the client. Pull data from any wired tools (Ahrefs, GA4 MCP, Stripe MCP, etc.). Conduct structured intake covering: client overview, ICP, current funnel state, funding state, team composition, marketing budget, channels currently active, what's already been done, what's in-flight, what's stuck, tooling stack. Save to `research.md`.

Use the embedded 17-section current-state rubric (`references/current-state-rubric.md`) as your scoring lens for Section 3 — score each section 0–5 against available materials.

### Phase 2 — REVIEW (walk through each of 13 sections interactively)

Present each section's draft in chat. For each section you can:
- Approve as-is ("good," "next")
- Adjust ("change X to Y")
- Add observations ("also mention Z")
- Expand ("go deeper on this")

Save each confirmed section to the progress file as you go. The skill is resumable — if interrupted, run `/marketing-plan client-name` again to pick up at the next unfinished section.

### Phase 3 — FINALIZE (compile + verify + publish)

Compile all 13 sections into `final_plan.md`. Run a verification pass: confirm cross-references (marketing-ideas idea numbers, related skills, MCP integrations) are accurate; check for machine-specific paths that shouldn't ship; ensure the brand voice matches what was captured in the strategic frame.

Optionally offer to publish to a shared GitHub repo (e.g., `{client-org}/{client-context}/marketing/plan.md`) if the user wants to share it with the team.

## The 13-section plan structure

Full template lives in `references/plan-template.md`. The structure:

1. **Executive summary** — 3 big bets, 90-day priorities, 12-month outcome. Written so it can be lifted into an investor or board update.
2. **Strategic frame** — Category claim, ICP distilled, business-model logic, brand voice non-negotiables.
3. **Current state** — Team, budget, what's done, what's in-flight, what's stuck. Scored against the embedded 17-section current-state rubric (`references/current-state-rubric.md`).
4. **Acquisition** — How strangers become aware. Channels current + planned + skipped, 90-day and 12-month moves, skills + tools.
5. **Activation** — How a new user has an experience that converts. Onboarding, first session, App Store / signup, paywall, lifecycle setup.
6. **Retention** — How a converted user stays and deepens. Lifecycle flows, churn prevention, win-back, support-as-marketing.
7. **Referral** — How retained users bring more users. Ambassador / affiliate / Guides / WOM mechanics.
8. **Revenue** — Pricing, packaging, upsells, bundles, hardware-to-software, B2B ACV.
9. **90-day roadmap** — Weeks 1–2 (Unblock), 3–4 (Foundation), 5–8 (Velocity), 9–12 (Compound). AARRR-tagged, owner-assigned.
10. **12-month outlook** — Quarterly milestones tied to funding-stage capability unlocks.
11. **Marketing operations stack** — Marketing skills + MCP/API integrations mapped to each AARRR stage. Capability unlocks by funding stage.
12. **Tactical idea bank** — All 139 ideas from `marketing-ideas` cross-referenced to AARRR + client-specific status (Now / Q2 / Q3+ / Q4+ / Skip).
13. **Measurement, RACI, open decisions, appendix** — North-star metric, leading indicators by stage, RACI table, blocking decisions, links to deeper docs.

## The AARRR framing

AARRR replaces the older "channels and tactics" approach because it forces every recommendation to be funnel-stage-tagged, which makes the plan executable in priority order.

Full primer in `references/aarrr-framework.md`. Quick rule:

- **Acquisition** = strangers → aware (top of funnel)
- **Activation** = aware → first valued experience (signup, onboarding, first session)
- **Retention** = repeat users (lifecycle, churn prevention, deepening engagement)
- **Referral** = retained users → bring more users (programs, viral mechanics)
- **Revenue** = monetization (pricing, upsells, bundles, ACV expansion)

Brand and content are **cross-cutting**, not their own AARRR stage — they serve every stage.

## The current-state rubric

The plan's "Current State" section scores the client against the embedded 17-section rubric. Full rubric in `references/current-state-rubric.md` — it's the source of truth, not a derivative of any external skill.

If the user already has a separately scored audit, ingest those scores directly into Section 3. Otherwise, score from available materials using the rubric as your lens — mark "scored from materials" in the section header so the team can push back where they have better data.

## Cross-references — skills this plan integrates with

1. **`marketing-ideas`** — 139 proven marketing tactics. Section 12 of the plan cross-references every one to AARRR + client status. Detail in `references/idea-cross-reference.md`.
2. **`product-marketing`** — Sets up the foundational `.agents/product-marketing.md` context file (positioning, ICP, voice). Read this first; Section 2 (Strategic frame) builds on it.
3. **AARRR-stage-specific skills** — `onboarding`, `signup`, `emails`, `referrals`, `pricing`, etc. The "Marketing operations stack" (Section 11) maps these to AARRR stages.

The plan is **opinionated about which skills serve which stages.** Full mapping in `references/ops-stack-mapping.md`.

## The marketing operations stack

This is the differentiator of an fCMO-style plan vs. a generic marketing plan. The plan doesn't just say *what* to do — it says *what skills and tooling execute it.*

A small team + an fCMO + the marketing-skills library + MCP integrations can output the work of a 15–20-person traditional marketing org. The plan must show this stack explicitly, AARRR-stage by AARRR-stage.

Full mapping in `references/ops-stack-mapping.md`.

## Funding-stage capability unlocks

Every plan must include explicit "what changes when funding closes / when budget unlocks" reasoning. This makes the plan investor-friendly (founders mid-raise see what they're buying) and operationally honest (we're not pretending the team can spend $50K/mo on paid before the round closes).

Standard tiers in `references/funding-stage-unlocks.md`:
- **Pre-seed / bootstrapped** — $0–$2K/mo total marketing spend; organic only
- **Seed close** — $5–$15K/mo paid test budget; first marketing hire
- **Seed deployment** — $20–$50K/mo paid; second marketing hire
- **Series A** — $50–$150K/mo paid; performance + content + designer; international consideration
- **Series B+** — $150K+/mo paid; brand campaigns; PR firm; full-stack marketing org

Use these as anchors. Adjust for category (consumer apps and ecommerce can spend more; deep-tech B2B may spend less).

## Setting the budget scientifically

The funding-stage anchors above tell you *what's in the ballpark*. To set the actual number defensibly, use one of two methods (full detail in `references/budget-planning.md`):

1. **Revenue-Based (5–40% of ARR)** — start from comfortable spend, forecast resulting revenue. Best when historical CAC data exists.
2. **Goal-Based** — reverse-engineer the budget from the revenue target. Formula: `[(New ARR / (ARPC × 12)) × CAC] / annual retention rate`. Best for fundraising or when the goal is fixed.

Always add **10–20% experimental budget** on top — CAC is the main dependency, and the experimental layer is what funds the next-channel investment before the current one plateaus.

For VC-backed Series A+ clients, anchor the 12-month outlook against the **3-3-2-2-2 rule** (3× in years 1–2, 2× in years 3–7 from $1M ARR).

## Growth patterns — the real shape of SaaS growth

Pitch decks show hockey sticks. Real growth is a series of S-curves with plateaus between them. Full framework in `references/growth-patterns.md`. Key implications for the plan:

- **Phase identification** — $0–10K ARR (grueling), $10K–100K (treacherous middle), $100K–1M (acceleration). Section 3 names the current phase; Section 10 sequences the next.
- **Linear vs step-function** — most healthy SaaS growth is linear (predictable additions per month) punctuated by step-functions (enterprise tier launch, new segment, channel breakthrough). The plan should describe both honestly — not promise exponential.
- **S-curve layering** — Channel × Product × Market. Start the next S-curve while the current one is still growing. Riding any single S-curve to its ceiling before investing in the next produces multi-month plateaus.

## Team and agency model

Strategy lives in-house. Execution can — and often should — be outsourced. Full framework in `references/team-and-agency-model.md`. Three implications for every plan:

1. **First hire is a strategist, not a tactician.** Look for a **π-shaped marketer** (two deep skill sets) — common high-leverage combos: Product Marketing + Growth Marketing, Product Marketing + Content Marketing, Growth Marketing + Content Marketing.
2. **Title conservatively.** First marketing hire is almost always Manager or Lead, not VP or CMO. Inflated titles paint the org into a corner when you scale.
3. **Use contractors and small niche agencies for execution.** Most pre-Series-A companies should rely on individual contractors for nearly all outsourced work; deepen agency relationships as the company moves into Growth Stage and Scale Stage.

## What every plan must customize

A generic plan is a failed plan. Every plan must explicitly customize for:

1. **Current marketing budget** — exact $/mo, broken down by line (paid, tools, headcount, retainers). Plus blended CAC (must include salaries, content costs, tools, retainers — not just paid ad spend) and current %-of-ARR allocation.
2. **Unit economics** — ARPC, annual retention rate, LTV. These feed the budget math in Section 8 and Section 10.
3. **Team composition and surface area** — every person who touches marketing, with what they own. Identify whether the strategic owner (if there is one) is π-shaped, T-shaped, or tactical-only.
4. **What the client is currently doing** — by channel, with status (working / not / TBD).
5. **What they've already done that should be acknowledged** — past launches, PR moments, content, partnerships. Don't write a plan that ignores work they're proud of.
6. **Phase of SaaS growth** — $0–10K ARR / $10K–100K / $100K–1M / $1M+. Each phase has its own binding constraint.
7. **Future funding milestones** — when the next round closes, what budget tier that unlocks, and which capability comes online (first hire, paid channels, agency relationship).
8. **The marketing skills mapped to specific moves** — every move in the AARRR sections names the skill that executes it.
9. **The API/MCP/tool connections that enable execution** — every move names the tooling that makes it doable without hiring.

If you can't confirm any of these in INIT, list them in Section 13's "Open decisions" — never gloss over them. **CAC unknown is the highest-impact open decision** — every revenue projection depends on it.

## Common client-type variations

Plan structure stays consistent. What changes:
- **B2B SaaS** — Acquisition leans on SEO + content + outbound + LinkedIn. Activation = signup + product trial. Retention = product engagement + CSM motion. Referral = customer advocacy. Revenue = expansion / NRR.
- **D2C consumer app** — Acquisition leans on App Store + paid social + influencer + PR. Activation = onboarding + first session + paywall. Retention = lifecycle email + push. Referral = sharing mechanics. Revenue = subscription + upsell.
- **Hardware-led** — Acquisition leans on PR + retail + Amazon + Shopify SEO. Activation = unboxing + setup + first use. Retention = software companion + community. Referral = gifting + reviews. Revenue = blended LTV hardware + accessories + subscription.
- **Marketplace** — Activation has two sides (supply + demand). Retention is repeat transaction frequency. Revenue is take-rate × GMV.
- **Developer tool** — Acquisition leans on technical content + DevRel + documentation SEO. Activation = first build / first integration. Retention = depth of integration. Referral = team adoption.

Detail in `references/client-types.md`.

## Quality bar

What separates a good plan from a generic one:

**Good plan signals:**
- Every move names the AARRR stage it serves
- Every recommendation is anchored in real client data (their actual budget, their actual team, their actual current channels)
- The 90-day roadmap has owners, not just actions
- The funding-stage section explains what changes when the next round closes
- The ops stack section names specific skills + MCPs per move
- The idea bank shows what we're *not* doing and why (skipped ideas with rationale)
- The exec summary can stand alone — could be lifted into an investor update
- Open decisions are explicit, not glossed over

**Failure modes to avoid:**
- Listing tactics without sequencing
- Recommending things the team can't execute at current size
- Pretending paid budget exists before the round closes
- Glossing over uncomfortable metrics (e.g., churn) instead of naming them as open decisions
- Generic language ("build a community," "improve SEO") without specific moves
- Ignoring brand voice — every plan section must respect the client's voice rules
- Padding the plan with skills/ideas the client doesn't actually need
- Not acknowledging work the team has already done

## Output format

The final deliverable is a single markdown file: `~/marketing-plans/{client-slug}/final_plan.md`.

Headers (`## 1. Executive summary`, etc.) are H2 for clean Notion paste. Tables for any structured comparison (RACI, idea bank, ops stack). Status legend for the idea bank. Internal references to other sections use `§N` (e.g., "see §5 for Activation detail").

Length expectation: ~8,000–12,000 words for a comprehensive plan. Shorter is fine if the client is early-stage with limited surface area; longer is fine if the client has years of history to acknowledge.

## File layout per plan

```
~/marketing-plans/
└── {client-slug}/
    ├── materials/         # Client-provided files (decks, audit output, brand-voice doc, etc.)
    ├── research.md        # Research record written during INIT
    ├── progress.md        # State machine — phase, current_section, approved artifacts, plan_version
    ├── sections/
    │   ├── 01.md          # Each approved section saved as a canonical artifact
    │   └── ...            # Zero-padded so they sort in order
    └── final_plan.md      # Compiled deliverable (FINALIZE output)
```

The full schema for `progress.md` and the resumption decision tree live in `references/methodology.md` Steps 1.1.1 and 1.1.2.

## Related skills

- **`product-marketing`** — Run first. Captures positioning, ICP, voice in `.agents/product-marketing.md` so every section of the plan references the same foundation.
- **`marketing-ideas`** — Source of the 139 tactics in Section 12.
- **`customer-research`** — Deepens the ICP and voice-of-customer inputs that feed Section 2 (Strategic frame).
- **`onboarding`** — Deep work on Section 5 (Activation).
- **`emails`** — Deep work on Section 6 (Retention) + onboarding emails in Section 5.
- **`referrals`** — Deep work on Section 7 (Referral).
- **`pricing`** — Deep work on Section 8 (Revenue).
- **`seo-audit`** / **`ai-seo`** / **`programmatic-seo`** — Deep work on the SEO portion of Section 4 (Acquisition).
- **`ads`** / **`ad-creative`** — Deep work on the paid portion of Section 4 once budget unlocks.
- **`launch`** — Deep work on launch moments inside Section 4 / Section 9.

## Task-specific questions (used during INIT)

The full intake questionnaire lives in `references/methodology.md`. The most important questions:

1. **Funding state** — What round are you in? How much raised so far? Burn? Runway? Upcoming rounds and timing?
2. **Team** — Who are all the people who touch marketing? What does each own? Where are the gaps?
3. **Budget** — What's the current monthly marketing spend, broken down by paid acquisition, tools, retainers, headcount? What budget unlocks when the next round closes?
4. **Current channels** — What's working today? What's not? What have you not tried yet?
5. **Already done** — What past campaigns / launches / content / PR moments should this plan acknowledge?
6. **In-flight** — What's drafted but not shipped? What's blocking each item?
7. **Tooling stack** — What's wired? Customer.io / Mailchimp / Resend? Shopify / Stripe / App Store Connect? GA4 / Mixpanel / Amplitude? GitHub / Notion / Figma?
8. **Beta or GA?** — If product is in beta, what's the GA timeline? Throttling? What gates exist?
9. **The most important thing to fix this quarter** — founder's read.
10. **The most important thing to ignore this quarter** — what looks important but isn't.

## How exhaustive should the plan be?

Default to comprehensive. Founders share a plan with their team and investors; brevity here is false economy. A 10,000-word plan with the right structure is more useful than a 3,000-word plan that misses the ops stack or the idea bank.

That said: don't pad. Every section should be **dense, not bloated**. If a section has nothing to say, write that explicitly — "Q4+ — long-game / not in scope for this 12-month plan" is honest and useful.

## A note on tone

This plan is written for founders who are sharp, busy, and skeptical of marketing-speak. Write like a thoughtful colleague, not a deck-slide-writer. No jargon for jargon's sake. Direct claims, named tradeoffs, explicit assumptions. When unsure, name the open question rather than guessing.

The exec summary should be short enough to read in 60 seconds. The rest should reward deep reading.

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/aarrr-framework.md

# AARRR Framework — Primer for Plan Sequencing

AARRR (Dave McClure's "pirate metrics") is the spine of every plan produced by this skill. This doc is the primer + the decision rules for when each stage gets prioritized.

## The five stages

| Stage | Question | Common metrics |
|---|---|---|
| **A**cquisition | How do strangers become aware of us? | Visits, MQLs, signup-page sessions, app-store visits, CAC by channel |
| **A**ctivation | Once they try us, do they have an experience that converts? | Signup completion rate, time-to-value, % completing first key action, trial → paid rate |
| **R**etention | Do they stay and deepen? | DAU/WAU/MAU, week-1/4/12 retention, churn |
| **R**eferral | Do retained users bring more users? | Viral coefficient, NPS, ambassador attribution |
| **R**evenue | What do they pay, who pays, how does it compound? | ARPU, LTV, expansion revenue, ARR / MRR |

> **Signup boundary rule.** Signup *intent* (a stranger landing on the signup page) is Acquisition. Signup *completion* and everything after (first key action, trial-to-paid) is Activation. Apply this rule consistently across all docs and the plan template.

## Why AARRR for plan sequencing

Three reasons.

**1. Funnel-stage tagging forces prioritization.** Without AARRR, marketing plans become channel-organized ("here's the SEO plan, here's the social plan, here's the paid plan"). Channels can address multiple stages; tagging by stage instead asks the more useful question: *what stage of the funnel is the binding constraint right now?*

**2. Fix the leak before pouring water in.** The Activation/Retention question ("does the funnel convert at acceptable rates given exposure?") is usually higher leverage than the Acquisition question ("how do we get more exposure?"). AARRR sequencing surfaces this naturally.

**3. The Revenue / Referral conversation is honest.** Most marketing plans bury monetization under "growth" and treat referral as wishful thinking. AARRR forces explicit treatment of both.

## Brand and content — not a stage, cross-cutting

A common mistake: making "Brand" or "Content" the sixth bucket. They're not — they serve every stage.

- **Brand voice** governs every piece of copy across every stage
- **Content** feeds Acquisition (SEO, social), Activation (onboarding copy), Retention (email lifecycle), Referral (ambassador talking points), Revenue (pricing pages, sales material)

In the plan, brand/content shows up as the strategic frame (Section 2) and cross-cutting in Section 11's ops stack — never as its own AARRR section.

## Diagnosing the binding constraint — which AARRR stage is highest leverage?

For every client, one or two AARRR stages will be the binding constraint. The plan sequences moves there first.

**Decision rules:**

### If you don't have any users → start with Acquisition
- Pre-launch / day-0 / waitlist stage
- No funnel data exists
- Leverage = building the first 100 users

### If you have users but they bounce → start with Activation
- Signups happen but activation rate is low
- App Store conversion is poor
- Onboarding completion is broken
- Day 1 → paid rate is much lower than Day 30 → paid (means product converts given time but onboarding doesn't bridge to it)
- Leverage = bridging signup to first felt value

### If activation works but users churn → start with Retention
- Month 1 retention is below category norms
- Activated users stop using within 7–14 days
- LTV is short
- Leverage = lifecycle, deepening engagement, churn prevention

### If retention is strong but growth is slow → start with Referral / Revenue
- Retained users love the product but don't share
- Inbound referrals come in unstructured
- Pricing hasn't been pressure-tested
- ARPU is low for the value delivered
- Leverage = WOM mechanics + pricing optimization (these often cluster)

### If everything works at small scale → start with Acquisition (scaling)
- Funnel is healthy
- Question is just "more"
- This is the "post-fit" scaling problem

## Stage-by-stage strategic patterns

### Acquisition

**The diagnostic question:** Where is the gap between TAM-level awareness and current funnel volume? What channels are saturated by competitors vs. open?

**Common Acquisition moves:**
- SEO content strategy (organic compounding)
- Founder-led channels (LinkedIn, X, Substack for B2B; Instagram/TikTok for D2C)
- Paid acquisition (when budget unlocks)
- App Store / Play Store / marketplace listing optimization
- PR and credibility-anchor amplification
- Events (live, webinar, conference speaking)
- Partnerships (newsletter swaps, integration co-marketing, reseller / agency partners)
- Hardware / commerce surface (Shopify SEO + Amazon for hybrid businesses)
- B2B sales support (case studies, partner pages, vertical content)

**Sequencing principle:** Build the organic compound first (SEO + founder-led + content + PR amplification + ambassadors). Only layer paid on top of a working organic baseline. Premature paid amplifies what's broken.

### Activation

**The diagnostic question:** Where in the user's first session do they decide "this works for me" or "this doesn't"? What stops them from reaching that moment?

**Common Activation moves:**
- Bedrock fixes (broken gates, broken signup steps, broken paywall)
- Onboarding tests / rebuild (often the most leveraged single move)
- App Store listing rewrite (the threshold to the trial)
- Lifecycle Flow ship order (when to ship onboarding emails)
- Paywall structure + trial length
- Free → paid bridge (in-app upsells, soft paywalls)

**Sequencing principle:** Get to first felt value as fast as possible. Everything that adds friction between "user opens app" and "user has the experience that converts them" is a candidate to cut.

### Retention

**The diagnostic question:** Why do users churn? What would have made them stay? What's the "second moment of value" after the first one?

**Common Retention moves:**
- Lifecycle email flows: onboarding, lapsed user re-engagement, post-purchase, win-back
- Subscription / preference centers
- Churn reconciliation (often metric definitions don't match across surfaces)
- Hardware → software activation paths (for hybrid businesses)
- Annual plan defaults / pricing structure (cross-cuts Revenue)
- Support as marketing (high-touch moments that drive stories)
- Community + practitioner networks

**Sequencing principle:** Ship lifecycle flows in the order their content is most stable. Hardware post-purchase flows ship first (they don't reference in-app screens that might change). Onboarding emails ship last (they reference UI that might change). Win-back is a quarterly campaign, not a one-time flow.

### Referral

**The diagnostic question:** Is there inbound referral interest that isn't being captured? What's the share-after-value moment that's natural to the product?

**Common Referral moves:**
- Ambassador / affiliate program (start with inbound interest, not cold recruitment)
- Share-after-value moments built into the product (reflection prompts, milestone celebrations)
- Founder amplification (founder as referrer-zero)
- Long-game expert / Guides / certified-host networks (for category-creating businesses)
- Gifting flows (consumer / hardware)
- Two-sided referrals (reward both referrer and referred)

**Sequencing principle:** Lead with whoever is already raising their hand. If there are 5 inbound ambassadors, launch with those 5 — don't wait for a "complete program." Iterate based on what they tell you.

### Revenue

**The diagnostic question:** Is the company underpricing? Underpackaging? Missing an upsell? What's the "right" price discipline given LTV and brand voice?

**Common Revenue moves:**
- Pricing audit (what's actually charged today vs. listed?)
- Annual plan defaults
- Hardware → software bundling formalization
- Storefront / commerce page optimization
- B2B case studies + sales material
- Long-term value pool flags (data, expansion, enterprise) — flagged not executed

**Sequencing principle:** Run the pricing audit before testing changes. Surprisingly often, the "implied" pricing on the dashboard doesn't match the listed price — discounts, trials, or plan mix distorts the read. Surface the ground truth first.

## How to assign a move to a stage

Some moves clearly belong to one stage. Others span. The rule:

**Assign to the stage where the move's primary measurable impact lands.**

Examples:
- "Rewrite App Store listing in voice" — spans Acquisition (organic discovery) and Activation (threshold to trial). Primary impact = Activation (trial conversion rate). Assign to Activation, mention crossover.
- "Eye mask Shopify page rewrite" — spans Acquisition (organic search for sleep mask) and Revenue (sale conversion). Primary impact = Revenue (transaction). Assign to Revenue, mention crossover.
- "Alex's LinkedIn cadence" — Acquisition (top of funnel for D2C subscribers).
- "Customer.io Flow 6 (eye mask post-purchase)" — Retention (deepens hardware buyer engagement) with crossover to Activation (hardware → app premium activation path).

When in doubt: where would removing this move hurt the most? Assign there.

## When the AARRR breakdown isn't equal

For most clients, the plan won't have equal volume across stages. That's fine — and worth surfacing as a diagnostic.

- **Heavy Acquisition section** = client has product-market fit but top-of-funnel is the bottleneck. Common for early-stage with strong retention metrics.
- **Heavy Activation section** = client has traffic but conversion is broken. Often beta-stage products.
- **Heavy Retention section** = client has churn problem. Often mid-stage products that scaled past PMF without lifecycle infrastructure.
- **Heavy Referral section** = client has loyalty but no WOM mechanics. Often consumer products with passionate users.
- **Heavy Revenue section** = client is underpricing or missing monetization layers. Common for tools transitioning from free to paid.

If a plan ends up evenly distributed across all five stages, the diagnostic was probably weak — re-examine the funnel state intake to find where the binding constraint is.

## A note on the order of presentation

Always present AARRR in order (Acquisition → Activation → Retention → Referral → Revenue) regardless of priority order.

This is for the reader's mental model. Founders expect the funnel to flow top-to-bottom. If Retention is the most-leveraged stage but you lead with Retention, the reader has to context-switch.

To signal priority, use the executive summary (Section 1) — name the biggest bets there. The AARRR breakdown then walks the funnel in order, with the most leverage-positive section being the longest and most-detailed.

### references/budget-planning.md

# Budget Planning — Scientific Methods for Setting the Marketing Budget

The problem with most SaaS marketing budgets is that they're pulled out of thin air — a number that hopefully doesn't constrain growth too much, but doesn't anchor in customer-acquisition economics either. The result: when someone asks "why this number?" there's no answer.

Two scientific methods solve this. Use one (not both) in Section 8 (Revenue) and Section 10 (12-month outlook) of every plan.

Excerpted and adapted from *Founding Marketing* by Corey Haines.

## Method 1 — Revenue-Based (5–40% of annual revenue)

**Direction:** budget → revenue goal.

You start with what the company can comfortably spend on marketing, then forecast what revenue that spend can plausibly generate.

### The ranges

| Posture | % of ARR | When to use |
|---|---|---|
| **Conservative (profit-preserving)** | 5% | Established business focused on profit distribution; bootstrapped; founder-paid customer base |
| **Standard growth** | 15–25% | Most healthy SaaS in the seed-to-Series-A range |
| **Aggressive growth (deploying raised capital)** | up to 40% | Recently funded round, mandate to deploy fast, board accepts burn |

For reference: public SaaS companies routinely report sales-and-marketing spend between 20% and 55% of revenue (Zoom historically ran between 20% and 55% across years).

### The math (Conservative example)

Business at $1M ARR, 5% allocation:

- Annual marketing budget: **$50,000**
- Blended CAC: $100 → can acquire **500 new customers**
- ARPC: $50/mo → adds **$300K** to ARR
- Account for 15% annual churn → 85% × $300K = **+$255K net new ARR**
- End-of-year goal: **$1.255M ARR**

### The math (Aggressive example)

Business at $1M ARR, 40% allocation:

- Annual marketing budget: **$400,000**
- Blended CAC: $100 → can acquire **4,000 new customers**
- ARPC: $50/mo → adds **$2.4M** to ARR
- End-of-year goal: **$3.4M ARR**

### Two keys to making this method work

1. **Know your blended CAC** (see "Calculating CAC" below)
2. **Match the allocation percentage to your actual ambition.** A founder running 5% allocation while telling the board they expect to triple revenue is showing two incompatible signals.

## Method 2 — Goal-Based (reverse-engineered from the revenue target)

**Direction:** revenue goal → budget.

You start with the revenue goal and work backward through the unit economics to derive the budget required to hit it. Best for:

- Companies just starting up (no historical CAC baseline yet, working from first principles)
- Companies anticipating outside capital (need to defend the ask)
- Companies using revenue-based financing (Pipe, Capchase, Founderpath)

### The formula

```
Marketing budget = [(New ARR / (ARPC × 12)) × CAC] / annual retention rate
```

### Worked example: $1M ARR → $2M ARR

Step 1 — How much new ARR per customer?
ARPC × 12 = $50 × 12 = **$600 ARR per new customer**

Step 2 — How many new customers do we need?
$1,000,000 / $600 = **1,667 new customers**

Step 3 — What's the raw acquisition cost?
1,667 × $100 CAC = **$166,700**

Step 4 — Account for churn (15% annual = 85% retention)
$166,700 / 0.85 = **$196,118** (round to **$200K**)

When someone asks how you got to the budget, walk them through the four steps. It's defensible.

### Why this formula and not something simpler

The four steps each correspond to a real economic reality:
- Step 1 converts MRR-language into the ARR-language a board talks in
- Step 2 names the customer count, which is what the funnel actually has to deliver
- Step 3 anchors the budget in the cost of acquisition
- Step 4 acknowledges that churned customers don't count toward net new ARR, so the budget needs to cover the gap

### Required buffer

**Always add 10–20% as "experimental budget"** on top of the formula output. CAC is the main dependency; if CAC comes in 50% higher than estimated, the cascading effect is missing the revenue goal. It is much cheaper to overestimate CAC than to underestimate it.

The experimental budget also funds the experiments that find your next channel before your current one plateaus (see `growth-patterns.md` — channel S-curves).

## The VC growth path (3-3-2-2-2 rule)

Once a company has crossed $1M ARR and taken a Series A, the implicit benchmark VCs expect is:

| Year | ARR multiple | Cumulative ARR (from $1M start) |
|---|---|---|
| Year 0 | — | $1M |
| Year +1 | 3× | $3M |
| Year +2 | 3× | $9M |
| Year +3 | 2× | $18M |
| Year +4 | 2× | $36M |
| Year +5 | 2× | $72M |
| Year +6 | 2× | $144M |
| Year +7 | 2× | $288M |

That's the 3-3-2-2-2 rule. Useful when:

- The plan needs to map 12-month and 36-month milestones to VC expectations
- The founder is mid-raise and the board needs to see a plausible path to the next round
- Section 10 (12-month outlook) needs anchoring against an industry benchmark, not just internal ambition

Most companies miss it. That's fine. Knowing the benchmark gives the team a defensible reason to either match it or explicitly choose not to.

## Calculating CAC (blended, not paid-only)

If there's no historical CAC, use a baseline: **one year of revenue from the smallest paid plan.** Deploy the budget, capture actual CAC data, replace the baseline with the measured number for the next planning cycle.

For an established CAC calculation, **CAC must be blended.** Include:

- Marketing salaries (full loaded cost, not just base)
- Advertising spend
- Marketing tech stack costs
- Content production costs (writers, designers, video editors)
- Agency / contractor retainers
- SDR / BDR salaries if doing outbound
- Tools (CRM, marketing automation, analytics)

Then divide by the number of new customers acquired in the period. That blended number is the one to use in either budgeting method.

The mistake to avoid: calculating CAC from paid ad spend alone. A company that "doesn't run ads" still has a CAC — it's just hidden in the content team, the founder's time, the SEO contractor, the conference booth.

## The reality check on forecasting

This whole framework derives a budget and a revenue goal — not a 12-month month-by-month forecast accurate to the dollar.

**Unless the company is publicly traded, all forecasts are educated guesses.** No startup under $100M ARR reliably hits forecasts to the month. The honest framing for the plan:

- The annual goal is a defensible direction-of-travel
- The budget is the resource commitment that makes the goal plausible
- The 90-day roadmap (Section 9) is what's actionable now
- Month-to-month variance is expected; quarterly review is when the plan adjusts

What's actionable: how to deploy the budget, what concrete moves to execute, what to adjust when real data comes in.

What's not actionable: trying to forecast traffic, pipeline, retention curves, conversion rates, and channel mix all down to the decimal point and expecting that forecast to hold. Founders who over-engineer the forecast tend to spend the plan period explaining variance instead of executing.

**Rule for the plan:** the budget number is honest. The annual goal is honest. The month-by-month projection is illustrative.

## How this flows into the plan

| Section | What to include |
|---|---|
| **3 (Current state)** | Current monthly marketing spend broken down by line (paid, tools, content, headcount, retainers). Compute current %-of-ARR allocation. |
| **8 (Revenue)** | The unit-economics table (CAC, ARPC, churn) that feeds whichever budget method you're using. |
| **10 (12-month outlook)** | Apply Method 1 or Method 2 to derive the 12-month budget and the resulting revenue goal. Anchor against the 3-3-2-2-2 rule if Series A+ and VC-backed. |
| **11 (Ops stack)** | Show the budget allocation across the AARRR stages — what % to Acquisition, Activation, etc. The ops-stack mapping informs which line items grow when the next funding tier unlocks. |
| **13 (Open decisions)** | If CAC is unknown or contested, flag it as the highest-impact open decision — every other number depends on it. |

## When to choose which method

- **Method 1 (Revenue-Based)** when the company has historical CAC data, a profit/burn posture, and the question is "given our posture, what's a plausible goal."
- **Method 2 (Goal-Based)** when the company has a specific goal (board mandate, VC milestone, fundraise target) and the question is "what budget do we need to hit it."

For most plans in the seed-to-Series-A range, Method 2 is more useful — it forces the conversation about whether the goal is funded.

### references/client-types.md

# Client Types — Variations by Business Model

The 13-section plan structure stays consistent across client types. What changes is the **content emphasis** within each section. This doc names the dominant patterns by client archetype.

## Archetype 1 — B2B SaaS

### Core characteristics
- Subscription revenue
- Often higher ACV ($1K–$100K+ per year)
- Sales-assisted or self-serve depending on tier
- Buyer often different from user (champion vs. end-user)

### AARRR emphasis

**Acquisition heavy:**
- SEO is the dominant top-of-funnel motion (people search for solutions)
- Content marketing (blog, knowledge base, comparison pages) drives MQLs
- LinkedIn for both organic founder presence and paid
- Outbound (cold email + LinkedIn) often complements inbound
- Events (conferences, webinars) for high-ACV products

**Activation:**
- Signup → trial → first key action (PLG products)
- Trial → demo → POC (sales-led products)
- Empty states matter — guide users to first value action

**Retention:**
- Product engagement metrics (DAU, feature adoption)
- Customer success motion (CSM team for higher ACV)
- Lifecycle emails focused on feature discovery, value moments

**Referral:**
- Customer advocacy programs
- Partner / integration co-marketing
- G2 / Capterra reviews
- Champion-to-buyer expansion

**Revenue:**
- Expansion / NRR is often the biggest growth lever
- Tier upgrades, seat expansion, usage-based add-ons

### Skills emphasis
- `cold-email`, `programmatic-seo`, `competitors`, `seo-audit`, `ai-seo`
- `ads` weighted toward LinkedIn + Google
- `emails` for trial nurture + lifecycle
- `pricing` for tier optimization

### Tier-1 budget priority
- SEO + content > everything else
- Founder-led LinkedIn channel
- Customer.io / Mailchimp for nurture
- HARO + investor backchannel for PR

---

## Archetype 2 — D2C Consumer App (Subscription)

### Core characteristics
- Lower ACV ($5–$30/mo typically)
- High volume, lower margin per user
- App Store / Play Store as the primary acquisition surface
- Lifecycle email + push for retention
- Often paid-acquisition-driven once budget unlocks

### AARRR emphasis

**Acquisition:**
- App Store Optimization (ASO) is the highest-leverage non-site asset
- Paid social (Meta, TikTok) often dominant once budget exists
- Apple Search Ads for high-intent App Store traffic
- Influencer + content creators
- PR + endorsements

**Activation:**
- Onboarding is the dominant activation surface
- Time-to-value must be minutes, not hours
- Paywall structure + trial length critical

**Retention:**
- Lifecycle email + push
- In-app reminders (carefully — overuse = churn)
- Subscription preference center
- Win-back campaigns

**Referral:**
- Built-in sharing (share-a-month flow)
- Two-sided referrals
- Influencer / creator ambassadors

**Revenue:**
- Annual plan default is the biggest single move (compresses MRR but improves LTV)
- Tier optimization (Free → Premium → Premium+)
- In-app upsells

### Skills emphasis
- `onboarding`, `paywalls`, `emails`
- `ads`, `ad-creative` (heavy creative iteration)
- `referrals`
- `pricing` for annual default + tier consolidation

### Tier-1 budget priority
- ASO first (highest organic leverage)
- Onboarding rebuild
- Lifecycle email shipping
- Founder-led social if founder is on-camera

---

## Archetype 3 — Hybrid Hardware + Software

### Core characteristics
- Physical product + software companion (e.g., Quietude's eye mask + app)
- Hardware as a distribution wedge (lower price, easier first purchase)
- Software as the LTV (recurring revenue)
- Blended CAC across both surfaces

### AARRR emphasis

**Acquisition:**
- Shopify storefront SEO (hardware product pages target consumer search)
- Amazon listing (high-discovery, takes margin)
- PR amplification (hardware is photogenic — high-profile influencer endorsements move volume)
- Paid social for hardware (Meta + Instagram, eye-catching creative)

**Activation:**
- Two activations to track: hardware unboxing experience + software signup
- Hardware → software activation flow is the bridge
- Concierge setup for high-value hardware buyers

**Retention:**
- Hardware post-purchase lifecycle (different from app onboarding)
- Software companion drives stickiness
- Community / practitioner network around hardware

**Referral:**
- Hardware gifting flows (high WOM for physical products)
- Eye-catching hardware drives organic social sharing
- Reviews on Shopify + Amazon

**Revenue:**
- Blended LTV math is critical (hardware margin + software recurring)
- Bundle strategy (hardware buy → free Premium for X months)
- Annual plan default for software

### Skills emphasis
- `seo-audit` for Shopify product pages
- `emails` for both hardware post-purchase and software lifecycle
- `referrals` with gifting layer
- `pricing` for blended-bundle math
- `ads` with creative-heavy Meta presence

### Tier-1 budget priority
- Shopify product page optimization
- Hardware post-purchase lifecycle ship
- Bundle strategy formalization
- Hardware → app activation audit

---

## Archetype 4 — Marketplace

### Core characteristics
- Two-sided product (supply + demand)
- Network effects matter
- Liquidity is the critical early metric
- Take-rate × GMV is the revenue model

### AARRR emphasis

**Acquisition:**
- Two funnels — supply and demand
- Supply often acquired through outbound / partnership / cold email
- Demand often acquired through SEO / paid / content
- City-by-city programmatic SEO common

**Activation:**
- Supply activation: first listing posted, first response sent
- Demand activation: first purchase / first match / first transaction
- Both sides need their own onboarding

**Retention:**
- Repeat transaction frequency
- Supply utilization (% of listings active)
- Demand habit (DAU / MAU)

**Referral:**
- Supply → supply (refer other providers)
- Demand → demand (refer other buyers)
- Cross-side referrals are weaker

**Revenue:**
- Take-rate optimization
- Premium tier (better matching, lower fees)
- Lead-gen vs. transaction-fee monetization

### Skills emphasis
- `programmatic-seo` for city pages, vertical pages
- `cold-email` for supply-side recruitment
- `referrals` for both sides
- `pricing` for take-rate decisions

### Tier-1 budget priority
- Programmatic SEO build for one side
- Cold outbound to seed supply (or demand, whichever is bottleneck)
- Lifecycle email for both sides

---

## Archetype 5 — Developer Tool / Open Source

### Core characteristics
- Technical buyer (developer or eng leader)
- High bar for content quality (developers are skeptical)
- DevRel matters more than traditional marketing
- Open source layer often funnel into commercial product

### AARRR emphasis

**Acquisition:**
- Technical content + docs SEO
- DevRel (conferences, talks, community)
- GitHub presence + npm/pip/etc. discovery
- Hacker News + Reddit + dev Twitter

**Activation:**
- First build / first integration is the activation event
- Time-to-Hello-World matters
- Documentation = onboarding for dev tools

**Retention:**
- Depth of integration (using more of the product)
- Team adoption (one user → entire org)
- Active project count

**Referral:**
- Star count on GitHub (semi-organic)
- Recommendation in technical forums
- Conference talks mentioning the tool

**Revenue:**
- Free → paid conversion when usage exceeds limits
- Team plans, enterprise tiers
- Support / SLA upsells

### Skills emphasis
- `programmatic-seo` for docs
- Less emphasis on traditional `ads`
- Heavy `content-strategy` + technical content
- `cold-email` to engineering leads at target companies

### Tier-1 budget priority
- Docs + technical content production
- DevRel (founder doing talks)
- GitHub presence
- HN / Reddit / dev community

---

## Archetype 6 — Deep-Tech / Scientific / Clinical

### Core characteristics
- Long sales cycles
- Heavy credibility burden (must prove the science)
- Highly informed buyers (academics, clinicians, researchers)
- Often regulatory considerations

### AARRR emphasis

**Acquisition:**
- Academic publishing + peer-reviewed studies
- Conference speaking (academic + industry)
- Investor / advisor introductions
- PR via credibility hooks

**Activation:**
- Pilot programs / proof-of-concepts
- Concierge setup with high-touch onboarding
- Educational webinars / training

**Retention:**
- Customer success heavily
- Co-publication with customers
- Community of practice

**Referral:**
- Academic / clinical references
- Conference panel features
- Case studies with named institutions

**Revenue:**
- Pilot → paid expansion
- Institutional contracts (multi-seat / multi-year)
- Compliance / certification upsells

### Skills emphasis
- Light traditional marketing
- Heavy `product-marketing`, `sales-enablement`, `pricing`
- `cold-email` to specific researchers / practitioners
- PR + investor marketing

### Tier-1 budget priority
- Academic outreach + conference speaking
- Investor backchannel for institutional warm intros
- Pilot deployment with key customers
- Case study + scientific publication

---

## Archetype 7 — Commerce / DTC (non-subscription)

### Core characteristics
- Physical or digital products sold transactionally
- Average Order Value matters
- Repeat purchase rate is the key retention metric

### AARRR emphasis

**Acquisition:**
- Paid social (Meta, TikTok) often dominant
- Shopify SEO for product pages
- Amazon listings
- Influencer + creator partnerships

**Activation:**
- First purchase is the activation event
- Cart abandonment recovery
- Trust signals on checkout (reviews, returns, shipping)

**Retention:**
- Post-purchase lifecycle
- Loyalty programs
- Email + SMS for repeat purchase

**Referral:**
- Gifting flows
- Refer-a-friend programs
- Reviews + UGC

**Revenue:**
- AOV optimization (bundles, upsells)
- Customer LTV optimization (repeat purchase frequency)
- Subscription option for repeat purchases

### Skills emphasis
- `ads` + `ad-creative` (heavy weight)
- `emails` for post-purchase + abandoned cart
- `referrals` with gifting
- `pricing` for bundles + subscription option

### Tier-1 budget priority
- Shopify storefront optimization
- Email lifecycle ship
- Influencer / UGC seeding
- Paid social testing (if minimal budget exists)

---

## How to use this doc when drafting a plan

When you start drafting Sections 4–8 (AARRR), identify the client's archetype (or hybrid if applicable) and lean into the patterns above.

**Hybrid cases are common.** Quietude is "Hybrid hardware + software" with significant overlap to "Deep-tech / scientific / clinical" (because of the peer-reviewed study + clinical positioning). The plan blends emphases from both archetypes.

When in doubt, lead with the archetype that best fits the *primary monetization model*. Quietude's primary monetization is software subscription (with hardware as the wedge), so the D2C consumer app + hardware-hybrid patterns dominate, with deep-tech credibility moves layered in.

## When the client doesn't fit cleanly

Some clients defy archetype:
- **Content / media businesses** — neither SaaS nor commerce; ad revenue or subscription model
- **Social networks** — own category, network effects dominate
- **Real estate / events** — physical + service model

For these, identify the closest archetype and adjust. Don't force-fit — name the deviation in the plan's Strategic Frame.

### references/current-state-rubric.md

# Current State Rubric — 17-Section Scoring Lens

This 17-section rubric is the source of truth for Section 3 ("Current State") of every marketing plan. Score each section 0–5 from available materials, then write a 2–4 sentence "shape interpretation" that names where strengths and gaps cluster.

## How to score

**From rich materials.** When the team has shared decks, prior content audits, a brand voice doc, kickoff transcript, app store and analytics snapshots — score each section from those artifacts. Mark "scored from materials" in the section heading so the team can push back where they have better data.

**From a separately scored audit.** If the team has already run a scored current-state assessment (in any format), ingest those scores directly. Don't redo the work — note the date the rubric was scored and flag any sections where material has shifted since.

Either way, the output is the same: a 17-row scored table, a total out of 85, and a shape paragraph.

## The 17 sections (scored 0–5 each)

### 1. Positioning
**What's scored:** Clarity of category claim, differentiation, alignment across surfaces (homepage, app store, pitch deck, founder messaging).

**Score guide:**
- 0 = No positioning anywhere
- 2 = Inconsistent across surfaces; team can't articulate it on demand
- 4 = Clear, original, mostly consistent; minor surface gaps
- 5 = Distinctive, category-defining, every surface aligned

**Maps to AARRR:** Cross-cutting — feeds every stage.

### 2. Customer research
**What's scored:** Depth and recency of customer research, ICP clarity, voice-of-customer capture.

**Score guide:**
- 0 = No formal research, only founder intuition
- 2 = Some research but stale or one-off
- 4 = Active research practice, customer language captured
- 5 = Continuous research, customer language flows into copy / product / messaging

**Maps to AARRR:** Cross-cutting — feeds especially Acquisition (channel choice) and Activation (onboarding voice).

### 3. Homepage
**What's scored:** Headline clarity, voice alignment, conversion architecture, mobile experience.

**Score guide:**
- 0 = Generic / broken / off-brand
- 2 = Functional but underperforming; voice mostly absent
- 4 = Clear, voice-aligned, converting; minor optimization opportunities
- 5 = Distinctive, converts strongly, fully voice-aligned

**Maps to AARRR:** Acquisition + Activation.

### 4. Sales / product pages
**What's scored:** Existence and quality of dedicated product / pricing / feature pages. Are SKUs documented? Is pricing scannable? Are upsells visible?

**Score guide:**
- 0 = No dedicated pages
- 2 = Pages exist but are stale or off-voice
- 4 = Quality pages for primary products; gaps on secondary
- 5 = Every product, tier, and upsell has a high-converting page

**Maps to AARRR:** Acquisition + Revenue.

### 5. Conversion pages
**What's scored:** Landing pages for specific campaigns, channels, or use cases. `/partner`, `/science`, `/ambassadors`, `/eye-mask` types of pages.

**Score guide:**
- 0 = No conversion pages
- 2 = One or two exist; rest of needed pages missing
- 4 = Most needed conversion pages exist; quality is good
- 5 = Full conversion page library, each high-converting

**Maps to AARRR:** Acquisition + Activation.

### 6. Competitor comparison
**What's scored:** Existence of "vs. {competitor}" pages, comparison content. Does the brand acknowledge alternatives, or pretend they don't exist?

**Score guide:**
- 0 = Nothing — actively avoiding competitor mentions
- 2 = Some content exists but is weak or hidden
- 4 = Solid comparison pages for top 2–3 competitors
- 5 = Comprehensive comparison library; SEO-targeted; high-converting

**Maps to AARRR:** Acquisition (consideration-stage SEO + sales enablement).

### 7. Resources / content
**What's scored:** Blog, knowledge base, science page, whitepapers, research, founder essays, podcast.

**Score guide:**
- 0 = No content surface
- 2 = Blog exists but is stale or thin
- 4 = Active content production; multiple formats
- 5 = Content is a moat — proprietary research, named pillars, daily volume

**Maps to AARRR:** Acquisition.

### 8. Onboarding
**What's scored:** New user onboarding (in-app + email). Time-to-value, completion rate, brand-voice alignment.

**Score guide:**
- 0 = No onboarding flow
- 2 = Onboarding exists but is broken, off-voice, or underperforming
- 4 = Solid onboarding; clear bottlenecks identified
- 5 = Tested, optimized, on-brand; activation rate at category top quartile

**Maps to AARRR:** Activation.

### 9. Email lifecycle
**What's scored:** Existence and quality of lifecycle email programs. Welcome / onboarding / post-purchase / lapsed / win-back.

**Score guide:**
- 0 = No lifecycle email
- 2 = Some flows exist but drafted not live, or live but stale
- 4 = Core flows live and performing; gaps on secondary flows
- 5 = Full lifecycle live, segmented, performing above category benchmarks

**Maps to AARRR:** Retention (+ Activation for onboarding emails).

### 10. Sales material
**What's scored:** Sales decks, one-pagers, demos, case studies, pricing sheets. (For B2B / hybrid companies — for pure D2C, this can be marked N/A or scored low without implication.)

**Score guide:**
- 0 = No sales material
- 2 = Founder uses a deck but other material is thin
- 4 = Solid sales kit; reps can self-serve content
- 5 = Comprehensive material; updated quarterly; objection-handling library exists

**Maps to AARRR:** Acquisition + Revenue (B2B).

### 11. Messaging
**What's scored:** Voice, tone, vocabulary, message hierarchy across surfaces. Is the brand voice documented, consistent, distinctive?

**Score guide:**
- 0 = No voice documented; surfaces inconsistent
- 2 = Voice exists in founder's head but isn't operationalized
- 4 = Documented voice; mostly consistent across surfaces
- 5 = Distinctive voice; documented; every surface respects it; voice is a moat

**Maps to AARRR:** Cross-cutting.

### 12. Pricing
**What's scored:** Pricing structure clarity, packaging logic, recent pressure-testing, listed vs. effective price reconciliation.

**Score guide:**
- 0 = Pricing not pressure-tested in over a year; unclear structure
- 2 = Listed pricing exists but plan mix / discounting muddles the read
- 4 = Clear pricing; recent tests; LTV math known
- 5 = Pricing tested quarterly; packaging optimized; expansion levers known

**Maps to AARRR:** Revenue.

### 13. CRO (conversion rate optimization)
**What's scored:** Test cadence, instrumentation, A/B history, statistical rigor.

**Score guide:**
- 0 = No tests run; no instrumentation
- 2 = Some ad-hoc tests; no statistical rigor
- 4 = Regular test cadence; some wins
- 5 = Continuous testing program; experimentation culture; documented wins

**Maps to AARRR:** Cross-cutting (most impactful at Activation + Revenue).

### 14. GTM launches
**What's scored:** Quality of past launch executions. Product launches, feature launches, campaign launches.

**Score guide:**
- 0 = No structured launches; "soft launches" only
- 2 = Some launches but uneven execution
- 4 = Solid recent launches; playbook exists
- 5 = Repeatable launch motion; Product Hunt #1s; press coverage on demand

**Maps to AARRR:** Acquisition + Activation.

### 15. Ads (paid)
**What's scored:** Paid acquisition state. Active campaigns, channels, CAC tracking, creative quality.

**Score guide:**
- 0 = No paid acquisition
- 2 = Some paid but unstructured / wasteful
- 4 = Paid is firing across 2–3 channels with positive unit economics
- 5 = Sophisticated paid stack; CAC/LTV understood; creative iterated weekly

**Maps to AARRR:** Acquisition.

**Note:** For pre-seed clients with no paid budget, score this 0 *without* treating it as a weakness — it reflects the funding stage, not a marketing failure.

### 16. SEO
**What's scored:** Organic search performance. Domain rating, ranking keywords, organic traffic, content cluster strategy.

**Score guide:**
- 0 = No SEO; new domain or zero-authority
- 2 = Some content but no strategy; ranks for brand only
- 4 = Established content clusters; growing organic traffic; DR 25+
- 5 = SEO is a moat; DR 40+; thousand+ ranking keywords; consistent content production

**Maps to AARRR:** Acquisition.

### 17. Internationalization
**What's scored:** Geographic expansion, language localization, region-specific pricing.

**Score guide:**
- 0 = US/EN only; no international consideration
- 2 = International users exist but aren't served (one language, one currency)
- 4 = Multi-language, region-specific pricing, GTM playbook for new markets
- 5 = International is a strength; multi-region revenue; localized GTM

**Maps to AARRR:** Acquisition.

**Note:** For most early-stage companies, internationalization scores 0–1 and that's appropriate. Don't penalize early-stage companies for not having international playbooks yet.

## How to compute the total + read the shape

**Total = sum of all 17 scores. Out of 85.**

The total matters less than the *shape*. After the scoring table, write a 2–4 sentence "shape interpretation":

> *"High in {strong sections}, low in {weak sections}. That shape is the gap the rest of the plan closes — Sections X (AARRR stage) is the longest because that's where the gap is widest."*

## Common shapes

### "Strong voice / messaging, weak distribution"
- High: Positioning (#1), Customer research (#2), Messaging (#11)
- Low: SEO (#16), Ads (#15), GTM launches (#14)
- Translation: The founder is a strong storyteller but distribution hasn't caught up. Plan emphasizes Acquisition + paid layer prep.

### "Strong acquisition, weak conversion"
- High: SEO (#16), Resources (#7), Ads (#15)
- Low: Homepage (#3), Onboarding (#8), Conversion pages (#5), Pricing (#12)
- Translation: Traffic comes in but doesn't convert. Plan emphasizes Activation + Revenue.

### "Strong conversion, weak retention"
- High: Onboarding (#8), Homepage (#3), Pricing (#12)
- Low: Email lifecycle (#9), CRO (#13)
- Translation: Users sign up and pay but churn. Plan emphasizes Retention.

### "Strong product, weak everything-else"
- High: only Positioning (#1) and Customer research (#2) — the founder knows the customer
- Low: everything operational
- Translation: Pre-marketing stage. Plan is foundation-heavy. First quarter is bedrock fixes.

### "Strong recent revenue, weak compounding"
- High: Ads (#15), Sales material (#10), Pricing (#12)
- Low: SEO (#16), Resources (#7), Referral mechanics
- Translation: Performance marketing carries the business. Plan emphasizes building compounding channels before paid scales further.

## When scores are subjective

Some sections are easier to score from outside than others. Subjectivity tier:

- **Objective (data-driven):** SEO (#16), Ads (#15), Email lifecycle (#9), Onboarding (#8) — backed by analytics
- **Semi-objective:** Pricing (#12), CRO (#13), Conversion pages (#5), Sales material (#10) — visible artifacts to evaluate
- **Subjective (judgment call):** Positioning (#1), Messaging (#11), Customer research (#2), Resources (#7) — interpretive

For subjective sections, write the rationale into the "Note" column so the team can push back if they disagree.

## When a prior scored audit exists

If the team already has scored output from any current-state assessment, ingest those scores directly — don't redo the work. Treat that prior scoring as the ground truth for sections it covers.

If the prior scoring was done weeks ago and material has shifted since (new shipped flows, new content live, repositioning, etc.), note "scored on YYYY-MM-DD; material has shifted since" and update any specific scores you have current evidence for.

### references/funding-stage-unlocks.md

# Funding-Stage Capability Unlocks

Every marketing plan must include explicit "what changes when funding closes / when budget unlocks" reasoning. This makes the plan investor-friendly and operationally honest.

This doc defines the standard tiers. Use them as anchors, adjust for client category and unit economics.

**Related docs:**
- `budget-planning.md` — two scientific methods for setting the actual budget number (Revenue-Based 5–40%, or Goal-Based reverse-engineered from the revenue target), CAC calculation, experimental buffer
- `growth-patterns.md` — the real shape of SaaS growth by phase ($0–10K / $10K–100K / $100K–1M+), linear vs step-function, S-curve layering
- `team-and-agency-model.md` — what each tier means for team composition, the first marketing hire, and the in-house vs outsource ratio

## Why funding stage matters in a marketing plan

Most marketing plans are written as if budget is unconstrained. That's a failure mode for early-stage clients — it produces aspirational lists rather than executable roadmaps.

The fix: tie every recommendation to a budget tier. The plan stays honest about what's executable today, and the team / investors see explicitly what each round of capital unlocks.

This also helps the founder mid-raise: showing what the round buys is investor-narrative material.

## Standard tiers

### Tier 1 — Pre-seed / bootstrapped

**Budget profile:**
- Paid acquisition: $0
- Tooling stack: ~$500–2,000/mo (Customer.io / similar, GA4 free, Stripe fees, Notion, GitHub, basic SaaS)
- Retainers / fCMO: variable (fractional only)
- Headcount: founders + maybe 1–2 multipurpose hires

**Marketing capability:**
- Organic only — SEO, content, App Store organic, founder-led social, events, WOM, ambassador (if inbound exists)
- Limited PR (founder-led pitches, HARO responses)
- No paid layer

**Channels live:** Organic SEO, content, App Store, LinkedIn / X / founder-led social, events, WOM, ambassador

**What a fCMO does:** Strategy + lifecycle + content + SEO + onboarding + community + ambassador. Hands-on with skill library + MCPs doing the operational lift.

**Hires unlocked:** None. The plan must execute with current team + agentic stack.

### Tier 2 — Seed close

**Budget profile:**
- Paid acquisition: $5–15K/mo test budget
- Tooling stack: $1,000–3,000/mo (paid ad accounts, Mixpanel / Amplitude if needed, additional SaaS)
- Retainers / fCMO: continued
- Headcount: + first dedicated marketing hire

**Marketing capability:**
- Above + paid acquisition pilot (Apple Search Ads, Meta, LinkedIn)
- Begin PR push with the funding announcement
- First Product Hunt / GA-style launch

**Channels live:** All Tier 1 + paid acquisition (small) + active PR

**Hires unlocked:**
- Lifecycle + content marketing manager (one person doing both, or split)
- OR dedicated growth / performance marketing manager (if heavy paid focus)

**fCMO shifts:** From hands-on to strategy + ops oversight. Hires the dedicated marketer. Sets up the channel playbooks before paid scales.

### Tier 3 — Seed deployment

**Budget profile:**
- Paid acquisition: $20–50K/mo
- Tooling stack: $2,000–5,000/mo
- Retainers / fCMO: continued
- Headcount: + designer (potentially fractional)

**Marketing capability:**
- Paid scaling across 2–3 channels
- Brand-aligned creative production (designer enables velocity)
- Lifecycle programs fully live across all flows
- First true content production cadence (weekly cadence sustainable)

**Channels live:** All previous + paid scaling + structured launch motion

**Hires unlocked:**
- Designer (brand, creative, web)
- Second marketing manager (if first was lifecycle, second is content; or vice versa)
- Potentially fractional PR if budget allows

**fCMO shifts:** Hands off lifecycle to dedicated owner. Moves to GTM strategy + channel mix optimization + growth analytics.

### Tier 4 — Series A

**Budget profile:**
- Paid acquisition: $50–150K/mo
- Tooling stack: $5,000–10,000/mo
- Retainers / fCMO: may transition to permanent CMO
- Headcount: full marketing team forming

**Marketing capability:**
- Paid scales aggressively across all proven channels
- Brand campaigns become possible
- International consideration begins
- B2B vertical expansion (if applicable)
- Sophisticated CAC/LTV math + attribution

**Channels live:** Full marketing surface area

**Hires unlocked:**
- Performance marketing lead
- Content lead
- Designer (permanent)
- Potentially: PR firm, paid agency, international growth manager
- Series A often the moment the fCMO transitions out or transitions to advisor

**fCMO shifts:** Often the moment of transition — to permanent CMO hire, fCMO becomes advisor.

### Tier 5 — Series B+

**Budget profile:**
- Paid acquisition: $150K+/mo
- Tooling stack: $10,000–25,000/mo
- Headcount: 10+ marketing org

**Marketing capability:**
- Brand campaigns at industry scale
- PR firm partnerships
- Acquisitions as marketing (acquiring newsletters / podcasts in space)
- Conference sponsorship at category level
- Sponsorships at brand level

**Channels live:** Everything available

**Hires unlocked:**
- VP Marketing or CMO
- Brand director
- Growth / performance team (3–5 people)
- Content team (3–5 people)
- Designers (2–3)
- PR director or agency partnership
- International marketing leads (region-specific)

**fCMO involvement:** Typically out of the company by this point — the original fCMO might still be an advisor.

## How to apply tier logic in a plan

### Section 3 (Current state)
- State the client's current tier explicitly: "Current tier: pre-seed / bootstrapped per Tier 1."

### Section 4–8 (AARRR sections)
- Note tier-dependent moves: "Paid layer (Tier 2 unlock — held until seed close)"
- For Tier 1 plans: every move must be executable at current budget tier OR explicitly flagged as future
- For Tier 2+ plans: moves can assume the tier's capability

### Section 10 (12-month outlook)
- Each quarter names the tier that's active: "Q2 — Months 4–6 (post seed close). Funding state: Tier 2."
- Tier transitions trigger plan recalibration moments

### Section 11 (Marketing operations stack)
- Use the table in `references/ops-stack-mapping.md` capability-unlocks section
- Make it client-specific: "Today (Tier 1): {client's current capability}. After seed close (Tier 2): + {what changes}."

## Adjustments by client category

The standard tiers assume a typical software / SaaS / consumer app. Adjust for category:

### Consumer apps (D2C)
- Higher paid acquisition floor — apps need to test CAC against download cost benchmarks (~$2-10 install + 5-15% trial conversion benchmark)
- Tier 2 starts effectively at $10–20K/mo paid (otherwise can't get statistically meaningful reads at app-install CPMs)

### B2B SaaS
- Lower paid acquisition floor — LinkedIn / Google Ads can produce signal at $3–5K/mo
- More weight on content + sales enablement budget
- Often add a sales hire before a content hire

### Hybrid hardware + software
- Hardware revenue can self-fund some marketing (the eye-mask wedge pattern)
- Paid budget should track blended CAC across hardware sales + app subs
- Shopify-side optimization is a Tier 1 priority (cheap leverage)

### Deep-tech / scientific / clinical
- PR + investor marketing carries more weight than paid
- Conference speaking + academic publishing > Meta ads
- Tier 1 can produce significant traction without paid

### Marketplace / two-sided
- Each side has its own AARRR funnel — budget splits accordingly
- Supply-side acquisition often dominates early; demand-side dominates after liquidity

### Open source / developer tools
- DevRel + community + content > paid
- GitHub stars / npm installs are the activation event
- Paid layer often delayed until Series A

## Tier 1 budget detail (most common starting point)

For Tier 1 clients, the marketing budget breakdown typically looks like:

| Line | Typical monthly |
|---|---|
| Customer.io / lifecycle ESP | $100–500 |
| App Store Connect / Google Play | $25 + 30% rev share (Apple/Google take) |
| Stripe | 2.9% + 30¢ per transaction |
| GA4 | Free |
| Notion | $0–100 |
| GitHub | $0–50 |
| Shopify (if hardware) | $39–100 |
| Ahrefs (or similar SEO tool) | $129–399 |
| Typefully (if social cadence) | $13–39 |
| Dub.co (if ambassador tracking) | $0–39 |
| Misc SaaS | $200–500 |
| **Tooling total** | **~$500–1,700/mo** |
| Paid acquisition | $0 |
| fCMO retainer | Variable |

For the plan, this becomes: "Current monthly marketing budget: $X (tooling only, no paid)."

## When to surface tier limits to the founder

If a founder asks for moves that require a future tier:
- Name the requirement: "This is a Tier 2 move (requires $10K+/mo paid budget). Will unlock after seed close per the 12-month outlook in §10."
- Don't refuse — frame the timing

If a founder underestimates what's needed:
- Be honest: "To scale paid acquisition meaningfully, expect Tier 2 budget. Tier 1 can validate organic; Tier 2 validates paid."

If a founder is over-funded for their stage:
- Don't pad budget to match. Recommend the right work for the funnel state, return excess capacity, suggest investment in compounding rather than scaling.

## Tier-skip cases (worth flagging)

Some companies skip tiers:
- **Notable founder** raising larger-than-typical rounds — can jump from Tier 1 to Tier 3 directly
- **Hardware company** with PR moment — can deploy at Tier 3 levels with the right product moment (e.g., a high-profile longevity-influencer endorsement)
- **B2B SaaS post-LOI** with named enterprise contracts — can fund pilot deployment from contract value

If the client is in a tier-skip situation, name it explicitly in the plan rather than forcing them into the standard ladder.

### references/growth-patterns.md

# Growth Patterns — The Real Shape of SaaS Growth

The 12-month outlook in every plan (Section 10) describes a trajectory. This doc names the shape of that trajectory honestly — what real SaaS growth looks like, when to expect plateaus, and how to plan for the next leg of growth before the current one stalls.

Excerpted and adapted from *Founding Marketing* by Corey Haines.

## The long, slow SaaS ramp of death

Pitch decks show hockey sticks. Real growth shows a series of S-curves — each representing a distinct phase followed by a plateau that tests resolve and creativity.

### Phase 1 — $0 → $10K ARR (the grueling phase)

The hardest milestone. Every customer is a hard-won victory. Typical time: **6–12 months.** Most companies pivot the product multiple times during this phase.

What it requires:
- Runway long enough to keep experimenting until something clicks
- A financial cushion or additional income sources (often the difference between success and shutdown)
- Tolerance for ambiguity — the product positioning, the pricing, and the channel can all still be wrong at this stage

### Phase 2 — $10K → $100K ARR (the treacherous middle)

The middle ground that kills most promising startups. The average company reaches ~$40K ARR in year one. The danger: enough revenue to prove the concept, not enough to support a team.

The threshold to watch for: **$8–10K MRR.** That's when founders can typically go full-time on the business without other income sources. Until then, careful cash management or side income carries the company through.

Companies that flame out in Phase 2 usually run out of runway just as things start working.

### Phase 3 — $100K → $1M ARR (the acceleration phase)

Where things get interesting. Typical time: nearly 2 years total to reach $1M. But there's an acceleration pattern: **once across $100K, companies often double from $100K → $200K in one-third the time it took to reach the first $100K.**

Why: critical mass kicks in. Word-of-mouth starts working. Early customers become your best salespeople. The product has proven itself, and growth becomes more about execution than experimentation.

This is the phase where the marketing plan's 90-day roadmap (Section 9) starts compounding instead of just covering ground.

## Two real growth patterns (and the exponential myth)

The myth: successful SaaS companies grow exponentially, doubling revenue month over month like clockwork.

The reality: two distinct patterns, often combining at scale to *look* exponential when zoomed out.

### Pattern 1 — Linear growth

Build a predictable revenue machine. Find a channel that works (content, partnerships, paid, outbound) and steadily scale it. Some companies reliably add **$10K MRR per month** through a well-oiled marketing engine.

Less sexy than exponential. Far more sustainable. Crucially, **plannable**: when you know what you can count on adding each month, hiring decisions, product roadmap, and expansion planning all become tractable.

### Pattern 2 — Step-function growth

Periods of plateau followed by sudden jumps. Jumps aren't random — they're triggered by specific events:
- Breaking into a new market segment (e.g., enterprise after starting SMB)
- Launching a major product expansion (new feature line, new tier)
- Cracking a new marketing channel that compounds

Example: one founder saw revenue triple in two months after launching enterprise features — following six months of flat growth.

Key insight for the plan: **each step requires deliberate action and investment.** Steps don't happen by waiting. While standing on the current step, you have to be actively building the next one.

### How they combine

Zoom out far enough and a series of linear phases + step functions can look exponential. That's where the myth comes from. Understanding it's actually a series of plannable shapes changes how you build the plan:

- Don't chase the myth of doubling every month
- Build sustainable linear systems (Sections 4–8 AARRR moves)
- Plan deliberate step functions (Section 10 12-month milestones)

## Layering growth curves — Channel × Product × Market

The secret to sustained growth isn't one perfect channel. It's orchestrating multiple S-curves that work together. Three S-curves to track:

### Channel S-curves

Every marketing channel has its own lifecycle:
- **SEO** — 6–12 months to mature; once it does, steady leads for years. Marathon runner.
- **Paid ads** — quick wins; diminishing returns as you scale.
- **Content marketing** — slow to start, compounds beautifully over time.
- **Partnerships / co-marketing** — episodic; high yield when the right partner aligns.
- **Outbound** — predictable when calibrated; CAC-heavy and plateaus at team capacity.
- **PR** — spike-driven; sustains awareness rather than direct conversion.

**The rule:** start the next channel before the current one plateaus. Riding one channel to its ceiling before investing in the next produces a multi-month growth plateau that takes more effort to break out of than it would have taken to start the next channel earlier.

In the plan: Section 4 (Acquisition) names current channels, planned channels, and skipped channels. The 12-month roadmap (Section 10) sequences when the next channel investment begins.

### Product S-curves

Your core product naturally hits a growth ceiling as you saturate the initial market. Pushing harder on the same features doesn't break through. What does:

- Adding features that target new use cases
- Extending the product line to serve adjacent needs
- Expanding into new market segments (e.g., team collaboration added to a single-user tool — opens a new market)

In the plan: Sections 5 (Activation) and 8 (Revenue) name where the product needs to grow to unlock the next growth tier.

### Market S-curves

Every market segment has its own growth ceiling. Time the expansion into the next segment while the current segment is still showing strong growth. Common patterns:

- SMB → mid-market → enterprise
- Single vertical → adjacent verticals
- Domestic → international

Waiting until a segment is saturated makes the transition harder.

In the plan: Section 2 (Strategic frame) names current segment + future segments. Section 10 (12-month outlook) sequences when expansion moves begin.

### The orchestration

The real magic: while SEO is maturing, you're using paid for quick wins. As those channels mature, you're developing product features that unlock enterprise. Meanwhile, the groundwork for international expansion is being laid for when domestic saturates.

This is the operational thesis behind the AARRR mapping (Sections 4–8) and the 12-month outlook (Section 10): each section is a curve, and the plan sequences them so the next curve is ramping while the current one is still growing.

## The 3-3-2-2-2 VC growth path

For companies that have crossed $1M ARR and raised institutional capital, the VC benchmark is:

| Year | Multiple | Cumulative ARR (from $1M) |
|---|---|---|
| Year 0 | — | $1M |
| Year +1 | 3× | $3M |
| Year +2 | 3× | $9M |
| Year +3 | 2× | $18M |
| Year +4 | 2× | $36M |
| Year +5 | 2× | $72M |
| Year +6 | 2× | $144M |
| Year +7 | 2× | $288M |

Most companies don't hit this. Useful regardless — anchoring the 12-month outlook against this benchmark forces the plan to either (a) match it and show how, or (b) explicitly defend choosing a slower trajectory.

For non-VC-backed (bootstrapped, founder-funded, profit-focused) companies, this curve doesn't apply. Use linear or step-function targeting instead.

## How this informs the plan

| Section | What to include |
|---|---|
| **3 (Current state)** | Where the company is on each S-curve (channel maturity, product maturity, market saturation). Name the current phase ($0–10K / $10K–100K / $100K–1M / $1M+). |
| **4 (Acquisition)** | Current channels + their position on the S-curve (early / mature / plateauing). Next channel investment with rationale. |
| **5–8 (AARRR)** | Each section names the binding constraint at the current phase. For Phase 2 companies, Activation is usually the leverage point. For Phase 3, Retention + Referral compound the existing growth. |
| **9 (90-day roadmap)** | Linear-pattern moves dominate (predictable additions). Step-function setups (the build-up to a launch, an enterprise tier, a new market segment) live here. |
| **10 (12-month outlook)** | Sequence channel S-curves, product S-curves, market S-curves. If VC-backed Series A+, anchor against 3-3-2-2-2. If not, name the linear or step-function targets. |
| **13 (Measurement)** | The north-star metric reflects the current phase (Phase 1 is usually pure new-signup; Phase 3 is usually expansion ARR or NRR). |

## Operational guidance for the planner

- **Don't promise exponential.** If the plan implies doubling every month, the founder will use it against you in 90 days. Linear + step-function is honest.
- **Name the binding constraint.** Phase 1 binding constraint is finding any channel that works. Phase 2 is funding the team. Phase 3 is breaking the ceiling on whichever channel got you here.
- **Plateaus aren't failures.** They're the moment between two S-curves. The plan should anticipate them and stage the next move.
- **Don't conflate "growth" with "growth rate."** A company adding $20K MRR each month for 24 months has built a remarkable machine. The fact that the *percentage* growth rate declines as the base grows is arithmetic, not failure.

### references/idea-cross-reference.md

# Idea Cross-Reference — 139 Marketing Ideas Mapped to AARRR

The `marketing-ideas` skill catalogs 139 proven marketing tactics. This doc is the source-of-truth mapping: every idea assigned to a primary AARRR stage, with notes for when it's typically active and what category constraints apply.

The plan's Section 12 ("Tactical idea bank") uses this mapping as the base, then layers client-specific filters: brand voice rules might skip some ideas; funding stage might shift Q-status; client category might rule out others.

## How to read this doc

- **139 unique ideas, 144 entries.** Five ideas cross-cut multiple AARRR stages and appear under each stage they serve (#79 Early-Access Referrals, #86 Lifetime Deals, #91 In-App Upsells, #114 Moneyball Marketing, #117 Product Competitions). Each duplicate row carries a cross-cut note.
- **"Entries" counts rows; idea IDs are unique.** Section header counts reflect rows in this doc, not unique ideas from `marketing-ideas`.
- **Numbers correspond exactly to the `marketing-ideas` skill ordering.** If `marketing-ideas` reorders or expands, update this doc.

## AARRR assignment for all 139 ideas

### Acquisition (116 entries)

These ideas primarily serve top-of-funnel awareness, traffic, and lead generation.

| # | Idea | Category | Typical stage available |
|---|---|---|---|
| 1 | Easy Keyword Ranking | Content & SEO | Now (any stage) |
| 2 | SEO Audit | Content & SEO | Now |
| 3 | Glossary Marketing | Content & SEO | Q2+ |
| 4 | Programmatic SEO | Content & SEO | Q3+ (needs data + template system) |
| 5 | Content Repurposing | Content & SEO | Now (immediate leverage) |
| 6 | Proprietary Data Content | Content & SEO | Now (if data exists) |
| 7 | Internal Linking | Content & SEO | Now |
| 8 | Content Refreshing | Content & SEO | Q2+ (after content base exists) |
| 9 | Knowledge Base SEO | Content & SEO | Q3+ (after help docs exist) |
| 10 | Parasite SEO | Content & SEO | Now |
| 11 | Competitor Comparison Pages | Competitor | Q2+ |
| 12 | Marketing Jiu-Jitsu | Competitor | Now |
| 13 | Competitive Ad Research | Competitor | Pre-paid |
| 14 | Side Projects | Free Tools | Q3+ |
| 15 | Engineering as Marketing | Free Tools | Q3+ |
| 16 | Importers as Marketing | Free Tools | SaaS-specific |
| 17 | Quiz Marketing | Free Tools | Q2+ |
| 18 | Calculator Marketing | Free Tools | Q3+ |
| 19 | Chrome Extensions | Free Tools | Browser-relevant only |
| 20 | Microsites | Free Tools | Q3+ |
| 21 | Scanners | Free Tools | Specific products only |
| 22 | Public APIs | Free Tools | Developer/dev tool products |
| 23 | Podcast Advertising | Paid Ads | Post-budget |
| 24 | Pre-targeting Ads | Paid Ads | Post-budget |
| 25 | Facebook Ads | Paid Ads | Post-budget |
| 26 | Instagram Ads | Paid Ads | Post-budget |
| 27 | Twitter Ads | Paid Ads | Post-budget |
| 28 | LinkedIn Ads | Paid Ads | Post-budget (B2B-strong) |
| 29 | Reddit Ads | Paid Ads | Post-budget |
| 30 | Quora Ads | Paid Ads | Post-budget |
| 31 | Google Ads | Paid Ads | Post-budget |
| 32 | YouTube Ads | Paid Ads | Post-budget |
| 33 | Cross-Platform Retargeting | Paid Ads | Post-paid-firing |
| 34 | Click-to-Messenger Ads | Paid Ads | Niche use cases |
| 35 | Community Marketing | Social & Community | Q3+ |
| 36 | Quora Marketing | Social & Community | Now |
| 37 | Reddit Keyword Research | Social & Community | Now |
| 38 | Reddit Marketing | Social & Community | Q2+ |
| 39 | LinkedIn Audience | Social & Community | Now (B2B + founders) |
| 40 | Instagram Audience | Social & Community | Q2+ |
| 41 | X Audience | Social & Community | Depends on founder bandwidth |
| 42 | Short Form Video | Social & Community | Q3+ |
| 43 | Engagement Pods | Social & Community | Generally off-brand |
| 44 | Comment Marketing | Social & Community | Q2+ |
| 49 | Monthly Newsletters | Email | Q2+ (Acquisition use: subscriber capture) |
| 54 | Affiliate Discovery via Backlinks | Partnerships | Q2+ |
| 55 | Influencer Whitelisting | Partnerships | Post-paid-budget |
| 56 | Reseller Programs | Partnerships | Q4+ |
| 57 | Expert Networks | Partnerships | Q3+ |
| 58 | Newsletter Swaps | Partnerships | Q2+ |
| 59 | Article Quotes (HARO) | Partnerships | Now |
| 60 | Pixel Sharing | Partnerships | Post-paid |
| 61 | Shared Slack Channels | Partnerships | Q3+ |
| 63 | Integration Marketing | Partnerships | Q3+ |
| 64 | Community Sponsorship | Partnerships | Q2+ |
| 65 | Live Webinars | Events | Q2+ |
| 66 | Virtual Summits | Events | Q3+ |
| 67 | Roadshows | Events | Q4+ |
| 68 | Local Meetups | Events | Q3+ |
| 69 | Meetup Sponsorship | Events | Q3+ |
| 70 | Conference Speaking | Events | Now (if founder is speakable) |
| 71 | Conferences (own-hosted) | Events | Q4+ |
| 72 | Conference Sponsorship | Events | Q3+ |
| 73 | Media Acquisitions | PR & Media | Series A+ |
| 74 | Press Coverage | PR & Media | Now (if newsworthy) |
| 75 | Fundraising PR | PR & Media | When fund closes |
| 76 | Documentaries | PR & Media | Q4+ |
| 77 | Black Friday Promotions | Launches | Q4 (seasonal) |
| 78 | Product Hunt Launch | Launches | At GA or major feature |
| 79 | Early-Access Referrals | Launches | Pre-launch or GA |
| 80 | New Year Promotions | Launches | Q1 (seasonal) |
| 81 | Early Access Pricing | Launches | GA |
| 82 | Product Hunt Alternatives | Launches | Same as PH |
| 83 | Twitter Giveaways | Launches | Generally off-brand |
| 84 | Giveaways | Launches | Q3+ |
| 85 | Vacation Giveaways | Launches | Q4+ (seasonal) |
| 86 | Lifetime Deals | Launches | Generally off-brand (damages LTV math) |
| 87 | Powered By Marketing | Product-Led | Q4+ |
| 88 | Free Migrations | Product-Led | SaaS-specific |
| 89 | Contract Buyouts | Product-Led | B2B SaaS only |
| 97 | Playlists as Marketing | Content Formats | Q3+ |
| 98 | Template Marketing | Content Formats | Q3+ |
| 99 | Graphic Novel Marketing | Content Formats | Generally off-brand |
| 100 | Promo Videos | Content Formats | Q3+ |
| 101 | Industry Interviews | Content Formats | Q2+ |
| 102 | Social Screenshots | Content Formats | Q2+ |
| 103 | Online Courses | Content Formats | Q3+ |
| 104 | Book Marketing | Content Formats | Q4+ |
| 105 | Annual Reports | Content Formats | Q4+ |
| 106 | End of Year Wraps | Content Formats | Q4 (seasonal) |
| 107 | Podcasts (own-hosted) | Content Formats | Q3+ |
| 108 | Changelogs | Content Formats | Q2+ |
| 109 | Public Demos | Content Formats | Now |
| 110 | Awards as Marketing | Unconventional | Q4+ |
| 111 | Challenges as Marketing | Unconventional | Q3+ |
| 112 | Reality TV Marketing | Unconventional | Generally off-brand |
| 113 | Controversy as Marketing | Unconventional | Brand-dependent |
| 114 | Moneyball Marketing | Unconventional | Ongoing methodology |
| 115 | Curation as Marketing | Unconventional | Q2+ |
| 116 | Grants as Marketing | Unconventional | Q4+ |
| 117 | Product Competitions | Unconventional | Developer-specific |
| 118 | Cameo Marketing | Unconventional | Generally off-brand |
| 119 | OOH Advertising | Unconventional | Series A+ |
| 120 | Marketing Stunts | Unconventional | Brand-dependent |
| 121 | Guerrilla Marketing | Unconventional | Brand-dependent |
| 122 | Humor Marketing | Unconventional | Brand-dependent |
| 123 | Open Source as Marketing | Platforms | Developer products |
| 125 | App Marketplaces | Platforms | Platform-specific |
| 126 | YouTube Reviews | Platforms | Q3+ |
| 127 | YouTube Channel | Platforms | Q3+ |
| 128 | Source Platforms | Platforms | B2B SaaS only |
| 129 | Review Sites | Platforms | Now |
| 130 | Live Audio | Platforms | Q3+ |
| 131 | International Expansion | International | Q4+ |
| 133 | Investor Marketing | Developer/etc | Now (when raising) |
| 138 | Podcast Tours | Audience-Specific | Q2+ |

### Activation (8 entries)

| # | Idea | Category | Typical stage available |
|---|---|---|---|
| 47 | Founder Welcome Email | Email | Q2+ (Activation use) |
| 48 | Dynamic Email Capture | Email | Q2+ |
| 51 | Onboarding Emails | Email | When UI is stable |
| 90 | One-Click Registration | Product-Led | Now |
| 91 | In-App Upsells | Product-Led | Q2+ (cross-cuts Revenue) |
| 95 | Concierge Setup | Product-Led | Q3+ (high-value users) |
| 96 | Onboarding Optimization | Product-Led | Now |
| 124 | App Store Optimization | Platforms | Now (App Store products) |

### Retention (8 entries)

| # | Idea | Category | Typical stage available |
|---|---|---|---|
| 45 | Mistake Email Marketing | Email | Opportunistic |
| 46 | Reactivation Emails | Email | Now |
| 50 | Inbox Placement | Email | Now (technical setup) |
| 52 | Win-back Emails | Email | Q1+ |
| 53 | Trial Reactivation | Email | Q2+ (when paywall is firing) |
| 94 | Offboarding Flows | Product-Led | Q2+ |
| 135 | Support as Marketing | Developer/etc | Q2+ |
| 134 | Certifications | Developer/etc | Q3+ (cross-cuts Referral) |

### Referral (5 entries)

| # | Idea | Category | Typical stage available |
|---|---|---|---|
| 62 | Affiliate Program | Partnerships | Now (when inbound exists) |
| 79 | Early-Access Referrals | Launches | Pre-launch / GA |
| 92 | Newsletter Referrals | Product-Led | Q3+ (if newsletter exists) |
| 93 | Viral Loops | Product-Led | Q3+ |
| 137 | Two-Sided Referrals | Audience-Specific | Q2+ |

### Revenue (2 entries — most monetization is strategy not tactic)

| # | Idea | Category | Typical stage available |
|---|---|---|---|
| 91 | In-App Upsells | Product-Led | Q2+ (cross-cuts Activation) |
| 132 | Price Localization | International | Q4+ |

> **Skipped from Revenue:** #86 Lifetime Deals appears under Launches (Acquisition section) only. It's generally off-brand for subscription products because it damages LTV math; recommend in Section 12's Skip list with rationale, not in stage totals.

### Cross-cutting / brand foundation (2 entries)

| # | Idea | Category | Typical stage available |
|---|---|---|---|
| 114 | Moneyball Marketing | Unconventional | Ongoing methodology |
| 139 | Customer Language | Audience-Specific | Now (foundational) |

### Developer-specific / dev tool products (2 entries)

| # | Idea | Category | Use when |
|---|---|---|---|
| 117 | Product Competitions | Unconventional | Developer tool products |
| 136 | Developer Relations | Developer/etc | Developer tool products |

## How to apply this to a specific client

For Section 12 of the plan:

### Step 1 — Filter for category fit

For each idea, ask:
- Does this idea apply to the client's category? (e.g., #16 Importers only for SaaS; #19 Chrome Extensions only for browser-relevant; #136 DevRel only for dev tools)
- Skip ideas that don't apply, with a note

### Step 2 — Filter for brand voice

For each idea, ask:
- Does this idea conflict with the client's brand voice?
- Common conflicts:
  - **Lifetime Deals (#86)** — conflicts with premium positioning
  - **Twitter Giveaways (#83)** — often off-brand for serious / clinical / luxury voices
  - **Humor Marketing (#122)** — off-brand for serious / clinical voices
  - **Cameo Marketing (#118)** — off-brand for most voices
  - **Reality TV Marketing (#112)** — off-brand for most voices

If conflict, place in Skip list with explicit rationale.

### Step 3 — Set timing status

For ideas that pass filters, set status:
- **Now (Q1)** — already in 90-day plan OR can run alongside without new capacity
- **Q2** — post-bedrock-fix, post-foundation; second-quarter layer-in
- **Q3+** — post-seed-close, post-GA; expansion moves
- **Q4+** — long-game / large-investment

Use the "Typical stage available" column as the default. Shift earlier if client has unusual capability (e.g., a celebrity founder shifts Conference Speaking #70 from "Now" to "Now and high-leverage").

### Step 4 — Write the client-specific note

Every "Now / Q2 / Q3+" idea gets a one-line client-specific note. Examples:
- For idea #11 Competitor Comparison Pages: "Quietude vs. Calm / Headspace / Brain.fm / Endel / Wavepaths — high-intent SERPs"
- For idea #133 Investor Marketing: "Alex's seed raise — leverage angel backchannel for PR + intros"
- For idea #15 Engineering as Marketing: "HRV interpretation guide; nervous system self-assessment; sound bath finder directory"

### Step 5 — Sum the bank

After all five AARRR tables + skip list:

```markdown
### Idea-bank summary

- {Acquisition count} ideas applicable to Acquisition (the dominant stage at {client}'s current stage)
- {Activation count} to Activation, {Retention count} to Retention
- {Referral count} to Referral
- {Revenue count} to Revenue
- {cross-cutting count} cross-cutting
- {skipped count} ideas skipped for brand / business-model fit

**What this proves:** the plan is roughly X% of the available tactical surface area, not 100%. {appropriate or not for the stage} — as capacity unlocks across Q2 → Q3 → Series A, the cross-reference becomes the inventory to scale activity without losing strategic coherence.
```

## How to maintain this doc

If `marketing-ideas` adds new ideas (it's a living skill — the 139 may become 145 or 160 over time):
1. Read `skills/marketing-ideas/references/ideas-by-category.md` in the `marketingskills` repo
2. Assign each new idea to a primary AARRR stage using the rules above
3. Add to this doc's tables
4. Update SKILL.md's idea-count reference

## Sources

- `skills/marketing-ideas/SKILL.md` (in the `marketingskills` repo)
- `skills/marketing-ideas/references/ideas-by-category.md` (in the `marketingskills` repo)

> Note: 6 additional reference file(s) were omitted to keep this skill a manageable size: `references/example-quietude.md`, `references/measurement-framework.md`, `references/methodology.md`, `references/ops-stack-mapping.md`, `references/plan-template.md`, `references/team-and-agency-model.md`.

