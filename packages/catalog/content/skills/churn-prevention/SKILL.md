---
name: churn-prevention
description: "When the user wants to reduce churn, build cancellation flows, set up save offers, recover failed payments, or implement retention strategies. Also use when the user mentions 'churn,' 'cancel flow,' 'offboarding,' 'save offer,' 'dunning,' 'failed payment recovery,' 'win-back,' 'retention,' 'exit survey,' 'pause subscription,' 'involuntary churn,' 'people keep canceling,' 'churn rate is too high,' 'how do I keep users,' or 'customers are leaving.' Use this whenever someone is losing subscribers or wants to build systems to prevent it. For post-cancel win-back email sequences, see emails. For in-app upgrade paywalls, see paywalls."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Churn Prevention

You are an expert in SaaS retention and churn prevention. Your goal is to help reduce both voluntary churn (customers choosing to cancel) and involuntary churn (failed payments) through well-designed cancel flows, dynamic save offers, proactive retention, and dunning strategies.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Current Churn Situation
- What's your monthly churn rate? (Voluntary vs. involuntary if known)
- How many active subscribers?
- What's the average MRR per customer?
- Do you have a cancel flow today, or does cancel happen instantly?

### 2. Billing & Platform
- What billing provider? (Stripe, Chargebee, Paddle, Recurly, Braintree)
- Monthly, annual, or both billing intervals?
- Do you support plan pausing or downgrades?
- Any existing retention tooling? (Churnkey, ProsperStack, Raaft)

### 3. Product & Usage Data
- Do you track feature usage per user?
- Can you identify engagement drop-offs?
- Do you have cancellation reason data from past churns?
- What's your activation metric? (What do retained users do that churned users don't?)

### 4. Constraints
- B2B or B2C? (Affects flow design)
- Self-serve cancellation required? (Some regulations mandate easy cancel)
- Brand tone for offboarding? (Empathetic, direct, playful)

---

## How This Skill Works

Churn has two types requiring different strategies:

| Type | Cause | Solution |
|------|-------|----------|
| **Voluntary** | Customer chooses to cancel | Cancel flows, save offers, exit surveys |
| **Involuntary** | Payment fails | Dunning emails, smart retries, card updaters |

Voluntary churn is typically 50-70% of total churn. Involuntary churn is 30-50% but is often easier to fix.

This skill supports three modes:

1. **Build a cancel flow** — Design from scratch with survey, save offers, and confirmation
2. **Optimize an existing flow** — Analyze cancel data and improve save rates
3. **Set up dunning** — Failed payment recovery with retries and email sequences

---

## Cancel Flow Design

### The Cancel Flow Structure

Every cancel flow follows this sequence:

```
Trigger → Survey → Dynamic Offer → Confirmation → Post-Cancel
```

**Step 1: Trigger**
Customer clicks "Cancel subscription" in account settings.

**Step 2: Exit Survey**
Ask why they're cancelling. This determines which save offer to show.

**Step 3: Dynamic Save Offer**
Present a targeted offer based on their reason (discount, pause, downgrade, etc.)

**Step 4: Confirmation**
If they still want to cancel, confirm clearly with end-of-billing-period messaging.

**Step 5: Post-Cancel**
Set expectations, offer easy reactivation path, trigger win-back sequence.

### Exit Survey Design

The exit survey is the foundation. Good reason categories:

| Reason | What It Tells You |
|--------|-------------------|
| Too expensive | Price sensitivity, may respond to discount or downgrade |
| Not using it enough | Low engagement, may respond to pause or onboarding help |
| Missing a feature | Product gap, show roadmap or workaround |
| Switching to competitor | Competitive pressure, understand what they offer |
| Technical issues / bugs | Product quality, escalate to support |
| Temporary / seasonal need | Usage pattern, offer pause |
| Business closed / changed | Unavoidable, learn and let go gracefully |
| Other | Catch-all, include free text field |

**Survey best practices:**
- 1 question, single-select with optional free text
- 5-8 reason options max (avoid decision fatigue)
- Put most common reasons first (review data quarterly)
- Don't make it feel like a guilt trip
- "Help us improve" framing works better than "Why are you leaving?"

### Dynamic Save Offers

The key insight: **match the offer to the reason.** A discount won't save someone who isn't using the product. A feature roadmap won't save someone who can't afford it.

**Offer-to-reason mapping:**

| Cancel Reason | Primary Offer | Fallback Offer |
|---------------|---------------|----------------|
| Too expensive | Discount (20-30% for 2-3 months) | Downgrade to lower plan |
| Not using it enough | Pause (1-3 months) | Free onboarding session |
| Missing feature | Roadmap preview + timeline | Workaround guide |
| Switching to competitor | Competitive comparison + discount | Feedback session |
| Technical issues | Escalate to support immediately | Credit + priority fix |
| Temporary / seasonal | Pause subscription | Downgrade temporarily |
| Business closed | Skip offer (respect the situation) | — |

### Save Offer Types

**Discount**
- 20-30% off for 2-3 months is the sweet spot
- Avoid 50%+ discounts (trains customers to cancel for deals)
- Time-limit the offer ("This offer expires when you leave this page")
- Show the dollar amount saved, not just the percentage

**Pause subscription**
- 1-3 month pause maximum (longer pauses rarely reactivate)
- 60-80% of pausers eventually return to active
- Auto-reactivation with advance notice email
- Keep their data and settings intact

**Plan downgrade**
- Offer a lower tier instead of full cancellation
- Show what they keep vs. what they lose
- Position as "right-size your plan" not "downgrade"
- Easy path back up when ready

**Feature unlock / extension**
- Unlock a premium feature they haven't tried
- Extend trial of a higher tier
- Works best for "not getting enough value" reasons

**Personal outreach**
- For high-value accounts (top 10-20% by MRR)
- Route to customer success for a call
- Personal email from founder for smaller companies

### Cancel Flow UI Patterns

```
┌─────────────────────────────────────┐
│  We're sorry to see you go          │
│                                     │
│  What's the main reason you're      │
│  cancelling?                        │
│                                     │
│  ○ Too expensive                    │
│  ○ Not using it enough              │
│  ○ Missing a feature I need         │
│  ○ Switching to another tool        │
│  ○ Technical issues                 │
│  ○ Temporary / don't need right now │
│  ○ Other: [____________]            │
│                                     │
│  [Continue]                         │
│  [Never mind, keep my subscription] │
└─────────────────────────────────────┘
         ↓ (selects "Too expensive")
┌─────────────────────────────────────┐
│  What if we could help?             │
│                                     │
│  We'd love to keep you. Here's a    │
│  special offer:                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  25% off for the next 3 months│  │
│  │  Save $XX/month               │  │
│  │                               │  │
│  │  [Accept Offer]               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Or switch to [Basic Plan] at       │
│  $X/month →                         │
│                                     │
│  [No thanks, continue cancelling]   │
└─────────────────────────────────────┘
```

**UI principles:**
- Keep the "continue cancelling" option visible (no dark patterns)
- One primary offer + one fallback, not a wall of options
- Show specific dollar savings, not abstract percentages
- Use the customer's name and account data when possible
- Mobile-friendly (many cancellations happen on mobile)

For detailed cancel flow patterns by industry and billing provider, see [references/cancel-flow-patterns.md](references/cancel-flow-patterns.md).

---

## Churn Prediction & Proactive Retention

The best save happens before the customer ever clicks "Cancel."

### Risk Signals

Track these leading indicators of churn:

| Signal | Risk Level | Timeframe |
|--------|-----------|-----------|
| Login frequency drops 50%+ | High | 2-4 weeks before cancel |
| Key feature usage stops | High | 1-3 weeks before cancel |
| Support tickets spike then stop | High | 1-2 weeks before cancel |
| Email open rates decline | Medium | 2-6 weeks before cancel |
| Billing page visits increase | High | Days before cancel |
| Team seats removed | High | 1-2 weeks before cancel |
| Data export initiated | Critical | Days before cancel |
| NPS score drops below 6 | Medium | 1-3 months before cancel |

### Health Score Model

Build a simple health score (0-100) from weighted signals:

```
Health Score = (
  Login frequency score × 0.30 +
  Feature usage score   × 0.25 +
  Support sentiment     × 0.15 +
  Billing health        × 0.15 +
  Engagement score      × 0.15
)
```

| Score | Status | Action |
|-------|--------|--------|
| 80-100 | Healthy | Upsell opportunities |
| 60-79 | Needs attention | Proactive check-in |
| 40-59 | At risk | Intervention campaign |
| 0-39 | Critical | Personal outreach |

### Proactive Interventions

**Before they think about cancelling:**

| Trigger | Intervention |
|---------|-------------|
| Usage drop >50% for 2 weeks | "We noticed you haven't used [feature]. Need help?" email |
| Approaching plan limit | Upgrade nudge (not a wall — paywalls handles this) |
| No login for 14 days | Re-engagement email with recent product updates |
| NPS detractor (0-6) | Personal follow-up within 24 hours |
| Support ticket unresolved >48h | Escalation + proactive status update |
| Annual renewal in 30 days | Value recap email + renewal confirmation |

---

## Involuntary Churn: Payment Recovery

Failed payments cause 30-50% of all churn but are the most recoverable.

### The Dunning Stack

```
Pre-dunning → Smart retry → Dunning emails → Grace period → Hard cancel
```

### Pre-Dunning (Prevent Failures)

- **Card expiry alerts**: Email 30, 15, and 7 days before card expires
- **Backup payment method**: Prompt for a second payment method at signup
- **Card updater services**: Visa/Mastercard auto-update programs (reduces hard declines 30-50%)
- **Pre-billing notification**: Email 3-5 days before charge for annual plans

### Smart Retry Logic

Not all failures are the same. Retry strategy by decline type:

| Decline Type | Examples | Retry Strategy |
|-------------|----------|----------------|
| Soft decline (temporary) | Insufficient funds, processor timeout | Retry 3-5 times over 7-10 days |
| Hard decline (permanent) | Card stolen, account closed | Don't retry — ask for new card |
| Authentication required | 3D Secure, SCA | Send customer to update payment |

**Retry timing best practices:**
- Retry 1: 24 hours after failure
- Retry 2: 3 days after failure
- Retry 3: 5 days after failure
- Retry 4: 7 days after failure (with dunning email escalation)
- After 4 retries: Hard cancel with reactivation path

**Smart retry tip:** Retry on the day of the month the payment originally succeeded (if Day 1 worked before, retry on Day 1). Stripe Smart Retries handles this automatically.

### Dunning Email Sequence

| Email | Timing | Tone | Content |
|-------|--------|------|---------|
| 1 | Day 0 (failure) | Friendly alert | "Your payment didn't go through. Update your card." |
| 2 | Day 3 | Helpful reminder | "Quick reminder — update your payment to keep access." |
| 3 | Day 7 | Urgency | "Your account will be paused in 3 days. Update now." |
| 4 | Day 10 | Final warning | "Last chance to keep your account active." |

**Dunning email best practices:**
- Direct link to payment update page (no login required if possible)
- Show what they'll lose (their data, their team's access)
- Don't blame ("your payment failed" not "you failed to pay")
- Include support contact for help
- Plain text performs better than designed emails for dunning

### Recovery Benchmarks

| Metric | Poor | Average | Good |
|--------|------|---------|------|
| Soft decline recovery | <40% | 50-60% | 70%+ |
| Hard decline recovery | <10% | 20-30% | 40%+ |
| Overall payment recovery | <30% | 40-50% | 60%+ |
| Pre-dunning prevention | None | 10-15% | 20-30% |

For the complete dunning playbook with provider-specific setup, see [references/dunning-playbook.md](references/dunning-playbook.md).

---

## Metrics & Measurement

### Key Churn Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| Monthly churn rate | Churned customers / Start-of-month customers | <5% B2C, <2% B2B |
| Revenue churn (net) | (Lost MRR - Expansion MRR) / Start MRR | Negative (net expansion) |
| Cancel flow save rate | Saved / Total cancel sessions | 25-35% |
| Offer acceptance rate | Accepted offers / Shown offers | 15-25% |
| Pause reactivation rate | Reactivated / Total paused | 60-80% |
| Dunning recovery rate | Recovered / Total failed payments | 50-60% |
| Time to cancel | Days from first churn signal to cancel | Track trend |

### Cohort Analysis

Segment churn by:
- **Acquisition channel** — Which channels bring stickier customers?
- **Plan type** — Which plans churn most?
- **Tenure** — When do most cancellations happen? (30, 60, 90 days?)
- **Cancel reason** — Which reasons are growing?
- **Save offer type** — Which offers work best for which segments?

### Cancel Flow A/B Tests

Test one variable at a time:

| Test | Hypothesis | Metric |
|------|-----------|--------|
| Discount % (20% vs 30%) | Higher discount saves more | Save rate, LTV impact |
| Pause duration (1 vs 3 months) | Longer pause increases return rate | Reactivation rate |
| Survey placement (before vs after offer) | Survey-first personalizes offers | Save rate |
| Offer presentation (modal vs full page) | Full page gets more attention | Save rate |
| Copy tone (empathetic vs direct) | Empathetic reduces friction | Save rate |

**How to run cancel flow experiments:** Use the **ab-testing** skill to design statistically rigorous tests. PostHog is a good fit for cancel flow experiments — its feature flags can split users into different flows server-side, and its funnel analytics track each step of the cancel flow (survey → offer → accept/decline → confirm). See the [PostHog integration guide](../../tools/integrations/posthog.md) for setup.

---

## Common Mistakes

- **No cancel flow at all** — Instant cancel leaves money on the table. Even a simple survey + one offer saves 10-15%
- **Making cancellation hard to find** — Hidden cancel buttons breed resentment and bad reviews. Many jurisdictions require easy cancellation (FTC Click-to-Cancel rule)
- **Same offer for every reason** — A blanket discount doesn't address "missing feature" or "not using it"
- **Discounts too deep** — 50%+ discounts train customers to cancel-and-return for deals
- **Ignoring involuntary churn** — Often 30-50% of total churn and the easiest to fix
- **No dunning emails** — Letting payment failures silently cancel accounts
- **Guilt-trip copy** — "Are you sure you want to abandon us?" damages brand trust
- **Not tracking save offer LTV** — A "saved" customer who churns 30 days later wasn't really saved
- **Pausing too long** — Pauses beyond 3 months rarely reactivate. Set limits.
- **No post-cancel path** — Make reactivation easy and trigger win-back emails, because some churned users will want to come back

---

## Tool Integrations

For implementation, see the [tools registry](../../tools/REGISTRY.md).

### Retention Platforms

| Tool | Best For | Key Feature |
|------|----------|-------------|
| **Churnkey** | Full cancel flow + dunning | AI-powered adaptive offers, 34% avg save rate |
| **ProsperStack** | Cancel flows with analytics | Advanced rules engine, Stripe/Chargebee integration |
| **Raaft** | Simple cancel flow builder | Easy setup, good for early-stage |
| **Chargebee Retention** | Chargebee customers | Native integration, was Brightback |

### Billing Providers (Dunning)

| Provider | Smart Retries | Dunning Emails | Card Updater |
|----------|:------------:|:--------------:|:------------:|
| **Stripe** | Built-in (Smart Retries) | Built-in | Automatic |
| **Chargebee** | Built-in | Built-in | Via gateway |
| **Paddle** | Built-in | Built-in | Managed |
| **Recurly** | Built-in | Built-in | Built-in |
| **Braintree** | Manual config | Manual | Via gateway |

### Related CLI Tools

| Tool | Use For |
|------|---------|
| `stripe` | Subscription management, dunning config, payment retries |
| `customer-io` | Dunning email sequences, retention campaigns |
| `posthog` | Cancel flow A/B tests via feature flags, funnel analytics |
| `mixpanel` / `ga4` | Usage tracking, churn signal analysis |
| `segment` | Event routing for health scoring |

---

## Related Skills

- **emails**: For win-back email sequences after cancellation
- **paywalls**: For in-app upgrade moments and trial expiration
- **pricing**: For plan structure and annual discount strategy
- **onboarding**: For activation to prevent early churn
- **analytics**: For setting up churn signal events
- **ab-testing**: For testing cancel flow variations with statistical rigor

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/cancel-flow-patterns.md

# Cancel Flow Patterns

Detailed cancel flow patterns by business type, billing provider, and industry.

---

## Cancel Flow by Business Type

### B2C / Self-Serve SaaS

High volume, low touch. The flow must work without human intervention.

**Flow structure:**
```
Cancel button → Exit survey (1 question) → Dynamic offer → Confirm → Post-cancel
```

**Characteristics:**
- Fully automated, no human in the loop
- Quick — 2-3 screens maximum
- One offer + one fallback, not a menu of options
- Mobile-optimized (significant cancellations on mobile)
- Clear "continue cancelling" at every step

**Typical save rate:** 20-30%

**Example flow for a $29/mo productivity app:**
1. "What's the main reason?" → 6 options
2. Selected "Too expensive" → "Get 25% off for 3 months (save $21.75)"
3. Declined → "Or switch to our Starter plan at $12/mo"
4. Declined → "We're sorry to see you go. Your access continues until [date]."

---

### B2B / Team Plans

Lower volume, higher stakes. Personal outreach is worth the cost.

**Flow structure:**
```
Cancel button → Exit survey → Offer (or route to CS) → Confirm → Post-cancel
```

**Characteristics:**
- Route accounts above MRR threshold to customer success
- Show team impact ("Your 8 team members will lose access")
- Offer admin-to-admin call for enterprise accounts
- Longer consideration — allow "schedule a call" as a save option
- Require admin/owner role to cancel (not any team member)

**Typical save rate:** 30-45% (higher because of personal touch)

**MRR-based routing:**

| Account MRR | Cancel Flow |
|-------------|-------------|
| <$100/mo | Automated flow with offers |
| $100-$500/mo | Automated + flag for CS follow-up |
| $500-$2,000/mo | Route to CS before cancel completes |
| $2,000+/mo | Block self-serve cancel, require CS call |

---

### Freemium / Free-to-Paid

Users cancelling paid to return to free tier. Different psychology — they're not leaving, they're downgrading.

**Flow structure:**
```
Cancel button → "Switch to Free?" prompt → Exit survey (if still cancelling) → Offer → Confirm
```

**Characteristics:**
- Lead with the free tier as the first option (not a save offer)
- Show what they keep on free vs. what they lose
- The "save" is keeping them on free, not losing them entirely
- Track free-tier users for future re-upgrade campaigns

---

## Cancel Flow by Billing Interval

### Monthly Subscribers

- More price-sensitive, shorter commitment
- Discount offers work well (20-30% for 2-3 months)
- Pause is effective (1-2 months)
- Suggest annual plan at a discount as an alternative

**Offer priority:**
1. Discount (if reason = price)
2. Pause (if reason = not using / temporary)
3. Annual plan switch (if engaged but price-sensitive)

### Annual Subscribers

- Higher commitment, often cancelling for stronger reasons
- Prorate refund expectations matter
- Longer save window (they've already paid)
- Personal outreach more justified (higher LTV at stake)

**Offer priority:**
1. Pause remainder of term (if temporary)
2. Plan adjustment + credit for next renewal
3. Personal outreach from CS
4. Partial refund + downgrade (better than full refund + cancel)

**Refund handling:**
- Offer prorated refund if significant time remaining
- "Pause until renewal" if less than 3 months left
- Be generous — bad refund experiences create vocal detractors

---

## Save Offer Patterns

### The Discount Ladder

Don't lead with your biggest discount. Escalate:

```
Cancel click → 15% off → Still cancelling → 25% off → Still cancelling → Let them go
```

**Rules:**
- Maximum 2 discount offers per cancel session
- Never exceed 30% (higher trains cancel-for-discount behavior)
- Time-limit discounts (2-3 months, then full price resumes)
- Track discount accepters — if they cancel again at full price, don't re-offer

### The Pause Playbook

Pause is often better than a discount because it doesn't devalue your product.

**Implementation:**

| Setting | Recommendation |
|---------|---------------|
| Pause duration options | 1 month, 2 months, 3 months |
| Default selection | 1 month (shortest) |
| Maximum pause | 3 months (longer pauses rarely return) |
| During pause | Keep data, remove access |
| Reactivation | Auto-reactivate with 7-day advance email |
| Repeat pauses | Allow 1 pause per 12-month period |

**Pause reactivation sequence:**
- Day -7: "Your pause ends in 7 days. We've been busy — here's what's new."
- Day -1: "Welcome back tomorrow! Here's what's waiting for you."
- Day 0: "You're back! Here's a quick tour of what's new."

### The Downgrade Path

For multi-plan products, downgrade is the strongest save:

```
┌─────────────────────────────────────────┐
│  Before you go, what about right-sizing │
│  your plan?                             │
│                                         │
│  Current: Pro ($49/mo)                  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Switch to Starter ($19/mo)      │    │
│  │                                 │    │
│  │ ✓ Keep: Projects, integrations  │    │
│  │ ✗ Lose: Advanced analytics,     │    │
│  │         team features           │    │
│  │                                 │    │
│  │ [Switch to Starter]             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [No thanks, continue cancelling]       │
└─────────────────────────────────────────┘
```

**Downgrade best practices:**
- Show exactly what they keep and what they lose
- Use checkmarks and X marks for scanability
- Preserve their data even on the lower plan
- If they downgrade, don't show upgrade prompts for at least 30 days

### The Competitor Switch Handler

When the cancel reason is "switching to competitor":

1. **Ask which competitor** (optional, don't force it)
2. **Show a comparison** if you have one (see competitors skill)
3. **Offer a migration credit** ("We'll match their price for 3 months")
4. **Request a feedback call** ("15 minutes to understand what we're missing")

This data is gold for product and marketing teams.

---

## Post-Cancel Experience

What happens after cancel matters for:
- Win-back potential
- Word of mouth
- Review sentiment

### Confirmation Page

```
Your subscription has been cancelled.

What happens next:
• Your access continues until [billing period end date]
• Your data will be preserved for 90 days
• You can reactivate anytime from your account settings

[Reactivate My Account]

We'd love to have you back. We'll keep improving based on feedback
from customers like you.
```

### Post-Cancel Sequence

| Timing | Action |
|--------|--------|
| Immediately | Confirmation email with access end date |
| Day 1 | (Nothing — don't be desperate) |
| Day 7 | NPS/satisfaction survey about overall experience |
| Day 30 | "What's new" email with recent improvements |
| Day 60 | Address their specific cancel reason if resolved |
| Day 90 | Final win-back with special offer |

**For detailed win-back email sequences**: See the emails skill.

---

## Segmentation Rules

The most effective cancel flows use segmentation to show different offers to different customers.

### Segmentation Dimensions

| Dimension | Why It Matters |
|-----------|---------------|
| Plan / MRR | Higher-value customers get personal outreach |
| Tenure | Long-term customers get more generous offers |
| Usage level | High-usage customers get different messaging than dormant ones |
| Billing interval | Monthly vs. annual need different approaches |
| Previous saves | Don't re-offer the same discount to a repeat canceller |
| Cancel reason | Drives which offer to show (core mapping) |

### Segment-Specific Flows

**New customer (< 30 days):**
- They haven't activated. The save is onboarding, not discounts.
- Offer: Free onboarding call, setup help, extended trial
- Ask: "What were you hoping to accomplish?" (learn what's missing)

**Engaged customer cancelling on price:**
- They love the product but can't justify the cost.
- Offer: Discount, annual plan switch, downgrade
- High save potential

**Dormant customer (no login 30+ days):**
- They forgot about you. A discount won't bring them back.
- Offer: Pause subscription, "what changed?" conversation
- Low save potential — focus on learning why

**Power user switching to competitor:**
- They're actively choosing something else.
- Offer: Competitive match, feedback call, roadmap preview
- Medium save potential — depends on reason

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Add cancel flow (survey + 1 offer + confirmation)
- [ ] Set up exit survey with 5-7 reason categories
- [ ] Map one offer per reason (simple 1:1 mapping)
- [ ] Track cancel reasons and save rate in analytics
- [ ] Enable pre-dunning card expiry emails

### Phase 2: Optimization (Weeks 2-4)
- [ ] Add fallback offers (primary + secondary per reason)
- [ ] Implement pause subscription option
- [ ] Set up dunning email sequence (4 emails over 10 days)
- [ ] Enable smart retries (Stripe Smart Retries or equivalent)
- [ ] Add MRR-based routing for high-value accounts

### Phase 3: Advanced (Month 2+)
- [ ] Build health score from usage signals
- [ ] Set up proactive intervention triggers
- [ ] A/B test discount amounts and offer types
- [ ] Segment flows by plan, tenure, and usage
- [ ] Post-cancel win-back sequence (coordinate with emails skill)
- [ ] Cohort analysis: churn by channel, plan, tenure

---

## Compliance Notes

### FTC Click-to-Cancel Rule (US)
- Cancellation must be as easy as signup
- Cannot require a phone call to cancel if signup was online
- Cannot add excessive steps to discourage cancellation
- Save offers are allowed but "continue cancelling" must be clear

### GDPR / Data Retention (EU)
- Inform users about data retention period post-cancel
- Offer data export before account deletion
- Honor deletion requests within 30 days
- Don't use post-cancel data for marketing without consent

### General Best Practices
- Always show a clear path to complete cancellation
- Never hide the cancel button (dark pattern)
- Process cancellation even if save flow has errors
- Confirm cancellation with email receipt

### references/dunning-playbook.md

# Dunning Playbook

Complete guide to recovering failed payments and reducing involuntary churn.

---

## Why Dunning Matters

- Failed payments cause 30-50% of all subscription churn
- Most failed payments are recoverable with the right strategy
- Subscription businesses lose an estimated $129 billion annually to involuntary churn
- Effective dunning recovers 50-60% of failed payments

---

## The Dunning Timeline

```
Day -30 to -7: Pre-dunning (prevent failures)
Day 0:         Payment fails → Smart retry #1 + Email #1
Day 1-3:       Smart retry #2 + Email #2
Day 3-5:       Smart retry #3
Day 5-7:       Smart retry #4 + Email #3
Day 7-10:      Final retry + Email #4 (final warning)
Day 10-14:     Grace period ends → Account paused/cancelled
Day 14+:       Win-back sequence begins
```

---

## Pre-Dunning: Prevent Failures Before They Happen

### Card Expiry Management

| Timing | Action |
|--------|--------|
| 30 days before expiry | Email: "Your card ending in 4242 expires next month" |
| 15 days before expiry | Email: "Update your payment method to avoid interruption" |
| 7 days before expiry | Email: "Your card expires in 7 days — update now" |
| 3 days before expiry | In-app banner: "Payment method expiring soon" |

**Email template — Card expiring:**
```
Subject: Your card ending in 4242 expires soon

Hi [Name],

The card on file for your [Product] subscription expires on [date].

Update your payment method now to avoid any interruption:

[Update Payment Method →]

This takes less than 30 seconds.

— [Product] Team
```

### Card Updater Services

Major card networks offer automatic card update programs:

| Service | Network | What It Does |
|---------|---------|--------------|
| Visa Account Updater (VAU) | Visa | Auto-updates stored card numbers and expiry dates |
| Mastercard Automatic Billing Updater (ABU) | Mastercard | Same for Mastercard |
| Amex Cardrefresher | American Express | Same for Amex |

**Impact:** Reduces hard declines from expired/replaced cards by 30-50%.

**How to enable:**
- **Stripe**: Automatic — enabled by default
- **Chargebee**: Enabled through gateway settings
- **Recurly**: Built-in, enabled by default
- **Braintree**: Contact processor to enable

### Backup Payment Methods

Prompt for a second payment method:
- During signup: "Add a backup payment method" (low conversion)
- After first successful payment: "Protect your account with a backup card" (better timing)
- After a failed payment is recovered: "Add a backup to prevent future interruptions" (best timing — they felt the pain)

### Pre-Billing Notifications

For annual plans or high-value subscriptions:
- Email 7 days before renewal with amount and date
- Include link to update payment method
- Show what's included in the renewal
- Required by some regulations for auto-renewals

---

## Smart Retry Strategy

### Decline Type Classification

| Code | Type | Meaning | Retry? |
|------|------|---------|--------|
| `insufficient_funds` | Soft | Temporarily low balance | Yes — retry in 2-3 days |
| `card_declined` (generic) | Soft | Various temporary reasons | Yes — retry 3-4 times |
| `processing_error` | Soft | Gateway/network issue | Yes — retry within 24h |
| `expired_card` | Hard | Card is expired | No — request new card |
| `stolen_card` | Hard | Card reported stolen | No — request new card |
| `do_not_honor` | Soft/Hard | Bank refused (ambiguous) | Try once more, then ask for new card |
| `authentication_required` | Auth | SCA/3DS needed | Send customer to authenticate |

### Retry Schedule by Provider

**Stripe (Smart Retries — recommended):**
- Enable "Smart Retries" in Stripe Dashboard → Billing → Settings
- Stripe's ML model picks optimal retry timing based on billions of transactions
- Typically 4-8 retry attempts over 3-4 weeks
- Recovers ~15% more than fixed-schedule retries

**Manual retry schedule (if no smart retries):**

| Retry | Timing | Best Day/Time |
|-------|--------|--------------|
| 1 | Day 1 (24h after failure) | Morning, same day of week as original |
| 2 | Day 3 | Try a different time of day |
| 3 | Day 5 | After typical payday (1st, 15th) |
| 4 | Day 7 | Morning of the next business day |
| 5 (final) | Day 10 | Last attempt before grace period ends |

**Retry timing insights:**
- Retry on the same day of month the original payment succeeded
- Retry after common paydays (1st and 15th of the month)
- Avoid retrying on weekends (lower approval rates)
- Morning retries (8-10am local time) perform slightly better

---

## Dunning Email Sequence

### Email 1: Payment Failed (Day 0)

**Tone:** Friendly, matter-of-fact. No alarm.

```
Subject: Action needed — your payment didn't go through

Hi [Name],

We tried to charge your [card type] ending in [last 4] for your
[Product] subscription ($[amount]), but it didn't go through.

This happens sometimes — usually a quick card update fixes it.

[Update Payment Method →]

Your access isn't affected yet. We'll retry automatically, but
updating your card is the fastest fix.

Need help? Just reply to this email.

— [Product] Team
```

### Email 2: Reminder (Day 3)

**Tone:** Helpful, slightly more urgent.

```
Subject: Quick reminder — update your payment for [Product]

Hi [Name],

Just a heads-up — we still haven't been able to process your
$[amount] payment for [Product].

[Update Payment Method →]

Takes less than 30 seconds. Your [data/projects/team access]
is safe, but we'll need a valid payment method to keep your
account active.

Questions? Reply here and we'll help.

— [Product] Team
```

### Email 3: Urgency (Day 7)

**Tone:** Direct, clear consequences.

```
Subject: Your [Product] account will be paused in 3 days

Hi [Name],

We've tried to process your payment several times, but your
[card type] ending in [last 4] keeps getting declined.

If we don't receive payment by [date], your account will be
paused and you'll lose access to:

• [Key feature/data they use]
• [Their projects/workspace]
• [Team access for X members]

[Update Payment Method Now →]

Your data won't be deleted — you can reactivate anytime by
updating your payment method.

— [Product] Team
```

### Email 4: Final Warning (Day 10)

**Tone:** Final, clear, no guilt.

```
Subject: Last chance to keep your [Product] account active

Hi [Name],

This is our last reminder. Your payment of $[amount] is past
due, and your account will be paused tomorrow ([date]).

[Update Payment Method →]

After pausing:
• Your data is saved for [90 days]
• You can reactivate anytime
• Just update your card to restore access

If you intended to cancel, no action needed — your account
will be paused automatically.

— [Product] Team
```

---

## Grace Period Management

### What Happens During Grace Period

| Setting | Recommendation |
|---------|---------------|
| Duration | 7-14 days after final retry |
| Access | Degraded (read-only) or full access |
| Visibility | In-app banner: "Payment past due — update to continue" |
| Retry | Continue background retries during grace |
| Communication | Dunning emails continue |

### Access Degradation Options

**Option A: Full access during grace (recommended for B2B)**
- Lower friction, customer feels respected
- Higher recovery rate (they still see value)
- Risk: some customers exploit the grace period

**Option B: Read-only access (recommended for B2C)**
- Can view but not create/edit
- Creates urgency without data loss fear
- Clear message: "Update payment to resume full access"

**Option C: Immediate lockout (not recommended)**
- Aggressive, damages relationship
- Lower recovery rate
- Only appropriate for very low-cost plans

### Post-Grace Period

| Timing | Action |
|--------|--------|
| Grace period ends | Pause account (not delete) |
| Day 1 post-pause | "Your account has been paused" email |
| Day 7 post-pause | "Your data is still here" reminder |
| Day 30 post-pause | Win-back attempt with new offer |
| Day 60 post-pause | Final win-back |
| Day 90 post-pause | Data deletion warning (if applicable) |

---

## Provider-Specific Setup

### Stripe

**Enable Smart Retries:**
1. Dashboard → Settings → Billing → Subscriptions and emails
2. Enable "Smart Retries" under retry rules
3. Set failed payment emails in Dashboard → Settings → Emails

**Custom retry rules (if not using Smart Retries):**
```
Retry 1: 3 days after failure
Retry 2: 5 days after failure
Retry 3: 7 days after failure
Final:   Mark subscription as unpaid after last retry
```

**Webhook events to handle:**
- `invoice.payment_failed` — trigger dunning
- `invoice.paid` — cancel dunning, restore access
- `customer.subscription.updated` — status changes
- `customer.subscription.deleted` — final cancellation

### Chargebee

**Built-in dunning:**
1. Settings → Configure Chargebee → Retry Settings
2. Configure retry attempts and intervals
3. Settings → Configure Chargebee → Email Notifications → Dunning

**Dunning options:**
- Automatic retries with configurable schedule
- Built-in dunning emails (customizable templates)
- Grace period configuration per plan

### Paddle

**Managed dunning:**
- Paddle handles retries and dunning automatically
- Limited customization (Paddle manages the relationship)
- Webhook: `subscription.payment_failed`, `subscription.cancelled`
- Best for hands-off approach

### Recurly

**Revenue Recovery:**
1. Configuration → Dunning Management
2. Set retry schedule per plan
3. Configure grace period and final action (pause vs cancel)

**Advanced features:**
- Machine-learning retry optimization
- Per-plan dunning schedules
- Built-in Account Updater

---

## In-App Dunning

Don't rely on email alone. Show payment failures in the app:

### Banner Pattern
```
┌──────────────────────────────────────────────────────┐
│ ⚠ Your payment of $29 failed. Update your card to    │
│ avoid losing access. [Update Payment →]  [Dismiss]   │
└──────────────────────────────────────────────────────┘
```

**Rules:**
- Show on every page load during dunning period
- Allow dismiss (but show again next session)
- Direct link to payment update (fewest clicks possible)
- Don't block the product — let them continue using it

### Modal Pattern (for final warning)
```
┌─────────────────────────────────────┐
│                                     │
│  Your account will be paused        │
│  on [date]                          │
│                                     │
│  Update your payment method to      │
│  keep access to your [X] projects   │
│  and [Y] team members.              │
│                                     │
│  [Update Payment Method]            │
│  [Remind Me Later]                  │
│                                     │
└─────────────────────────────────────┘
```

---

## Measuring Dunning Performance

### Key Metrics

| Metric | How to Calculate | Target |
|--------|-----------------|--------|
| Recovery rate | Recovered payments / Total failed | 50-60% |
| Recovery rate by decline type | Recovered / Failed per type | Soft: 70%+, Hard: 40%+ |
| Time to recovery | Days from failure to successful payment | <5 days |
| Pre-dunning prevention rate | Prevented failures / Expected failures | 20-30% |
| Dunning email open rate | Opens / Sent per email | 60%+ |
| Dunning email click rate | Clicks / Opens per email | 30%+ |
| Revenue recovered (monthly) | Sum of recovered payment amounts | Track trend |
| Revenue lost to involuntary churn | Sum of failed + unrecovered amounts | Track trend |

### Benchmarking

**By company stage:**

| Stage | Typical Involuntary Churn | Target After Optimization |
|-------|--------------------------|--------------------------|
| Early (< $1M ARR) | 3-5% of MRR/month | 1-2% |
| Growth ($1-10M ARR) | 2-4% of MRR/month | 0.5-1.5% |
| Scale ($10M+ ARR) | 1-3% of MRR/month | 0.3-0.8% |

### ROI Calculation

```
Monthly failed payment MRR:        $10,000
Current recovery rate:              30% ($3,000 recovered)
Target recovery rate:               60% ($6,000 recovered)
Monthly improvement:                $3,000/month
Annual improvement:                 $36,000/year
Cost of dunning optimization:       ~$200-500/month (tooling)
ROI:                                6-15x
```

