---
name: offers
description: "When the user wants to design, construct, or improve an offer — the thing they actually sell — including value framing, bonus stacking, guarantee design, scarcity/urgency, naming, and payment structure. Also use when the user mentions 'offer,' 'offer design,' 'build an offer,' 'grand slam offer,' 'irresistible offer,' 'value stack,' 'bonus stack,' 'guarantee,' 'risk reversal,' 'money-back guarantee,' 'scarcity,' 'urgency,' 'high-ticket offer,' 'productize a service,' 'naming an offer,' 'payment plan,' 'down-sell,' 'upsell offer,' or 'why isn't my offer converting.' Best for services, agencies, courses, coaching, info products, high-ticket B2B, and direct-response. If you run pure self-serve SaaS, read pricing first — tiers and packaging do more work there. For price level itself (tiers, freemium, value metric), see pricing. For the page that presents the offer, see copywriting. For the launch moment, see launch. For sales collateral, see sales-enablement."
category: Marketing
author: community
version: "1.0.0"
icon: megaphone
---

# Offer Design

You are an expert in offer construction. Your goal is to help the user build offers that move — not by writing better copy on a worse offer, but by improving the offer itself.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

---

## Core Philosophy

**The offer is the thing, not the page.** Better copy on a weak offer compounds slowly. A stronger offer with average copy converts immediately. Most "we need better copy" requests are actually "we need a better offer" requests in disguise.

This skill exists because the rest of the repo handles the *expression* of an offer — `copywriting` writes the sales page, `cro` optimizes the conversion path, `pricing` sets the tier structure, `launch` orchestrates the moment, `paywalls` shapes the upgrade prompt. None of them ask the deeper question: **is the offer underneath any of that actually good?**

### When this skill matters

You sell:
- **Services** — consulting, freelance, agency retainers, productized services
- **Courses** — async, cohort-based, live
- **Coaching** — 1:1, group, mastermind
- **Info products** — guides, swipe files, templates, communities
- **High-ticket B2B** — $5K+ ACV with a sales conversation
- **Direct-response** — e-com promo offers, infomercial-style, paid-traffic-to-VSL

### When `pricing` does more of the work

You sell:
- **Self-serve SaaS** with tiered subscriptions — the levers are mostly tier structure, value metric, and packaging; offer construction (bonuses, guarantees) is secondary
- **Marketplaces** — the offer is structural, not constructed

Skim this skill in those cases for the value equation framing, then go to `pricing`.

---

## The Value Equation

The single most useful frame for offer design. Originally from Alex Hormozi's *$100M Offers* — internalized broadly across direct-response and creator-economy training since.

```
              Dream Outcome  ×  Perceived Likelihood of Achievement
  Value  =  ─────────────────────────────────────────────────────────
              Time Delay     ×   Effort & Sacrifice
```

You move the four levers like this:

| Lever | What it means | How to increase value |
|-------|---------------|-----------------------|
| **Dream outcome** ↑ | What the customer actually wants | Connect to the bigger goal behind the surface ask. Specify and name it. |
| **Perceived likelihood** ↑ | Do they believe they'll get it | Proof (case studies, named customers, data), guarantees, methodology specificity |
| **Time delay** ↓ | How long until result | Faster onboarding, faster first win, faster end-to-end timeline |
| **Effort & sacrifice** ↓ | What it costs them in time/work/risk besides money | Done-for-you, simpler process, fewer decisions, lower learning curve |

**Implication for offer construction**: most "lower the price" requests are actually "raise the numerator or lower the denominator" requests. Price is the comparison, not the value.

**For the full framework, examples, and how to diagnose which lever is broken:** see [references/value-equation.md](references/value-equation.md)

---

## The Anatomy of a Complete Offer

A complete offer has six components. Skip any one and conversion suffers.

| # | Component | Question it answers |
|---|-----------|---------------------|
| 1 | **Core deliverable** | What do they get? |
| 2 | **Bonus stack** | What else do they get that makes the core feel undervalued? |
| 3 | **Guarantee** | What happens if it doesn't work? |
| 4 | **Scarcity / urgency** | Why now, not later? |
| 5 | **Name** | What is this thing called? |
| 6 | **Price + payment structure** | What do they pay and how? |

Most weak offers fail on bonuses (none), guarantees (none or wrong type), or scarcity (none, or fake). Most aggressive-to-the-point-of-cringe offers fail on guarantee (over-promising) or scarcity (fake countdown timers).

**For the full anatomy with worked examples:** see [references/offer-anatomy.md](references/offer-anatomy.md)

---

## Reference Library

| Reference | When to read |
|-----------|--------------|
| [value-equation.md](references/value-equation.md) | Diagnosing which lever is broken on a stuck offer |
| [offer-anatomy.md](references/offer-anatomy.md) | Building a complete offer from scratch |
| [guarantee-design.md](references/guarantee-design.md) | Picking the right type of guarantee for your business model |
| [bonus-stacking.md](references/bonus-stacking.md) | Adding bonuses that raise perceived value without devaluing the core |
| [scarcity-urgency.md](references/scarcity-urgency.md) | Creating *real* scarcity (and avoiding the fake patterns that destroy trust) |
| [offer-formats.md](references/offer-formats.md) | Format playbooks by business type — service, course, coaching, info product, SaaS lead magnet, agency retainer, high-ticket B2B |
| [examples.md](references/examples.md) | Anonymized worked examples — before/after for each business type |

---

## The Diagnostic Loop

When the user says "my offer isn't converting" or "I want to improve my offer":

1. **Identify the business type** — service, course, coaching, info product, SaaS, agency, B2B. The right playbook is type-specific.
2. **State the current offer in plain language** — name, price, what they get, guarantee, deadline. Write it down even if it lives in scattered places now.
3. **Run the value equation** — score each of the four levers 1–10. The lowest is the binding constraint.
4. **Audit the anatomy** — which of the six components is missing or weak?
5. **Pick one lever to fix this iteration** — don't rebuild everything. The biggest lever is usually the one currently scoring lowest.
6. **Draft the changed component** — new bonus, new guarantee, new scarcity, new name, new payment plan
7. **Project the lift, honestly** — most single-component changes deliver 10–40% conversion lift. Anyone promising 5x is selling something. Two consecutive iterations on different levers can stack to 2–3x.

---

## When NOT to Use Offer-Design Tactics

Some offer patterns work but cost more than they're worth:

- **Manipulative scarcity** — fake countdown timers, "only 3 spots left" lies. Short-term lift, long-term trust collapse. Don't.
- **Over-promising guarantees** — "double your revenue or refund + $1,000." Refund risk eats margin; the few cases that fail nuke your reputation publicly.
- **Bonus inflation** — stacking $50K of "bonuses" on a $497 product so it "feels like a steal." Sophisticated buyers see this. Treat bonuses as additive, not exaggerated.
- **Course-bro aesthetic on a serious product** — Gold logos, "secret method," fake urgency. Pattern-matches to scam. Wrong room.

The repo voice: opinionated, but honest. Building offers well doesn't mean building offers loud.

---

## Banned Vocabulary

When drafting offer language (sales pages, emails, headlines), avoid:

- **"Game-changing," "revolutionary," "disruptive," "next-level," "10x"** — pattern-matches to AI slop / course-bro
- **"Secret," "hidden," "what they don't want you to know"** — clickbait
- **"Limited time" with no actual time limit** — lying
- **"Worth $X" or "$Y value" with no comparable** — inflation
- **"100% guaranteed" without specifying conditions** — legally and brand-wise risky

Use specific numbers, named customers, concrete outcomes, real timelines. Specificity beats superlatives.

---

## Related Skills

- **pricing** — for price levels, tier structure, value metric, packaging, freemium
- **copywriting** — for the page that presents the offer
- **cro** — for optimizing the conversion path the offer travels through
- **launch** — for the moment you ship the offer
- **paywalls** — for in-app upgrade-prompt versions of an offer
- **sales-enablement** — for the deck and one-pager that carry the offer into a sales conversation
- **emails** — for the email sequence that warms up the offer
- **marketing-psychology** — for the cognitive biases that make offers land or bounce

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/bonus-stacking.md

# Bonus Stacking

How to add bonuses that raise perceived value without devaluing the core offer.

## What bonuses actually do

Three jobs at once:

1. **Raise perceived value** of the total offer
2. **Lower perceived risk** — even if the core underdelivers, "I still got X for free"
3. **Close specific buying objections** — each bonus can target one objection

The third job is the underrated one. Most weak bonus stacks throw four generic "extras" at the buyer. Strong bonus stacks read the buyer's specific hesitations and close them in order.

---

## The core principle: bonuses-as-objection-handlers

For each major objection your buyer has, add a bonus that closes it.

### Common objections → matching bonus

| Objection | Targeted bonus |
|-----------|---------------|
| "I don't have time to implement this" | Done-for-you setup, week 1 |
| "I don't know which tools to use" | Pre-vetted tool stack with discount codes |
| "What if I get stuck?" | 30-day async Slack support |
| "I'm not sure my team will buy in" | Stakeholder pitch deck |
| "I've tried something like this before and it didn't work" | Case study from someone in your exact situation |
| "What about [edge case in my industry]?" | Industry-specific bonus reference doc |
| "Will I have to learn a bunch of new tools?" | Pre-built templates for the tools we recommend |
| "What if I don't finish it?" | 1:1 accountability check-in at day 30 |
| "My situation is more complex than the average buyer" | 1:1 onboarding call to customize the plan |
| "Will this work in [region/language]?" | Localized version or addendum |

A 4-bonus stack that closes 4 specific objections converts massively better than a 4-bonus stack of generic "extras."

### How to find your buyer's actual objections

1. Read every refund-request email and sales-call transcript from the last 6 months
2. Read your own sales page out loud and write down every doubt that surfaces
3. Ask 3 recent buyers: "What almost made you not buy?"

The answers cluster around 3–6 objections. Build a bonus for each.

---

## The math of bonus value

Each bonus has a stated value (what it would cost if you bought it separately). Bonuses should:

1. **Have a stated value the buyer can verify.** Compare to a comparable product or service. "$497 value — that's what the standalone template pack costs" beats "$5,000 value." (Standalone? Compared to what?)

2. **Total to less than 2x the price** of the core offer. A $1K offer can comfortably have $1.5K in bonuses. A $1K offer with "$25K in bonuses" reads as a scam.

3. **Be things you'd actually sell separately.** If you'd never sell the bonus as a standalone product, the stated value isn't real. Sophisticated buyers can tell.

4. **Each have a specific named outcome.** "Bonus: marketing toolkit" is weak. "Bonus: 12 pre-built Notion templates for your first 90 days, valued at $297 because that's what the standalone template pack sells for at [link]" is strong.

---

## The 4-bonus pattern that works

Most strong offers stack exactly 3–5 bonuses. More starts to feel like padding; fewer leaves objections un-closed.

A common structure:

| # | Type | Purpose | Typical value |
|---|------|---------|---------------|
| 1 | **Speed bonus** | Removes time-delay objection | Templates, swipes, accelerators |
| 2 | **Trust bonus** | Removes likelihood-of-failure objection | Case study, methodology doc, examples library |
| 3 | **Stuck bonus** | Removes "what if I get stuck" objection | Office hours, Slack, on-demand support |
| 4 | **Decision bonus** | Removes "I have to choose between X and Y" objection | Tool stack with discount codes, pre-vetted recommendations |
| 5 (optional) | **Bigger-than-you-asked bonus** | Adds dream-outcome surface area | Adjacent deliverable, related framework, partner offer |

Example for a $2K B2B copywriting course:

| # | Bonus | Closes |
|---|-------|--------|
| 1 | "30 winning sales page templates (last updated 2026-Q2)" — $297 value | "I don't have time to write from scratch" |
| 2 | "9 case studies from agencies that hit $250K MRR using these frameworks" — $0 (proof, not a saleable asset) | "Does this actually work for my situation?" |
| 3 | "60-day Slack access with weekly office hours" — $497 value | "What if I get stuck on a specific project?" |
| 4 | "The tool stack: 5 tools we use + discount codes (saves ~$1,200/yr)" — $1,200 value | "I don't know what to use" |
| 5 | "Bonus session: How to charge $5K+ per project" — $297 value | Pricing confidence (adjacent dream outcome) |

Total stated value: ~$2,300 in bonuses on a $2K core. Math checks out (under 2x). Each bonus closes a real objection.

---

## When bonuses backfire

### Inflated values

"$50,000 in bonuses included today only!" on a $497 product. The asymmetry is the tell — every sophisticated buyer's bullshit detector fires.

Stated values must be defensible. If you can't point to a comparable price, don't quote the value.

### Bonuses that devalue the core

If your core offer is "I'll write your sales page for $5K" and your bonus is "PLUS — bonus sales page edits for free for life!" — the bonus implies the core is incomplete. Now the buyer wonders why they should buy *without* the bonus.

Bonuses should be *additive* to a complete core, not patches on an incomplete one.

### Bonus-stack-as-substitute-for-core

A weak core surrounded by amazing bonuses converts at the moment of sale but produces angry refund requests. The buyer bought the bonuses, got the core, felt cheated.

Order: strong core *first*, then bonuses to address specific objections.

### Stacked too high

5+ bonuses with high stated values starts to read as a course-bro funnel. Premium buyers ignore the bonus list entirely; mid-market buyers feel they're being upsold; new buyers get confused.

3–5 bonuses, each with a specific purpose. Cap it.

### Same-as-everyone-else bonuses

"BONUS! Private community access!" on every course in your category isn't a bonus, it's table stakes. If every competitor offers the same bonuses, none of them are differentiators.

Find bonuses that are specific to your buyer's situation. A SaaS bonus for a SaaS-focused buyer beats a generic "private community" every time.

---

## Bonus delivery: timing matters

A bonus delivered on day 1 closes "what if I never use it?" risk.
A bonus delivered at week 4 maintains momentum.
A bonus delivered at completion rewards finishing.

Mix the timing intentionally:

- Day 1: speed bonuses (templates, swipes, toolkit)
- Week 2–4: support bonuses (Slack, office hours, check-ins)
- Completion: identity bonuses (certificate, alumni access)

A buyer who gets all bonuses up-front is more likely to abandon (they got what they wanted, lost incentive to finish). A buyer who gets some bonuses at completion is more likely to finish (and refer).

---

## The audit

For each existing bonus on a current offer, ask:

1. **What specific buying objection does this close?** If you can't name one, it's filler.
2. **What's its defensible stated value?** If you can't point to a comparable price, drop the dollar amount.
3. **Does the buyer get it on day 1, or at a meaningful point in their journey?** Timing should support the customer outcome, not just the conversion event.
4. **Is this bonus specific to my buyer, or could any competitor offer the same thing?** If it's generic, replace it.
5. **Is the bonus strong enough that the offer would still convert without the core?** If yes, the core is weak. Fix the core, don't lean on the bonus.

Most stuck offers have either zero bonuses or too many generic ones. The right move is usually: cut to 3–5 specific objection-closing bonuses, name each one clearly, and put defensible values on them.

### references/examples.md

# Worked Examples — Before/After Offers

Anonymized examples drawn from real engagements. Each shows the weak version, the diagnostic, and the strong version.

---

## Example 1: Fractional CMO service

### Before

**The offer (as it was):**
> Fractional CMO services. $15K/month. We'll help you grow.

**Diagnostic:**
- Dream outcome: 4 (vague — "grow")
- Perceived likelihood: 3 (no methodology, no case studies)
- Time delay: 4 (no timeline, indefinite engagement)
- Effort & sacrifice: 5 (unclear what the buyer has to do)
- Anatomy: only the core is present. No bonuses, no guarantee, no scarcity, no name.

**Lowest binding constraint:** perceived likelihood. Buyers don't believe an unnamed service will deliver.

### After

| Component | What was added |
|-----------|----------------|
| **Core** | "The 90-Day Marketing Reset" — 8-week audit + 12-week execution plan, delivered by a CMO who's run marketing at 3+ similar-stage companies |
| **Bonuses** | (1) Weekly 1:1s for 12 weeks (~$12K value); (2) Pre-vetted execution-partner intros (priceless); (3) Board-deck marketing strategy section template |
| **Guarantee** | "After the 8-week audit, if you don't have a clear 90-day plan you'd run yourself, you don't pay the audit fee." |
| **Scarcity** | "We take 2 engagements per quarter — next slot opens [date]" |
| **Name** | "The 90-Day Marketing Reset" |
| **Price** | $15K → $5K start, $5K week 8, $5K week 16 |

Same delivery, same person, ~3x close rate, longer engagements (because the buyer is clearer about scope).

**Lesson:** the price didn't move. The structure did.

---

## Example 2: $1,997 cohort-based copywriting course

### Before

**The offer:**
> Learn copywriting. $1,997. Includes 6 modules and Slack access.

**Diagnostic:**
- Dream outcome: 5 ("learn copywriting" — surface ask, not dream outcome)
- Perceived likelihood: 3 (no case studies, no named methodology)
- Time delay: 4 (6-month course, no first-win)
- Effort & sacrifice: 4 (lots of homework, weekly calls, big commitment)

**Lowest binding constraint:** perceived likelihood. Buyers don't believe THEY can do it.

### After

| Component | What changed |
|-----------|--------------|
| **Core** | "Write sales pages clients pay you $5K+ for in 12 weeks" — outcome-framed |
| **Bonuses** | (1) 30 winning sales page templates (last updated Q2 2026) — $297 value; (2) 9 named case studies from copywriters in 6 industries — proof, not pitch; (3) 60-day Slack with weekly office hours — $497 value; (4) The tool stack with discount codes — $1,200 value |
| **Guarantee** | "Complete all 6 modules, submit the final exercise, and if you haven't written a sales page that lands you a $5K+ client within 12 months, refund in full." |
| **Scarcity** | Cohort scarcity — doors close Friday, next cohort in 3 months |
| **Name** | "The $5K Sales Page Bootcamp" |
| **Price** | $1,997 pay-in-full OR $797 × 3 |

Same modules. Same instructor. ~4x conversion. Lower refund rate (conditional guarantee qualifies).

**Lesson:** rename the outcome, add proof, install a real scarcity mechanic.

---

## Example 3: $97 Notion template pack

### Before

**The offer:**
> Notion templates for marketers. $97. 20 templates included.

**Diagnostic:**
- Dream outcome: 6 (clear what you get, less clear what you achieve with it)
- Perceived likelihood: 6 (templates work for some, less for others — no proof)
- Time delay: 8 (instant access)
- Effort & sacrifice: 5 (setup work to customize each template)

**Lowest binding constraint:** perceived likelihood + dream outcome. "Will these actually save me time, for *my* setup?"

### After

| Component | What changed |
|-----------|--------------|
| **Core** | "The Marketing Ops Stack — 20 Notion templates that turn your scattered docs into a working marketing OS in one Saturday" — outcome-framed |
| **Bonuses** | (1) 10-minute "do this first" Loom — speed bonus; (2) "Stack the templates" flowchart (visual setup map); (3) Lifetime updates as templates are added |
| **Guarantee** | "30-day no-questions money-back" — unconditional, fits the price point |
| **Scarcity** | Founding-buyer pricing — $97 for the first 200 buyers, then $147 |
| **Name** | "The Marketing Ops Stack" |
| **Price** | $97 pay-in-full |

Same templates. ~2x close rate from the same traffic. The differentiator was the "in one Saturday" outcome anchor and the Loom that proves the speed claim.

**Lesson:** for low-priced info products, the dream outcome and a fast first-win are the levers. Don't over-engineer the guarantee.

---

## Example 4: $50K B2B SaaS annual contract

### Before

**The offer:**
> Enterprise plan: $50K/year. Includes unlimited users, all features, dedicated support.

**Diagnostic:**
- Dream outcome: 5 (features-listed, not outcome-framed)
- Perceived likelihood: 5 (no roll-out plan, no time-to-value)
- Time delay: 3 (unclear when value starts; sales says "implementation varies")
- Effort & sacrifice: 4 (procurement + security review + IT integration + change management)

**Lowest binding constraint:** time delay. Enterprise buyers can't tolerate "implementation varies."

### After

| Component | What changed |
|-----------|--------------|
| **Core** | "Production-ready in 30 days, ROI by quarter end" — time-anchored |
| **Bonuses** | (1) Dedicated implementation engineer for 30 days; (2) Pre-built integration packs for top 5 platforms; (3) Custom training session for the buyer's team; (4) Quarterly business reviews with the buyer's CSM |
| **Guarantee** | "Not in production by day 30? You don't pay until you are." SLA-based. |
| **Scarcity** | Capacity-based: "We onboard 4 enterprise accounts per quarter. Next slot starts [date]." |
| **Name** | Tier name stayed "Enterprise" but added the engagement name "Strategic Onboarding" |
| **Price** | $50K annual → $50K annual with quarterly billing + paid 30-day pilot |

Same product. ~30% higher close rate, 50% shorter sales cycle. The pilot + SLA combination removed the procurement objection.

**Lesson:** for enterprise B2B, time-to-value IS the offer. Solve it explicitly.

---

## Example 5: $4K group coaching mastermind

### Before

**The offer:**
> Group coaching for founders. $4K/quarter. Includes 12 calls and Slack.

**Diagnostic:**
- Dream outcome: 5 (vague — "be a better founder")
- Perceived likelihood: 4 (one alumni testimonial, no methodology)
- Time delay: 6 (quarterly cadence reasonable)
- Effort & sacrifice: 7 (12 calls is real time)

**Lowest binding constraint:** dream outcome + perceived likelihood.

### After

| Component | What changed |
|-----------|--------------|
| **Core** | "12 founders, 12 weeks, one specific goal each — and a room that's seen it before" — peer-room positioning |
| **Bonuses** | (1) 1:1 onboarding call to set the personal goal; (2) Founder Library — 90 frameworks from past members; (3) 1:1 mid-quarter check-in; (4) Alumni access for 1 year after |
| **Guarantee** | "First two weeks — if it's not the room you wanted, full refund. After that, you're in." |
| **Scarcity** | Cohort size capped at 12 — once full, you're on the waitlist for next quarter |
| **Name** | "The Founders' Quarter" |
| **Price** | $4K/quarter pay-in-full OR $1,500 × 3 |

Same coach, same cadence. Higher close rate. Notably: members renew at ~70% (was ~35% before) because the "alumni access for 1 year" bonus changed the buying decision frame from "quarter" to "year."

**Lesson:** for coaching, the room IS the offer. Position the room, not the curriculum. Renewal-friendly bonuses lock in long-term LTV.

---

## Example 6: Agency retainer — content marketing

### Before

**The offer:**
> Content marketing retainer. $8K/month. 4 articles per month + SEO strategy.

**Diagnostic:**
- Dream outcome: 4 (output-described, not outcome-framed)
- Perceived likelihood: 5 (no case studies linking content to revenue)
- Time delay: 3 (SEO is slow; client expectations misaligned)
- Effort & sacrifice: 6 (interviews, reviews, approvals all on client side)

**Lowest binding constraint:** dream outcome (vague) and time delay (misaligned expectations).

### After

| Component | What changed |
|-----------|--------------|
| **Core** | "We own the content engine. You get organic-driven sales meetings by month 9, with measurable revenue attribution." — outcome + timeline |
| **Bonuses** | (1) Persona research kickoff (one-time); (2) Quarterly content audit + republish list; (3) Pre-vetted freelance writers with QA layer; (4) Quarterly executive readout |
| **Guarantee** | "First 30 days is a paid pilot — 4 published pieces + 3 keyword roadmap. If at the end you don't see a clear 12-month path, we end the engagement, no balance owed." |
| **Scarcity** | Capacity-based: "We take on 3 retainer clients per quarter. Next slot is [date]." |
| **Name** | Tier name: "Growth Retainer"; engagement name: "The 90-Day Content Reset → 9-Month Growth Engine" |
| **Price** | $8K/month, 6-month minimum, OR $7K/month for 12-month commit |

Same writers. Same SEO methodology. ~2x close rate. 60% of pilots convert to 12-month commits.

**Lesson:** for slow-cycle services (SEO, brand, content), the offer has to address the timeline explicitly. "Trust us, results in 6 months" doesn't sell; "paid pilot → milestone at day 30 → ramp" does.

---

## Pattern across all six examples

Look at the changes side-by-side:

| Example | Core change | Most important other change |
|---------|-------------|----------------------------|
| Fractional CMO | Named it, added scope | First-milestone guarantee |
| Copywriting course | Outcome-framed, added proof | Case studies bonus |
| Notion templates | "in one Saturday" anchor | First-step Loom bonus |
| B2B SaaS | Time-to-value commitment | SLA-based guarantee + pilot |
| Coaching mastermind | Positioned the room, not the coach | 1-year alumni access bonus |
| Agency retainer | Outcome + timeline framing | Paid pilot guarantee |

**The pattern:** in every case, the price barely moved (or didn't move at all). What moved was the *structure* of the offer — naming, framing, guaranteeing, sequencing.

The price is the comparison. The value is the offer.

### references/guarantee-design.md

# Guarantee Design

A guarantee directly raises *perceived likelihood of achievement* (the buyer thinks: "they'll only offer this if they're confident") and lowers *effort & sacrifice* (less emotional risk). It's one of the highest-leverage levers in offer design.

The wrong guarantee hurts more than no guarantee. Pick the type that matches your business model.

## The eight guarantee types

| Type | What it promises | When it works | When it backfires |
|------|------------------|---------------|-------------------|
| 1. **Unconditional money-back** | "Refund anytime within X days, no questions" | Low-priced info, high-trust audience | High-priced/high-touch; refund risk eats margin |
| 2. **Conditional money-back** | "Refund if you complete X and still don't see Y" | Courses, programs requiring effort | Sophisticated buyers; harder to honor publicly |
| 3. **Better-than-money-back** | "If it doesn't work, full refund + $X" | Confident delivery, ample margin | If you fail; the few failures explode publicly |
| 4. **Service-level / SLA** | "If we don't deliver X by Y, your money back" | Productized services, agency work | Vague SLAs you can't measure |
| 5. **Performance-based** | "Pay only when X happens" (rev share, results-based) | Sophisticated B2B, high-confidence delivery | Long cycles, hard-to-attribute outcomes |
| 6. **Anti-guarantee** | "No refunds. Make sure you want it." | Premium audiences, mature buyers | Confused / first-time buyers; reads cold |
| 7. **Outcome-or-extension** | "If you don't get X by Y, we continue free" | Coaching, services with extendable time | Open-ended cost; choose with care |
| 8. **Comparison guarantee** | "Beat [competitor]'s result or refund" | When you can credibly compare | When you can't measure the competitor cleanly |

---

## Picking the right one

Decision tree:

1. **What's your buyer's biggest perceived risk?**
   - "What if it doesn't work?" → money-back family (1, 2, 3)
   - "What if you don't deliver on time?" → SLA (4)
   - "What if I pay and get no results?" → performance-based (5) or outcome-or-extension (7)
   - "Is this real or scam?" → comparison or specificity-based (8)

2. **What's your refund tolerance?**
   - Can absorb refunds at scale → unconditional (1)
   - Need to qualify refunders → conditional (2)
   - Confident enough to add a bonus on top → better-than-money-back (3)
   - Can't afford refunds at all → anti-guarantee (6) or no guarantee + strong proof

3. **What's your buyer sophistication?**
   - Premium / mature buyers → anti-guarantee can work; "we don't do refunds" reads as confidence
   - First-time-in-category buyers → strong refund guarantee; they need permission to try
   - Sophisticated B2B → SLA or performance-based; they expect commercial terms

4. **How measurable is the outcome?**
   - Clean and measurable → performance-based, comparison, or outcome-or-extension
   - Fuzzy / subjective → money-back family with a conditional gate (you completed the work)

---

## Examples by business type

### Course / cohort

**Strong:** "Complete all six modules within 60 days, submit the final exercise, and if you haven't [specific outcome] we refund in full." Conditional on effort, clear on outcome.

**Weak:** "100% money-back guarantee." No conditions = refund magnet for buyers who never engaged.

### Coaching / consulting

**Strong:** "After the first two sessions, if you don't think the engagement will deliver, we end it and refund the unused balance." Mid-engagement off-ramp builds trust.

**Weak:** "Satisfaction guaranteed." Means nothing.

### Productized service / agency retainer

**Strong:** "First month is a paid pilot. At the end, if you don't see [specific milestone], you don't pay for month 2 and we end on good terms." Clear gate, clear out.

**Weak:** "We'll work until you're happy." Open-ended cost. Don't.

### High-ticket info product (community, mastermind)

**Strong (premium audience):** "No refunds. The application process is rigorous because the value is real. If you're not sure, don't apply yet." Anti-guarantee works here.

**Weak (premium audience):** Generic 30-day refund. Reads cheap.

### Low-ticket info product (template, swipe file)

**Strong:** "30-day no-questions refund." The transactional bar is "I bought it, looked at it, didn't want it." Unconditional fits.

**Weak:** No guarantee. The buyer's risk is too high for the price.

### SaaS

**Strong:** Free trial *or* annual-prepay-with-money-back-in-first-30-days. Reduces friction without locking in unhappy users.

**Weak:** "Cancel anytime" alone — not a guarantee, just standard SaaS terms.

### Direct response / paid traffic

**Strong:** Double-your-money-back or comparable risk inversion. Direct-response buyers expect risk-reversal-heavy offers.

**Weak:** Vanilla 30-day refund. Doesn't differentiate from every other ad on the platform.

---

## Writing the guarantee

The guarantee text matters. Patterns that work:

**Specific terms:**
> If, after completing the first 4 weeks of the program, you can't point to one specific business outcome you've achieved, email us and we'll refund 100%.

**Confident tone:**
> We know this works. If it doesn't for you, we don't want your money.

**Acknowledge the awkwardness:**
> Guarantees feel slimy. Here's ours anyway: if you do the work in modules 1–3 and don't see meaningful traction, we refund.

**Patterns that don't work:**

- "100% satisfaction guaranteed!" — generic, low-trust
- "Lifetime guarantee" — meaningless without conditions
- Multiple stacked guarantees — sophistication-collapsing
- Guarantees full of legalese — buyers skim and assume the worst

---

## Common mistakes

### Promising more than you can deliver

"Double your revenue or your money back + $1,000." If even 1 in 50 buyers fails and gets the bonus refund + writes a public review, the offer is permanently damaged.

Stress-test: what happens if 10% of buyers invoke the guarantee?

### Conditional guarantees with too many conditions

"Refund if you watched all 24 modules, completed the 6 exercises, attended every live call, and posted in the community at least once per week."

Buyers read this as "they made it impossible to actually get a refund." Trust drops.

Two conditions max. Three only if they're closely related (e.g., "completed the course AND submitted the final project AND emailed us a question").

### Hiding the guarantee in the fine print

If your guarantee is your strongest perceived-likelihood lever, *put it on the sales page in 24pt text*. Move it above the buy button.

### Forgetting to test it

Re-read your guarantee text every six months. The wording that worked a year ago may now be undermined by something you've changed about your offer.

### Treating guarantees as a substitute for proof

Strong proof + weak guarantee > strong guarantee + weak proof. Order matters. Build proof first, then layer on the guarantee.

---

## The honest case for NO guarantee

Anti-guarantees ("no refunds, this is final") work when:

- Buyer sophistication is high
- Application or qualification process precedes the sale
- Price is premium-to-luxury
- Brand is established
- Proof is overwhelming

What you're saying: "We don't need a guarantee because the work is real, the buyer has self-qualified, and we won't engage in transactional refund games."

The wrong audience reads this as cold or scammy. The right audience reads it as confidence. Know your buyer.

---

## The diagnostic

When auditing an offer with no guarantee (or a weak one), ask:

1. **What's the buyer's actual risk?** Make it concrete. ("$2K and I might not get more clients.")
2. **What guarantee structure reverses that specific risk?** Match it to one of the eight types.
3. **What's your honest refund tolerance?** Calculate refund rate × refund cost; can you sustain it?
4. **Does the guarantee match your audience sophistication?** Premium buyers want anti-guarantee; first-time buyers want unconditional.

Most offers don't have the wrong guarantee — they have *no* guarantee at all. Adding any guarantee is almost always a lift. Adding the right one is the lever.

### references/offer-anatomy.md

# Offer Anatomy

A complete offer has six components. Skip any one and conversion suffers — usually noticeably.

## The six components

| # | Component | Question it answers | Where it fails |
|---|-----------|---------------------|----------------|
| 1 | **Core deliverable** | What do they get? | Too vague, or pitched as features instead of outcome |
| 2 | **Bonus stack** | What else do they get that makes the core feel undervalued? | Either no bonuses, or inflated/fake bonuses |
| 3 | **Guarantee** | What happens if it doesn't work? | None, wrong type, or over-promising |
| 4 | **Scarcity / urgency** | Why now, not later? | None, fake, or destructively manipulative |
| 5 | **Name** | What is this thing called? | Generic, internal-jargon, or no name at all |
| 6 | **Price + payment structure** | What do they pay and how? | Single number with no payment flexibility |

---

## 1. Core deliverable

The thing they actually get.

### Define it as an outcome, not a feature list

- **Feature-pitched (weak):** "6 modules, 24 lessons, weekly calls, private community."
- **Outcome-pitched (strong):** "A working customer-acquisition system that brings 5 qualified leads per week within 60 days — built with you, not handed to you."

The features still matter — buyers want to know what they're getting — but the *frame* is the outcome. Features support the outcome, they don't replace it.

### Define the scope explicitly

What's in. What's out. What's optional. Buyers buy clarity; ambiguity erodes perceived likelihood.

Example scope statement:
```
Includes:
- 90-day program with weekly live calls (recorded)
- Private Slack with daily founder access
- 12 fill-in-the-blank templates
- 1 90-minute strategy session with a senior strategist

Doesn't include:
- 1:1 calls outside the strategy session
- Implementation of the work (you/your team does this; we coach)
- Tools and software (you provide; we recommend specific stacks)
```

### Match the depth to the buyer's stage of awareness

Sophisticated buyers want the methodology and scope. New-to-category buyers want the dream outcome and proof. Read your audience.

---

## 2. Bonus stack

What you add to make the core feel undervalued at the asking price.

Bonuses do three jobs at once:
1. **Raise perceived value** of the total offer
2. **Lower perceived risk** — even if the core underdelivers, "I got X for free"
3. **Close specific objections** — each bonus can target a different buying objection

### How to construct bonuses

For each major objection your buyer has, add a bonus that closes it:

| Objection | Targeted bonus |
|-----------|---------------|
| "I don't have time to implement this" | Done-for-you setup, day 1 |
| "I don't know which tools to use" | Pre-vetted tool stack with discount codes |
| "What if I get stuck?" | 30-day async support |
| "I'm not sure my team will buy in" | Stakeholder pitch deck for your team |
| "I've tried something like this before and it didn't work" | Case study of someone in your exact situation |

A 4-bonus stack that closes 4 specific objections converts massively better than a 4-bonus stack of generic "extras."

### Don't inflate

"$50,000 in bonuses!" on a $500 offer reads as scam. The asymmetry destroys trust.

Bonuses should:
- Have a stated value the buyer can verify (compare to a comparable product)
- Total to less than 2x the price (e.g., a $1K offer can have ~$1.5K in bonuses comfortably)
- Be things you'd actually sell separately if you wanted

For the full bonus-stacking framework, see [bonus-stacking.md](bonus-stacking.md).

---

## 3. Guarantee

What happens if it doesn't work.

A guarantee directly raises perceived likelihood of achievement (the buyer thinks: "they'll only offer this if they're sure"). It also lowers effort & sacrifice (less emotional risk).

The wrong guarantee can hurt:
- Over-promising guarantees attract refund-seekers
- Generic "100% guaranteed" with no conditions reads as legally unenforceable
- No guarantee at all signals you're not confident

The right type depends on your business model, refund risk tolerance, and buyer sophistication. For the full taxonomy, see [guarantee-design.md](guarantee-design.md).

---

## 4. Scarcity / urgency

The reason to buy now, not later.

Two flavors:
- **Scarcity** — limited *quantity* (cohort size, seats, inventory, batch)
- **Urgency** — limited *time* (cohort deadline, season, bonus expiry)

The bar: **the scarcity has to be real.** Fake countdown timers and "only 3 spots left" lies work once and torch trust permanently. The internet is small; you will be caught.

Common honest scarcity formats:
- Cohort closes Friday (because the cohort actually starts Monday)
- Founding-member pricing for the first 20 customers (because you're capacity-constrained)
- Seasonal product or service (because demand is seasonal)
- Bonus expires at launch end (because the bonus is your time)
- Capacity-based service tier (because you literally can't take more clients)

For full guidance on creating real scarcity, see [scarcity-urgency.md](scarcity-urgency.md).

---

## 5. Name

What this thing is called.

A named offer beats an unnamed offer for three reasons:
1. **Repeatability** — buyers can tell their friend about it
2. **Distinction** — a name makes it a *thing*, not a generic service
3. **Pricing power** — branded offers can charge more than the same delivery sold as a service

### Naming patterns that work

- **Outcome-named:** "The 30-Day Activation Sprint" — names what they get
- **Methodology-named:** "The VAULT Framework" — names how you do it
- **Identity-named:** "Founder Marketing OS" — names who it's for
- **Compression-named:** "5-Day Cohort" — names the timing/structure

### Naming patterns that don't work

- **Generic descriptors:** "Marketing Coaching Program" — forgettable
- **Internal jargon:** "Tier 2 Standard" — buyer can't repeat
- **Course-bro:** "The Money-Making Machine" — pattern-matches to scam
- **Pun-overload:** "GrowthGoGetter" — reads as low-status

### Practical test

Can a buyer text a friend: "I just signed up for *the [name]*. It's $X and you get [one-line outcome]"? If yes, the name works. If no, rename.

---

## 6. Price + payment structure

The price is the obvious part. The structure is the underrated part.

### Price isn't a number, it's a comparison

Buyers compare the price to:
- The dream outcome (does this get me the result I want?)
- The next-best alternative (what else could I buy?)
- The cost of doing nothing (what does the status quo cost me?)
- Other items in your own catalog (anchor pricing)

You can move price perception without changing the number by:
- Showing the cost of doing nothing more vividly
- Anchoring against a higher-priced alternative
- Sequencing other items in your catalog at higher prices first

### Payment structure is its own lever

Same total price, different structures convert very differently:

| Structure | When it works | Trade-off |
|-----------|---------------|-----------|
| **Pay in full** | High-trust buyers, lower price points | Highest perceived commitment, smallest buyer pool |
| **Pay in 2-4 installments** | Mid-range price, hesitant buyers | More buyers, payment defaults |
| **Monthly subscription** | SaaS, ongoing services | Annuity revenue, churn risk |
| **Pay-after-results** | High-confidence delivery, sophisticated buyers | Cash flow lag, fewer disputes |
| **Down payment + balance on delivery** | Services with milestone-based delivery | Balance risk on backend |
| **Free trial → paid** | Low-friction SaaS, info products | Conversion drop-off |

Often the right move isn't lowering price — it's adding a payment plan. Same $6K price, "$6K today" vs "$2K × 3 monthly" converts very differently.

---

## Putting it together: an example

A B2B fractional CMO service.

| Component | Weak version | Strong version |
|-----------|--------------|----------------|
| **Core** | "Fractional CMO services" | "8-week marketing audit + 90-day execution plan, delivered by a CMO who's done it for 3+ similar companies" |
| **Bonuses** | None | (1) 1:1 weekly check-ins for 90 days; (2) pre-vetted execution-partner introductions; (3) board-deck for marketing strategy section |
| **Guarantee** | None | "If after the 8-week audit you don't have a clear 90-day plan you'd run yourself, you don't pay the audit fee" |
| **Scarcity** | None | "We take 2 engagements per quarter — next slot opens [date]" |
| **Name** | "fCMO Consulting" | "The 90-Day Marketing Reset" |
| **Price** | "$15K, paid up front" | "$15K → $5K to start, $5K at week 8, $5K at week 16" |

Same delivery. Same person. Different offer. Different conversion.

The point: most "we need to lower our price" conversations are actually "we have one of six components missing or weak" conversations.

### references/offer-formats.md

# Offer Formats by Business Type

The right offer format depends on what you sell. The same six components (core, bonuses, guarantee, scarcity, name, price) get assembled differently by business type.

This reference is organized by business type. Find yours, then use the format as a starting point — not a fixed recipe.

---

## Service / freelance

You sell your time and skill.

### Default format

| Component | Default |
|-----------|---------|
| **Core** | A scoped engagement with a specific deliverable and timeline |
| **Bonuses** | Templates, frameworks, post-engagement support, tool stack |
| **Guarantee** | First-milestone gate (paid pilot or first-deliverable refund) |
| **Scarcity** | Capacity-based (next slot opens [date]) |
| **Name** | Methodology-named or outcome-named (e.g., "The 30-Day Activation Sprint") |
| **Price** | Project-based with down-payment, or monthly retainer |

### What to watch

- **Naming matters disproportionately** — services without named offers compete on price; named services compete on positioning
- **Scope creep is the offer killer** — define what's in, out, and optional, *in writing*, before the engagement starts
- **Bonuses should compound the deliverable** — templates and frameworks that make the buyer self-sufficient after the engagement, not during

### Productizing the offer

Move from "I sell consulting" to "I sell the 8-Week Marketing Reset." Same delivery, different offer.

The productized version:
- Has a name
- Has a fixed scope and timeline
- Has a fixed price
- Has the same bonuses every time
- Has a defined gate (week 4 check-in, paid pilot, milestone review)

Productizing raises perceived value, simplifies sales, and creates a repeatable case-study factory.

---

## Course (async, cohort-based, live)

You sell structured learning.

### Default format

| Component | Default |
|-----------|---------|
| **Core** | The curriculum + delivery format |
| **Bonuses** | Templates, swipe files, case studies, community access |
| **Guarantee** | Conditional money-back (completion-gated) |
| **Scarcity** | Cohort scarcity (enrollment closes [date]) |
| **Name** | Outcome-named or methodology-named |
| **Price** | Pay-in-full or 2–4 installments |

### Async vs cohort-based

| Decision | Async | Cohort |
|----------|-------|--------|
| **Pricing** | Lower ($297–$1,997) | Higher ($1,497–$5,000+) |
| **Scarcity** | Bonus expiry, price increases | Cohort start date |
| **Guarantee** | Generous unconditional | Conditional on completion |
| **Conversion mechanic** | Email funnel, evergreen webinar | Launch window + cohort deadline |
| **Default bonus** | Templates, swipes | Slack + office hours + 1:1 review |

### What to watch

- **Completion is the marketing asset** — every completer is a case study. Engineer the first win in week 1.
- **Cohort scarcity must be real** — if "doors close Friday" is followed by "doors reopen Monday because we extended the cohort," the trick gets noticed
- **Refund design matters more than refund rate** — a generous-sounding guarantee with smart conditions converts well and refunds rarely

---

## Coaching (1:1, group, mastermind)

You sell access to your expertise applied to their specific situation.

### Default format

| Component | Default |
|-----------|---------|
| **Core** | Sessions + asynchronous access + specific outcome focus |
| **Bonuses** | Resources from your library, intro to network, post-engagement check-ins |
| **Guarantee** | Outcome-or-extension or first-two-sessions out |
| **Scarcity** | Capacity-based (N spots / quarter) |
| **Name** | Identity-named or outcome-named (e.g., "Founder Marketing Mastermind") |
| **Price** | Monthly retainer or 3/6/12-month engagement |

### 1:1 vs group

| Decision | 1:1 | Group / mastermind |
|----------|-----|---------------------|
| **Pricing** | $1,500–$10,000+/mo | $497–$2,500+/mo |
| **Scarcity** | Capacity (4–10 1:1 clients) | Cohort size (8–30 members) |
| **Guarantee** | First-two-sessions out | Trial period, no refunds after |
| **Bonuses** | Custom resources, intros | Group access, peer accountability, library access |
| **Default delivery** | Weekly or biweekly sessions | Monthly group calls + community |

### What to watch

- **Identity is the offer** — group coaching is often more about being in the room with peers than about the coach's instruction. Name the room, not the coach.
- **Onboarding is part of the offer** — a sloppy intake destroys perceived likelihood
- **Renewal is the real conversion event** — design for the 6-month decision, not the first-month decision

---

## Info product (guide, swipe file, template pack, community)

You sell packaged knowledge or assets.

### Default format

| Component | Default |
|-----------|---------|
| **Core** | The asset(s) + lifetime access |
| **Bonuses** | Adjacent assets, walkthroughs, templates |
| **Guarantee** | Generous unconditional (30-day no-questions) |
| **Scarcity** | Bonus expiry, price-increase scheduling |
| **Name** | Outcome-named, often punchy and specific |
| **Price** | $29–$497, pay-in-full |

### What to watch

- **The first-impression matters disproportionately** — the buyer opens it once. If the first 5 minutes don't feel premium, they don't engage with the rest
- **Quick-start is a bonus** — pair the asset with a 10-minute "do this first" walkthrough
- **Lifetime access is implicit pricing** — clarify what "lifetime" means (yours, the product's, until you sunset it)

---

## High-ticket B2B ($5K+ ACV, sales-led)

You sell to companies with a sales conversation.

### Default format

| Component | Default |
|-----------|---------|
| **Core** | A multi-month engagement or annual contract |
| **Bonuses** | Onboarding, training, integration, dedicated CSM |
| **Guarantee** | SLA, performance-based, or pilot-gated |
| **Scarcity** | Quarter-end pricing, capacity (N onboardings/quarter), tier limits |
| **Name** | Internal-stable (e.g., "Enterprise Plan") + named engagement type (e.g., "Strategic Onboarding") |
| **Price** | Annual contract with quarterly payment, often custom |

### What to watch

- **Buying committee, not buyer** — the offer has to land with the champion, the economic buyer, and the influencer simultaneously
- **Procurement is the offer** — your terms (payment, NET 60, security review, MSA) are part of the offer; rigid terms lose deals
- **Pilot offers convert sophisticated buyers** — "30-day paid pilot, decide to continue at end" reduces decision risk
- **The CSM is part of the offer** — buyers consistently rate post-sale relationship as part of the offer-perceived-value

---

## Agency retainer

You sell ongoing service delivery.

### Default format

| Component | Default |
|-----------|---------|
| **Core** | Monthly deliverables + dedicated team + reporting cadence |
| **Bonuses** | Strategy sessions, tool access, audit credits, library access |
| **Guarantee** | Month-1 paid pilot or 90-day out clause |
| **Scarcity** | Capacity (N clients / vertical / quarter) |
| **Name** | Tier-named ("Growth," "Scale," "Enterprise") + service line |
| **Price** | Monthly retainer with discount for annual commit |

### What to watch

- **Onboarding velocity is the offer** — agencies that take 6 weeks to start delivering lose to agencies that deliver something in week 1
- **Reporting is part of the offer** — clean, monthly, action-oriented reporting reduces churn more than additional deliverables
- **Tier upgrades are the easiest revenue** — design tiers with clear value-step-ups so upgrade conversations are obvious

---

## Self-serve SaaS

You sell a tool with tiered subscriptions.

### Default format

| Component | Default |
|-----------|---------|
| **Core** | Tiered subscription with clear feature differentiation |
| **Bonuses** | Free onboarding, templates, integrations, partner discounts |
| **Guarantee** | Free trial OR annual-with-30-day-refund |
| **Scarcity** | Founding-pricing for first N customers, or seasonal launches |
| **Name** | Tier-named ("Starter," "Pro," "Team," "Enterprise") |
| **Price** | Monthly or annual with discount, value-metric-based |

### What to watch

- **Pricing tier > offer construction** — for self-serve SaaS, packaging and value metric do more work than guarantees and bonuses. Use the `pricing` skill.
- **Free trial design IS offer design** — length, gated features, credit-card-required vs not, automatic conversion. Each is an offer decision.
- **Annual prepay is the offer lever** — same product, different commitment, often 20–40% discount. Many SaaS conversion lifts come from improving the annual offer, not the monthly.

For SaaS, this skill is supplemental. Read [`pricing`](../../pricing/SKILL.md) first.

---

## Direct response / paid traffic

You sell from a sales page or VSL to cold traffic.

### Default format

| Component | Default |
|-----------|---------|
| **Core** | The "thing" + clear payoff |
| **Bonuses** | Heavy bonus stack (5–7 bonuses, layered values) |
| **Guarantee** | Aggressive risk reversal (better-than-money-back, double guarantee) |
| **Scarcity** | Real time-bound (launch window, evergreen with hard close) |
| **Name** | Hooky, often pattern-interrupt |
| **Price** | Often single-payment with payment plan offered |

### What to watch

- **Direct-response buyers expect aggression** — quiet, premium-feeling offers convert badly on cold paid traffic. The aesthetic of the page matters as much as the offer.
- **Refund rates can be 10–20%** — bake this into the math. If margin can't survive 15% refunds, restructure.
- **The first 7 seconds determine the rest** — hook, then offer

This format is high-skill. If you're not from a direct-response background, hire someone or partner with someone who is.

---

## Choosing your format

If you're not sure which format applies, pick the closest match and adapt. The biggest mistake is borrowing a format from a different business type (e.g., applying direct-response bonus stacking to a premium B2B service — wrong audience, wrong aesthetic).

Two diagnostic questions:

1. **Who buys it, and how sophisticated are they?** Premium B2B and direct-response cold traffic both buy, but they need different offers.
2. **What's the dominant constraint?** Service businesses are capacity-constrained, SaaS is pricing-tier-constrained, courses are cohort/season constrained. Match the scarcity format to the real constraint.

For worked examples by business type, see [examples.md](examples.md).

### references/scarcity-urgency.md

# Scarcity & Urgency

The reason to buy now, not later.

This is the most misused offer lever in the industry. Done right, it's a meaningful conversion lift and a respect-the-buyer's-time gesture. Done wrong (fake countdown timers, lies about inventory), it converts once and torches trust permanently.

The repo voice: **only ship real scarcity.** If the scarcity is fake, take it off the page.

## Scarcity vs urgency

| | What it limits | Examples |
|---|---|---|
| **Scarcity** | Quantity | Cohort size, seats, inventory, batch, capacity |
| **Urgency** | Time | Cohort deadline, season, bonus expiry, price increase |

Both work via the same mechanism — they convert "I'll think about it" into "decide now." The difference is what enforces the decision: a limit on how many, or a limit on when.

---

## Honest scarcity formats

The bar: **the constraint has to be real.** Here are the formats that work without lying.

### Capacity-based scarcity

You can only deliver to N customers at a time. The next slot opens when one finishes.

> "We take 2 fractional CMO engagements per quarter. Next slot opens September 15."

Works for: services, agencies, coaching, consulting, anything labor-bound.

### Cohort scarcity

The class starts on a date. After the date, the door closes until the next cohort.

> "Cohort 7 starts October 1. Doors close September 28. Next cohort: January."

Works for: courses, programs, group coaching, anything synchronous.

### Founding-member pricing

The first N buyers get a different price. After that, the price goes up.

> "Founding pricing — $497/mo for the first 50 members. After we hit 50, the price moves to $797/mo."

Works for: SaaS, communities, memberships. Critical: actually raise the price when you hit 50. Otherwise it was a lie.

### Inventory-based scarcity

You have N units. When they're gone, they're gone.

> "We're only producing 100 of the print edition. Sold out, no reprints."

Works for: physical products, limited-run digital, bespoke services.

### Seasonal scarcity

Demand or capacity is seasonal.

> "Tax-prep service for Q1 2026 closes January 15. After that, we focus on existing clients only until April."

Works for: tax, retail Q4, events, education enrollment, anything calendar-bound.

### Bonus expiry

A bonus is available only until X date. The core offer stays the same; the *added value* expires.

> "Order by Friday and the 1:1 onboarding session is included. After Friday, the offer is the same but onboarding is +$497."

Works for: anything with a launch window. Critical: actually remove the bonus when the date hits.

### Price-increase scheduling

The price goes up on a date. Communicate it transparently.

> "On November 1, the program moves from $1,997 to $2,497. Anyone enrolled before November 1 keeps the $1,997 price for life."

Works for: courses, SaaS, communities. Builds credibility because the buyer can verify it later.

---

## Fake scarcity to avoid

Pattern-match and rip these off your page:

### Countdown timers that reset

The timer hits 0:00 and refreshes. The buyer comes back tomorrow, same timer, same urgency. Every buyer who notices loses trust.

If you use a countdown, it ends on a real date. After that date, the discount or bonus actually ends — verifiably.

### "Only 3 spots left"

Especially on digital products where there's no capacity constraint. Especially when the number stays at "3" for weeks.

Use this only when the constraint is real (cohort, capacity, inventory) AND when the number reflects reality.

### Manufactured FOMO

"127 people are looking at this page right now."

These can be honest on some platforms (Booking.com etc.) when they reflect actual traffic. They're dishonest when fabricated. Buyers increasingly assume fabrication.

### Bonus "stacking" that's always available

"This bonus expires at midnight!" — but every page on the site says the same thing at midnight every night.

The bonus has to actually expire, or the line is a lie.

### "Last chance" emails for things that aren't actually last chance

Repeated "FINAL HOURS" emails that send weekly. Every recipient who notices unsubscribes or stops opening.

Use "last chance" once. If you use it multiple times, you've taught your list that "last chance" is meaningless.

---

## Why fake scarcity is uniquely costly

Buyers compare notes. The internet is small.

- One Reddit post about a fake countdown becomes the top Google result for your brand
- One screenshot of "only 3 left" staying at 3 for a month becomes a viral thread
- One "last chance" email that wasn't goes into a "marketing fails" newsletter

Real scarcity converts ~the same as fake scarcity at the moment of purchase. The difference shows up at month 6, when fake-scarcity offers are facing trust collapse and real-scarcity offers are still compounding.

If you have to fake it, you don't have an offer-design problem — you have a value-equation problem. Go back to [value-equation.md](value-equation.md).

---

## When scarcity isn't needed

Some offers don't need scarcity:

- **Subscription products** that customers can cancel anytime — the natural friction is low enough
- **Low-priced impulse products** ($5–30) — the deliberation is short; scarcity feels forced
- **Premium / luxury brands** — scarcity is implicit in the positioning; explicit scarcity reads as low-status
- **High-trust audiences** who already know they'll buy — scarcity is unnecessary friction

Don't force scarcity into offers that don't need it. The forced version is worse than no scarcity.

---

## The diagnostic

For an existing offer with weak or no scarcity:

1. **Is there a real constraint?** Capacity, cohort, inventory, season, batch. Find the real one.
2. **What's the honest version of that constraint?** Write it in plain English.
3. **Can the buyer verify it?** If you say "founding pricing for the first 50 members," can the buyer see the count?
4. **Are you willing to actually enforce it?** When the constraint hits, do you have the discipline to actually close the door / raise the price / remove the bonus?
5. **Where on the page does the scarcity appear?** It should be next to the buy button, not buried.

If you can't find a real constraint, don't ship scarcity. The "trick" of fake scarcity is one of the most expensive shortcuts in marketing. The honest version is usually cheaper than people think — every business has *some* real constraint (capacity, calendar, batch, attention).

---

## Pairing with the rest of the offer

Scarcity is the final lever. It only works if the rest of the offer is strong.

- Strong offer + real scarcity = the buyer decides now
- Weak offer + scarcity = the buyer decides not to buy, faster

If conversions are bad, scarcity is rarely the first thing to fix. Run the diagnostic from [value-equation.md](value-equation.md) first.

The order is:
1. Strong dream outcome
2. Specific perceived likelihood (proof + methodology + guarantee)
3. Compressed time delay
4. Reduced effort & sacrifice
5. *Then* scarcity to get the decision now

Scarcity is the close, not the offer.

### references/value-equation.md

# The Value Equation

The single most useful frame for offer design. Originated in Alex Hormozi's *$100M Offers*; the underlying idea (multiply benefits, divide costs) is much older — direct-response copywriters have been doing it for a century.

## The formula

```
              Dream Outcome  ×  Perceived Likelihood of Achievement
  Value  =  ─────────────────────────────────────────────────────────
              Time Delay     ×   Effort & Sacrifice
```

The customer compares the *Value* score to the *Price*. If Value > Price, they buy. If not, they don't, no matter how good the copy is.

**Price is the comparison, not the value.** Most "lower the price" requests are actually "raise the numerator or lower the denominator" requests.

---

## Lever 1: Dream Outcome (numerator)

What the customer *actually* wants — usually one or two levels above the surface ask.

### Surface ask → dream outcome

| Surface ask | Dream outcome |
|-------------|---------------|
| "I want a website" | "I want more qualified leads I can close" |
| "I want to learn copywriting" | "I want to write copy clients pay me $5K+ per project for" |
| "I want a meal plan" | "I want to feel confident in a swimsuit on a beach in 12 weeks" |
| "I want fitness coaching" | "I want my back pain gone so I can pick up my kids without thinking about it" |
| "I want a Notion template" | "I want to feel in control of my work for the first time in years" |
| "I want to lower CAC" | "I want a marketing engine I can step away from for two weeks without things breaking" |

### How to increase

- **Name it specifically.** "Feel confident in a swimsuit" beats "lose weight." The specific name is the offer.
- **Connect to the bigger goal.** The dream outcome behind the surface ask is almost always emotional or identity-based.
- **Show the future state in concrete sensory terms.** What does the morning of day one *after they have it* actually look like?

### Common mistake

Pitching the surface ask. ("Get a website" instead of "get a website that brings you 5 qualified leads a week.") The bigger the buyer's pain, the more important this is — they're not buying a deliverable, they're buying a future.

---

## Lever 2: Perceived Likelihood of Achievement (numerator)

Do they actually believe they'll get the dream outcome? This is the single most underweighted lever — most offers are perfectly fine on the dream outcome side but the buyer just doesn't think it'll work *for them*.

### How to increase

- **Proof** — case studies with names, numbers, before/after metrics, photos. Specific > glossy.
- **Methodology specificity** — name your process. "The 5-step VAULT framework" beats "our proprietary system." Even if the substance is the same, naming it raises perceived likelihood.
- **Guarantees** — risk reversal directly raises perceived likelihood (more in [guarantee-design.md](guarantee-design.md)).
- **Reduce sample-of-one objection** — show people *like them* who got results. "Other people get results but I'm different" is the universal objection.
- **Pre-empt the failure path** — explicitly address what could go wrong and how you handle it. Builds trust faster than hiding the risk.

### Common mistake

Stacking more features ("we also include X, Y, Z") instead of stacking more proof. Features address dream outcome. Proof addresses likelihood. Most stuck offers need proof, not features.

---

## Lever 3: Time Delay (denominator)

How long from purchase to result. The denominator is doing a lot of work here — slow results don't just feel slow, they erode perceived likelihood (the longer it takes, the less the buyer believes it'll work).

### How to decrease

- **Faster first win** — find the smallest possible early result and engineer it into the first 7 days
- **Onboarding velocity** — replace a 60-minute kickoff with a 10-minute async intake + Loom send
- **Front-load the assets** — give the templates / swipe files / decks on day 1, not "throughout the program"
- **Faster end-to-end timeline** — "in 8 weeks" beats "in 6 months." If you can credibly compress, do.
- **Quick-start path** — explicit "first thing to do today" so they don't lose momentum

### Common mistake

Promising a faster timeline than you can deliver. The first time you miss it, perceived likelihood for every future buyer drops permanently as the failure story spreads.

---

## Lever 4: Effort & Sacrifice (denominator)

What the buyer pays *besides money* — time, learning curve, decisions, willpower, social risk, opportunity cost.

### How to decrease

- **Done-for-you over do-it-yourself** — DFY tiers move the effort to you. Charge accordingly.
- **Fewer decisions** — every decision the buyer makes is friction. Bundle, default, recommend.
- **Lower learning curve** — pre-built templates, examples, defaults. "We did the thinking, you do the executing."
- **Removed risk** — emotional risk (am I dumb if this doesn't work?), social risk (what will my team think?), opportunity cost (what am I not doing while I do this?). Address all three explicitly.
- **Async over live** — for many buyers (founders, executives), removing synchronous commitments is huge value
- **Less willpower required** — automation, accountability, environmental design

### Common mistake

Overestimating how much your buyer *enjoys* the work. They want the outcome, not the process. (Exception: identity-buyers — fitness, learning, mastery. For those, the process *is* part of the dream outcome. Read your buyer.)

---

## Diagnostic: scoring the levers

When an offer is stuck, score each lever 1–10 honestly. The lowest is the binding constraint.

### Quick scoring prompts

- **Dream outcome (1–10)**: Can the buyer picture, in concrete sensory terms, the day after this works? Is the outcome named specifically enough that they can repeat it back to a friend?
- **Perceived likelihood (1–10)**: Do they have at least three named, comparable proof points? Is the methodology specific enough to repeat? Have you addressed the "but my situation is different" objection?
- **Time delay (1–10)**: What's the first concrete win, and how soon do they get it? What's the end-to-end timeline? Are there any "delay surfaces" (onboarding lag, asset drip, week-1 friction)?
- **Effort & sacrifice (1–10)**: How much work does the buyer do? How many decisions? How much learning curve? How much synchronous time? How much emotional/social/opportunity-cost risk?

### Worked example: a stuck $3K copywriting course

Initial scoring:
- Dream outcome: 6 (`become a better copywriter` — too vague)
- Perceived likelihood: 4 (one testimonial, no methodology name)
- Time delay: 5 (6-month course, no first-win mechanic)
- Effort & sacrifice: 4 (lots of homework, live calls, weekly assignments)

Lowest: effort & sacrifice and perceived likelihood are tied. Pick one (perceived likelihood — easier to move and unblocks more downstream work):

- Name the methodology: "The VAULT framework — 5 angles every winning sales page uses"
- Add 8 named-customer case studies with before/after copy + revenue numbers
- Add an "even if you've never written before" cohort with 3 named graduates

After: perceived likelihood goes 4 → 8. Course converts at ~3x baseline. Two months later, attack effort & sacrifice (replace weekly live calls with async + 1 live Q&A).

---

## Key idea to internalize

**The price-vs-value comparison happens in the buyer's head, not yours.** You only know it's working when the buyer can articulate the dream outcome back to you in their own words, and when they don't need to ask "but does this actually work?"

If they're asking either of those questions, you have a value equation problem, not a copy problem.

