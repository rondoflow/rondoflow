---
name: ads
description: "When the user wants help with paid advertising campaigns on Google Ads, Meta (Facebook/Instagram), LinkedIn, Twitter/X, or other ad platforms. Also use when the user mentions 'PPC,' 'paid media,' 'ROAS,' 'CPA,' 'ad campaign,' 'retargeting,' 'audience targeting,' 'Google Ads,' 'Facebook ads,' 'LinkedIn ads,' 'ad budget,' 'cost per click,' 'ad spend,' or 'should I run ads.' Use this for campaign strategy, audience targeting, bidding, and optimization. For bulk ad creative generation and iteration, see ad-creative. For landing page optimization, see cro."
category: Marketing
author: community
version: "2.0.1"
icon: megaphone
---

# Paid Ads

You are an expert performance marketer with direct access to ad platform accounts. Your goal is to help create, optimize, and scale paid advertising campaigns that drive efficient customer acquisition.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Campaign Goals
- What's the primary objective? (Awareness, traffic, leads, sales, app installs)
- What's the target CPA or ROAS?
- What's the monthly/weekly budget?
- Any constraints? (Brand guidelines, compliance, geographic)

### 2. Product & Offer
- What are you promoting? (Product, free trial, lead magnet, demo)
- What's the landing page URL?
- What makes this offer compelling?

### 3. Audience
- Who is the ideal customer?
- What problem does your product solve for them?
- What are they searching for or interested in?
- Do you have existing customer data for lookalikes?

### 4. Current State
- Have you run ads before? What worked/didn't?
- Do you have existing pixel/conversion data?
- What's your current funnel conversion rate?

---

## Platform Selection Guide

| Platform | Best For | Use When |
|----------|----------|----------|
| **Google Ads** | High-intent search traffic | People actively search for your solution |
| **Meta** | Demand generation, visual products | Creating demand, strong creative assets |
| **LinkedIn** | B2B, decision-makers | Job title/company targeting matters, higher price points |
| **Twitter/X** | Tech audiences, thought leadership | Audience is active on X, timely content |
| **TikTok** | Younger demographics, viral creative | Audience skews 18-34, video capacity |

---

## Campaign Structure Best Practices

### Account Organization

```
Account
├── Campaign 1: [Objective] - [Audience/Product]
│   ├── Ad Set 1: [Targeting variation]
│   │   ├── Ad 1: [Creative variation A]
│   │   ├── Ad 2: [Creative variation B]
│   │   └── Ad 3: [Creative variation C]
│   └── Ad Set 2: [Targeting variation]
└── Campaign 2...
```

### Naming Conventions

```
[Platform]_[Objective]_[Audience]_[Offer]_[Date]

Examples:
META_Conv_Lookalike-Customers_FreeTrial_2024Q1
GOOG_Search_Brand_Demo_Ongoing
LI_LeadGen_CMOs-SaaS_Whitepaper_Mar24
```

### Budget Allocation

**Testing phase (first 2-4 weeks):**
- 70% to proven/safe campaigns
- 30% to testing new audiences/creative

**Scaling phase:**
- Consolidate budget into winning combinations
- Increase budgets 20-30% at a time
- Wait 3-5 days between increases for algorithm learning

---

## Ad Copy Frameworks

### Key Formulas

**Problem-Agitate-Solve (PAS):**
> [Problem] → [Agitate the pain] → [Introduce solution] → [CTA]

**Before-After-Bridge (BAB):**
> [Current painful state] → [Desired future state] → [Your product as bridge]

**Social Proof Lead:**
> [Impressive stat or testimonial] → [What you do] → [CTA]

**For detailed templates and headline formulas**: See [references/ad-copy-templates.md](references/ad-copy-templates.md)

---

## Audience Targeting Overview

### Platform Strengths

| Platform | Key Targeting | Best Signals |
|----------|---------------|--------------|
| Google | Keywords, search intent | What they're searching |
| Meta | Interests, behaviors, lookalikes | Engagement patterns |
| LinkedIn | Job titles, companies, industries | Professional identity |

### Key Concepts

- **Lookalikes**: Base on best customers (by LTV), not all customers
- **Retargeting**: Segment by funnel stage (visitors vs. cart abandoners)
- **Exclusions**: Exclude existing customers and recent converters — showing ads to people who already bought wastes spend

**For detailed targeting strategies by platform**: See [references/audience-targeting.md](references/audience-targeting.md)

---

## Creative Best Practices

### Image Ads
- Clear product screenshots showing UI
- Before/after comparisons
- Stats and numbers as focal point
- Human faces (real, not stock)
- Bold, readable text overlay (keep under 20%)

### Video Ads Structure (15-30 sec)
1. Hook (0-3 sec): Pattern interrupt, question, or bold statement
2. Problem (3-8 sec): Relatable pain point
3. Solution (8-20 sec): Show product/benefit
4. CTA (20-30 sec): Clear next step

**Production tips:**
- Captions always (85% watch without sound)
- Vertical for Stories/Reels, square for feed
- Native feel outperforms polished
- First 3 seconds determine if they watch

### Creative Testing Hierarchy
1. Concept/angle (biggest impact)
2. Hook/headline
3. Visual style
4. Body copy
5. CTA

---

## Campaign Optimization

### Key Metrics by Objective

| Objective | Primary Metrics |
|-----------|-----------------|
| Awareness | CPM, Reach, Video view rate |
| Consideration | CTR, CPC, Time on site |
| Conversion | CPA, ROAS, Conversion rate |

### Optimization Levers

**If CPA is too high:**
1. Check landing page (is the problem post-click?)
2. Tighten audience targeting
3. Test new creative angles
4. Improve ad relevance/quality score
5. Adjust bid strategy

**If CTR is low:**
- Creative isn't resonating → test new hooks/angles
- Audience mismatch → refine targeting
- Ad fatigue → refresh creative

**If CPM is high:**
- Audience too narrow → expand targeting
- High competition → try different placements
- Low relevance score → improve creative fit

### Bid Strategy Progression
1. Start with manual or cost caps
2. Gather conversion data (50+ conversions)
3. Switch to automated with targets based on historical data
4. Monitor and adjust targets based on results

---

## Retargeting Strategies

### Funnel-Based Approach

| Funnel Stage | Audience | Message | Goal |
|--------------|----------|---------|------|
| Top | Blog readers, video viewers | Educational, social proof | Move to consideration |
| Middle | Pricing/feature page visitors | Case studies, demos | Move to decision |
| Bottom | Cart abandoners, trial users | Urgency, objection handling | Convert |

### Retargeting Windows

| Stage | Window | Frequency Cap |
|-------|--------|---------------|
| Hot (cart/trial) | 1-7 days | Higher OK |
| Warm (key pages) | 7-30 days | 3-5x/week |
| Cold (any visit) | 30-90 days | 1-2x/week |

### Exclusions to Set Up
- Existing customers (unless upsell)
- Recent converters (7-14 day window)
- Bounced visitors (<10 sec)
- Irrelevant pages (careers, support)

---

## Reporting & Analysis

### Weekly Review
- Spend vs. budget pacing
- CPA/ROAS vs. targets
- Top and bottom performing ads
- Audience performance breakdown
- Frequency check (fatigue risk)
- Landing page conversion rate

### Attribution Considerations
- Platform attribution is inflated
- Use UTM parameters consistently
- Compare platform data to GA4
- Look at blended CAC, not just platform CPA

---

## Platform Setup

Before launching campaigns, ensure proper tracking and account setup.

**For complete setup checklists by platform**: See [references/platform-setup-checklists.md](references/platform-setup-checklists.md)

**For conversion pixel installation and event setup**: See [references/conversion-tracking.md](references/conversion-tracking.md)

### Universal Pre-Launch Checklist
- [ ] Conversion tracking tested with real conversion
- [ ] Landing page loads fast (<3 sec)
- [ ] Landing page mobile-friendly
- [ ] UTM parameters working
- [ ] Budget set correctly
- [ ] Targeting matches intended audience

---

## Google RSA Output Spec (mandatory when generating RSAs)

When the user requests Google Ads RSAs (Responsive Search Ads), output MUST comply with these platform limits and structural requirements. Do not output any RSA that violates them.

### Hard limits per RSA (enforce before responding)

- **Headlines:** exactly **15** per RSA, each **≤ 30 characters** (count characters, including spaces). Render as `1. ... (NN chars)` so the reader can verify.
- **Descriptions:** exactly **4** per RSA, each **≤ 90 characters**.
- **Paths:** up to 2 path fields, each **≤ 15 characters**.
- **Final URL:** present, https.
- **Pinning:** state any pinned positions explicitly. Default = unpinned unless user asks.
- **Per-account guardrail:** Google enforces **3 RSAs max per ad group**. When the user asks for >3, group them by ad group.

### Required sidecar artifacts (always include with RSA request)

1. **Ad group structure**, labeled `Ad group structure:` — list each ad group with its theme, target keywords (match types), and which RSAs map to it.
2. **Negative keyword list**, labeled `Negative keywords:` — minimum **8** entries, group-level vs campaign-level called out.
3. **Sitelinks** (≥ 4), **Callouts** (≥ 4 ≤25 chars), **Structured snippets** if relevant.

### Medical / CFM compliance (when product context indicates pt-BR medical practice)

If `.agents/product-marketing.md` indicates a Brazilian medical practice (CFM-regulated), the following terms are **forbidden** in headlines, descriptions, sitelinks, and callouts:

- Superlatives: `#1`, `melhor`, `o melhor`, `melhor do brasil`, `top`, `referência`
- Outcome promises: `garantido`, `garantia`, `cura`, `cura definitiva`, `100%`, `resultado garantido`, `livre da dor`
- Comparative claims vs other doctors/clinics

Use neutral framing: `atendimento`, `consulta`, `avaliação`, `segunda opinião`, `agende sua consulta`, `tire suas dúvidas`. Geo modifier (`Porto Alegre`, `POA`, `Zona Sul POA`) required where the prompt specifies a region.

### Output ORDER (mandatory — emit in this order to avoid truncation)

1. **Ad group structure** (short)
2. **Negative keywords** (≥8, MANDATORY — emit BEFORE RSAs so it isn't dropped if output runs long)
3. **Sitelinks** (≥4)
4. **Callouts** (≥4)
5. **RSA1, RSA2, RSA3** (largest section, last — safe to truncate gracefully)

### Output template (mandatory shape)

```
Ad group structure:
- AG1 [theme]: keywords (match types) → RSA1, RSA2
- AG2 [theme]: ...

Negative keywords:
  Campaign-level:
    - <kw>
    - <kw>
    (≥4 here)
  Ad-group level:
    - AG1: <kw>, <kw>
    - AG2: <kw>, <kw>
    (≥4 more here — TOTAL ≥8 entries)

Sitelinks (≥4):
  - <title (≤25)> | <desc1 (≤35)> | <desc2 (≤35)> | URL

Callouts (≥4, each ≤25 chars):
  - <callout>

RSA1 — [ad group name]
  Final URL: https://...
  Path1: ...   Path2: ...
  Headlines (15, each ≤30 chars):
    1. <headline> (NN chars)
    ...
    15. <headline> (NN chars)
  Descriptions (4, each ≤90 chars):
    1. <description> (NN chars)
    ...
    4. <description> (NN chars)
  Pinning: H1=none; H2=none; ...   (or explicit pins)

RSA2 — ...
RSA3 — ...
```

### Self-check before responding

Before sending the output, run this checklist mentally:

- [ ] Each RSA has exactly 15 headlines, exactly 4 descriptions.
- [ ] Every headline is ≤30 chars; every description is ≤90 chars. Character counts printed.
- [ ] Negative keyword list labeled and ≥8 entries.
- [ ] Ad group structure labeled.
- [ ] If medical (CFM): no forbidden superlative/outcome words; geo modifier present where required; language is pt-BR.

If any check fails, rewrite before responding. Do not ship partial RSAs.

---

## Common Mistakes to Avoid

### Strategy
- Launching without conversion tracking
- Too many campaigns (fragmenting budget)
- Not giving algorithms enough learning time
- Optimizing for wrong metric

### Targeting
- Audiences too narrow or too broad
- Not excluding existing customers
- Overlapping audiences competing

### Creative
- Only one ad per ad set
- Not refreshing creative (fatigue)
- Mismatch between ad and landing page

### Budget
- Spreading too thin across campaigns
- Making big budget changes (disrupts learning)
- Stopping campaigns during learning phase

---

## Task-Specific Questions

1. What platform(s) are you currently running or want to start with?
2. What's your monthly ad budget?
3. What does a successful conversion look like (and what's it worth)?
4. Do you have existing creative assets or need to create them?
5. What landing page will ads point to?
6. Do you have pixel/conversion tracking set up?

---

## Tool Integrations

For implementation, see the [tools registry](../../tools/REGISTRY.md). Key advertising platforms:

| Platform | Best For | MCP | Guide |
|----------|----------|:---:|-------|
| **Google Ads** | Search intent, high-intent traffic | ✓ | [google-ads.md](../../tools/integrations/google-ads.md) |
| **Meta Ads** | Demand gen, visual products, B2C | - | [meta-ads.md](../../tools/integrations/meta-ads.md) |
| **LinkedIn Ads** | B2B, job title targeting | - | [linkedin-ads.md](../../tools/integrations/linkedin-ads.md) |
| **TikTok Ads** | Younger demographics, video | - | [tiktok-ads.md](../../tools/integrations/tiktok-ads.md) |

For tracking setup, see [references/conversion-tracking.md](references/conversion-tracking.md), [ga4.md](../../tools/integrations/ga4.md), [segment.md](../../tools/integrations/segment.md)

---

## Related Skills

- **ad-creative**: For generating and iterating ad headlines, descriptions, and creative at scale
- **copywriting**: For landing page copy that converts ad traffic
- **analytics**: For proper conversion tracking setup
- **ab-testing**: For landing page testing to improve ROAS
- **cro**: For optimizing post-click conversion rates

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/ad-copy-templates.md

# Ad Copy Templates Reference

Detailed formulas and templates for writing high-converting ad copy.

## Contents
- Primary Text Formulas (Problem-Agitate-Solve, Before-After-Bridge, Social Proof Lead, Feature-Benefit Bridge, Direct Response)
- Headline Formulas (For Search Ads, For Social Ads)
- CTA Variations (Soft CTAs, Hard CTAs, Urgency CTAs, Action-Oriented CTAs)
- Platform-Specific Copy Guidelines (Google Search Ads, Meta Ads, LinkedIn Ads)
- Copy Testing Priority

## Primary Text Formulas

### Problem-Agitate-Solve (PAS)

```
[Problem statement]
[Agitate the pain]
[Introduce solution]
[CTA]
```

**Example:**
> Spending hours on manual reporting every week?
> While you're buried in spreadsheets, your competitors are making decisions.
> [Product] automates your reports in minutes.
> Start your free trial →

---

### Before-After-Bridge (BAB)

```
[Current painful state]
[Desired future state]
[Your product as the bridge]
```

**Example:**
> Before: Chasing down approvals across email, Slack, and spreadsheets.
> After: Every approval tracked, automated, and on time.
> [Product] connects your tools and keeps projects moving.

---

### Social Proof Lead

```
[Impressive stat or testimonial]
[What you do]
[CTA]
```

**Example:**
> "We cut our reporting time by 75%." — Sarah K., Marketing Director
> [Product] automates the reports you hate building.
> See how it works →

---

### Feature-Benefit Bridge

```
[Feature]
[So that...]
[Which means...]
```

**Example:**
> Real-time collaboration on documents
> So your team always works from the latest version
> Which means no more version confusion or lost work

---

### Direct Response

```
[Bold claim/outcome]
[Proof point]
[CTA with urgency if genuine]
```

**Example:**
> Cut your reporting time by 80%
> Join 5,000+ marketing teams already using [Product]
> Start free → First month 50% off

---

## Headline Formulas

### For Search Ads

| Formula | Example |
|---------|---------|
| [Keyword] + [Benefit] | "Project Management That Teams Actually Use" |
| [Action] + [Outcome] | "Automate Reports \| Save 10 Hours Weekly" |
| [Question] | "Tired of Manual Data Entry?" |
| [Number] + [Benefit] | "500+ Teams Trust [Product] for [Outcome]" |
| [Keyword] + [Differentiator] | "CRM Built for Small Teams" |
| [Price/Offer] + [Keyword] | "Free Project Management \| No Credit Card" |

### For Social Ads

| Type | Example |
|------|---------|
| Outcome hook | "How we 3x'd our conversion rate" |
| Curiosity hook | "The reporting hack no one talks about" |
| Contrarian hook | "Why we stopped using [common tool]" |
| Specificity hook | "The exact template we use for..." |
| Question hook | "What if you could cut your admin time in half?" |
| Number hook | "7 ways to improve your workflow today" |
| Story hook | "We almost gave up. Then we found..." |

---

## CTA Variations

### Soft CTAs (awareness/consideration)

Best for: Top of funnel, cold audiences, complex products

- Learn More
- See How It Works
- Watch Demo
- Get the Guide
- Explore Features
- See Examples
- Read the Case Study

### Hard CTAs (conversion)

Best for: Bottom of funnel, warm audiences, clear offers

- Start Free Trial
- Get Started Free
- Book a Demo
- Claim Your Discount
- Buy Now
- Sign Up Free
- Get Instant Access

### Urgency CTAs (use when genuine)

Best for: Limited-time offers, scarcity situations

- Limited Time: 30% Off
- Offer Ends [Date]
- Only X Spots Left
- Last Chance
- Early Bird Pricing Ends Soon

### Action-Oriented CTAs

Best for: Active voice, clear next step

- Start Saving Time Today
- Get Your Free Report
- See Your Score
- Calculate Your ROI
- Build Your First Project

---

## Platform-Specific Copy Guidelines

### Google Search Ads

- **Headline limits:** 30 characters each (up to 15 headlines)
- **Description limits:** 90 characters each (up to 4 descriptions)
- Include keywords naturally
- Use all available headline slots
- Include numbers and stats when possible
- Test dynamic keyword insertion

### Meta Ads (Facebook/Instagram)

- **Primary text:** 125 characters visible (can be longer, gets truncated)
- **Headline:** 40 characters recommended
- Front-load the hook (first line matters most)
- Emojis can work but test
- Questions perform well
- Keep image text under 20%

### LinkedIn Ads

- **Intro text:** 600 characters max (150 recommended)
- **Headline:** 200 characters max (70 recommended)
- Professional tone (but not boring)
- Specific job outcomes resonate
- Stats and social proof important
- Avoid consumer-style hype

---

## Copy Testing Priority

When testing ad copy, focus on these elements in order of impact:

1. **Hook/angle** (biggest impact on performance)
2. **Headline**
3. **Primary benefit**
4. **CTA**
5. **Supporting proof points**

Test one element at a time for clean data.

### references/audience-targeting.md

# Audience Targeting Reference

Detailed targeting strategies for each major ad platform.

## Contents
- Google Ads Audiences (Search Campaign Targeting, Display/YouTube Targeting)
- Meta Audiences (Core Audiences, Custom Audiences, Lookalike Audiences)
- LinkedIn Audiences (Job-Based Targeting, Company-Based Targeting, High-Performing Combinations)
- Twitter/X Audiences
- TikTok Audiences
- Audience Size Guidelines
- Exclusion Strategy

## Google Ads Audiences

### Search Campaign Targeting

**Keywords:**
- Exact match: [keyword] — most precise, lower volume
- Phrase match: "keyword" — moderate precision and volume
- Broad match: keyword — highest volume, use with smart bidding

**Audience layering:**
- Add audiences in "observation" mode first
- Analyze performance by audience
- Switch to "targeting" mode for high performers

**RLSA (Remarketing Lists for Search Ads):**
- Bid higher on past visitors searching your terms
- Show different ads to returning searchers
- Exclude converters from prospecting campaigns

### Display/YouTube Targeting

**Custom intent audiences:**
- Based on recent search behavior
- Create from your converting keywords
- High intent, good for prospecting

**In-market audiences:**
- People actively researching solutions
- Pre-built by Google
- Layer with demographics for precision

**Affinity audiences:**
- Based on interests and habits
- Better for awareness
- Broad but can exclude irrelevant

**Customer match:**
- Upload email lists
- Retarget existing customers
- Create lookalikes from best customers

**Similar/lookalike audiences:**
- Based on your customer match lists
- Expand reach while maintaining relevance
- Best when source list is high-quality customers

---

## Meta Audiences

### Core Audiences (Interest/Demographic)

**Interest targeting tips:**
- Layer interests with AND logic for precision
- Use Audience Insights to research interests
- Start broad, let algorithm optimize
- Exclude existing customers always

**Demographic targeting:**
- Age and gender (if product-specific)
- Location (down to zip/postal code)
- Language
- Education and work (limited data now)

**Behavior targeting:**
- Purchase behavior
- Device usage
- Travel patterns
- Life events

### Custom Audiences

**Website visitors:**
- All visitors (last 180 days max)
- Specific page visitors
- Time on site thresholds
- Frequency (visited X times)

**Customer list:**
- Upload emails/phone numbers
- Match rate typically 30-70%
- Refresh regularly for accuracy

**Engagement audiences:**
- Video viewers (25%, 50%, 75%, 95%)
- Page/profile engagers
- Form openers
- Instagram engagers

**App activity:**
- App installers
- In-app events
- Purchase events

### Lookalike Audiences

**Source audience quality matters:**
- Use high-LTV customers, not all customers
- Purchasers > leads > all visitors
- Minimum 100 source users, ideally 1,000+

**Size recommendations:**
- 1% — most similar, smallest reach
- 1-3% — good balance for most
- 3-5% — broader, good for scale
- 5-10% — very broad, awareness only

**Layering strategies:**
- Lookalike + interest = more precision early
- Test lookalike-only as you scale
- Exclude the source audience

---

## LinkedIn Audiences

### Job-Based Targeting

**Job titles:**
- Be specific (CMO vs. "Marketing")
- LinkedIn normalizes titles, but verify
- Stack related titles
- Exclude irrelevant titles

**Job functions:**
- Broader than titles
- Combine with seniority level
- Good for awareness campaigns

**Seniority levels:**
- Entry, Senior, Manager, Director, VP, CXO, Partner
- Layer with function for precision

**Skills:**
- Self-reported, less reliable
- Good for technical roles
- Use as expansion layer

### Company-Based Targeting

**Company size:**
- 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5000+
- Key filter for B2B

**Industry:**
- Based on company classification
- Can be broad, layer with other criteria

**Company names (ABM):**
- Upload target account list
- Minimum 300 companies recommended
- Match rate varies

**Company growth rate:**
- Hiring rapidly = budget available
- Good signal for timing

### High-Performing Combinations

| Use Case | Targeting Combination |
|----------|----------------------|
| Enterprise sales | Company size 1000+ + VP/CXO + Industry |
| SMB sales | Company size 11-200 + Manager/Director + Function |
| Developer tools | Skills + Job function + Company type |
| ABM campaigns | Company list + Decision-maker titles |
| Broad awareness | Industry + Seniority + Geography |

---

## Twitter/X Audiences

### Targeting options:
- Follower lookalikes (accounts similar to followers of X)
- Interest categories
- Keywords (in tweets)
- Conversation topics
- Events
- Tailored audiences (your lists)

### Best practices:
- Follower lookalikes of relevant accounts work well
- Keyword targeting catches active conversations
- Lower CPMs than LinkedIn/Meta
- Less precise, better for awareness

---

## TikTok Audiences

### Targeting options:
- Demographics (age, gender, location)
- Interests (TikTok's categories)
- Behaviors (video interactions)
- Device (iOS/Android, connection type)
- Custom audiences (pixel, customer file)
- Lookalike audiences

### Best practices:
- Younger skew (18-34 primarily)
- Interest targeting is broad
- Creative matters more than targeting
- Let algorithm optimize with broad targeting

---

## Audience Size Guidelines

| Platform | Minimum Recommended | Ideal Range |
|----------|-------------------|-------------|
| Google Search | 1,000+ searches/mo | 5,000-50,000 |
| Google Display | 100,000+ | 500K-5M |
| Meta | 100,000+ | 500K-10M |
| LinkedIn | 50,000+ | 100K-500K |
| Twitter/X | 50,000+ | 100K-1M |
| TikTok | 100,000+ | 1M+ |

Too narrow = expensive, slow learning
Too broad = wasted spend, poor relevance

---

## Exclusion Strategy

Always exclude:
- Existing customers (unless upsell)
- Recent converters (7-14 days)
- Bounced visitors (<10 sec)
- Employees (by company or email list)
- Irrelevant page visitors (careers, support)
- Competitors (if identifiable)

### references/conversion-tracking.md

# Conversion Tracking Setup

How to set up conversion tracking pixels across ad platforms. This guide covers installation, event configuration, and validation — everything a marketer needs to ensure ad spend is properly attributed.

---

## Why This Matters

Without conversion tracking:
- Ad platforms can't optimize for your actual goals
- You're flying blind on ROAS and CPA
- Retargeting audiences can't be built
- You'll waste budget on impressions that don't convert

Get tracking right before spending a dollar on ads.

---

## Platform Pixels Overview

| Platform | Pixel/Tag Name | Events API | Key Events |
|----------|---------------|:----------:|------------|
| **Google Ads** | Google tag (gtag.js) | Enhanced Conversions | purchase, sign_up, generate_lead |
| **Meta** | Meta Pixel + CAPI | Conversions API | Purchase, Lead, ViewContent, AddToCart |
| **LinkedIn** | Insight Tag | Conversions API | conversion (URL or event-based) |
| **TikTok** | TikTok Pixel | Events API | Purchase, ViewContent, AddToCart, CompleteRegistration |
| **Twitter/X** | Twitter Pixel | - | Purchase, SignUp, Download |

---

## Google Ads

### Install the Google tag

Add to every page, in `<head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXX');
</script>
```

Replace `AW-XXXXXXXXX` with your Conversion ID from Google Ads > Tools > Conversions.

### Set up conversion actions

In Google Ads > Goals > Conversions > New conversion action:

| Conversion | Category | Value | Count |
|-----------|----------|-------|-------|
| Purchase | Purchase | Dynamic (order value) | Every |
| Sign up / Lead | Sign-up | Fixed ($X estimated value) | One |
| Demo request | Lead | Fixed ($X estimated value) | One |
| Free trial start | Sign-up | Fixed ($X estimated value) | One |

### Fire conversion events

```javascript
// Purchase
gtag('event', 'conversion', {
  'send_to': 'AW-XXXXXXXXX/CONVERSION_LABEL',
  'value': 99.00,
  'currency': 'USD',
  'transaction_id': 'ORDER-123'
});

// Lead / Sign up
gtag('event', 'conversion', {
  'send_to': 'AW-XXXXXXXXX/CONVERSION_LABEL',
  'value': 50.00,
  'currency': 'USD'
});
```

### Enhanced Conversions

Sends hashed first-party data (email, phone) to improve attribution after cookie restrictions. Enable in Google Ads > Goals > Settings > Enhanced conversions.

```javascript
gtag('set', 'user_data', {
  'email': 'user@example.com',      // auto-hashed by gtag
  'phone_number': '+11234567890'
});
```

### Google Tag Manager alternative

If using GTM instead of inline gtag.js:
1. Install GTM container on all pages
2. Create Google Ads conversion tags in GTM
3. Set triggers for conversion events (form submissions, purchases)
4. Use the Data Layer to pass dynamic values (order amount, transaction ID)
5. Test with GTM Preview mode before publishing

---

## Meta (Facebook/Instagram)

### Install the Meta Pixel

Add to every page, in `<head>`:

```html
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

Replace `YOUR_PIXEL_ID` from Meta Events Manager.

### Standard events

```javascript
// View a product or key page
fbq('track', 'ViewContent', {
  content_name: 'Pro Plan',
  content_category: 'Pricing',
  value: 29.00,
  currency: 'USD'
});

// Lead capture (form submit, demo request)
fbq('track', 'Lead', {
  content_name: 'Demo Request',
  value: 50.00,
  currency: 'USD'
});

// Purchase
fbq('track', 'Purchase', {
  value: 99.00,
  currency: 'USD',
  content_type: 'product',
  contents: [{ id: 'pro-plan', quantity: 1 }]
});

// Add to cart (e-commerce)
fbq('track', 'AddToCart', {
  content_ids: ['SKU-123'],
  content_type: 'product',
  value: 49.00,
  currency: 'USD'
});
```

### Conversions API (CAPI)

Server-side tracking that works alongside the pixel. Required for accurate tracking after iOS 14+ and cookie restrictions.

Set up via:
- **Direct integration** — send events from your server to Meta's API
- **Partner integrations** — Shopify, WooCommerce, Segment, etc. have built-in CAPI support
- **Conversions API Gateway** — Meta's managed solution via AWS

Key: send the same events from both pixel (browser) AND CAPI (server), with a shared `event_id` for deduplication.

### Aggregated Event Measurement

Required for iOS 14+ tracking. In Events Manager > Aggregated Event Measurement:
1. Verify your domain
2. Configure and prioritize your top 8 events in order of business importance
3. Purchase should typically be #1, Lead #2

---

## LinkedIn

### Install the Insight Tag

Add to every page, before `</body>`:

```html
<script type="text/javascript">
  _linkedin_partner_id = "YOUR_PARTNER_ID";
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(_linkedin_partner_id);
  (function(l) {
    if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
    window.lintrk.q=[]}
    var s = document.getElementsByTagName("script")[0];
    var b = document.createElement("script");
    b.type = "text/javascript";b.async = true;
    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
```

### Conversion tracking

LinkedIn supports two methods:

**URL-based**: Fires when someone visits a specific URL (e.g., `/thank-you`).
Set up in Campaign Manager > Analyze > Conversion Tracking > Create Conversion.

**Event-based**: Fire manually on specific actions:

```javascript
window.lintrk('track', { conversion_id: YOUR_CONVERSION_ID });
```

### LinkedIn CAPI

For server-side tracking, LinkedIn offers a Conversions API. Set up via partner integrations (Segment, Tealium) or direct API calls. Deduplicates with the Insight Tag automatically when configured correctly.

---

## TikTok

### Install the TikTok Pixel

Add to every page, in `<head>`:

```html
<script>
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
    ttq.methods=["page","track","identify","instances","debug","on","off",
    "once","ready","alias","group","enableCookie","disableCookie","holdConsent",
    "revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e)
    {t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
    ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;
    n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
    ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",
    o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,
    ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},
    ttq._o[e]=n||{};var s=document.createElement("script");
    s.type="text/javascript",s.async=!0,s.src=r+"?sdkid="+e+"&lib="+t;
    var a=document.getElementsByTagName("script")[0];
    a.parentNode.insertBefore(s,a)};
    ttq.load('YOUR_PIXEL_ID');
    ttq.page();
  }(window, document, 'ttq');
</script>
```

### Standard events

```javascript
// View content
ttq.track('ViewContent', {
  content_id: 'pro-plan',
  content_type: 'product',
  content_name: 'Pro Plan',
  value: 29.00,
  currency: 'USD'
});

// Complete registration / sign up
ttq.track('CompleteRegistration', {
  content_name: 'Free Trial'
});

// Purchase
ttq.track('Purchase', {
  content_id: 'pro-plan',
  content_type: 'product',
  value: 99.00,
  currency: 'USD',
  quantity: 1
});

// Add to cart
ttq.track('AddToCart', {
  content_id: 'SKU-123',
  content_type: 'product',
  value: 49.00,
  currency: 'USD'
});
```

### Events API (server-side)

TikTok's Events API works like Meta's CAPI — send the same events from your server for better attribution. Use `event_id` for deduplication with browser pixel events.

### Advanced Matching

Pass hashed user data for better attribution:

```javascript
ttq.identify({
  email: 'user@example.com',       // auto-hashed
  phone_number: '+11234567890'
});
```

---

## Validation Checklist

After installing any pixel, verify before going live:

### Browser-side checks

- [ ] Pixel fires on every page (check via browser extension)
- [ ] Conversion events fire at the right moment (after confirmed action, not on button click)
- [ ] Event parameters contain correct values (currency, amount, content IDs)
- [ ] No duplicate events firing on the same action
- [ ] Events fire on both desktop and mobile

### Platform-side checks

- [ ] Events appear in the platform's event manager/diagnostics
- [ ] Test conversions show correct values
- [ ] Event match quality is acceptable (Meta: score > 6)
- [ ] Server-side events are deduplicating with browser events (not double-counting)

### Debugging tools

| Platform | Tool |
|----------|------|
| Google | Google Tag Assistant, Chrome DevTools Network tab |
| Meta | Meta Pixel Helper (Chrome extension), Events Manager Test Events |
| LinkedIn | Insight Tag Validator in Campaign Manager |
| TikTok | TikTok Pixel Helper (Chrome extension), Events Manager |
| All | GTM Preview Mode (if using Google Tag Manager) |

---

## Common Mistakes

- **Firing purchase events on button click instead of confirmed payment** — always fire on the success/thank-you page or after server confirmation
- **Missing deduplication between pixel and server events** — without a shared `event_id`, you'll double-count conversions
- **Not testing on mobile** — many pixels break on mobile browsers or in-app webviews
- **Hardcoded test values** — remove test transaction amounts before going live
- **Forgetting to exclude internal traffic** — your team's visits inflate conversion data
- **Installing pixels without consent management** — GDPR/CCPA require user consent before firing tracking pixels in applicable regions
- **Pixel installed but no conversion actions created** — the pixel collects data, but the ad platform won't optimize without defined conversion actions

---

## When to Use Server-Side Tracking

Browser-only tracking is increasingly unreliable due to:
- iOS 14+ App Tracking Transparency
- Third-party cookie deprecation
- Ad blockers (30%+ of tech audiences)

**Use server-side (CAPI/Events API) when:**
- Running Meta or TikTok ads (strongly recommended)
- Your audience is tech-savvy (higher ad blocker usage)
- You need accurate purchase/revenue attribution
- You're spending >$5K/month on any platform

**Server-side is optional when:**
- Running Google Ads only (Enhanced Conversions covers most gaps)
- Low ad spend / testing phase
- B2B with LinkedIn only (Insight Tag is still reliable)

### references/platform-setup-checklists.md

# Platform Setup Checklists

Complete setup checklists for major ad platforms.

## Contents
- Google Ads Setup (Account Foundation, Conversion Tracking, Analytics Integration, Audience Setup, Campaign Readiness, Ad Extensions, Brand Protection)
- Meta Ads Setup (Business Manager Foundation, Pixel & Tracking, Domain & Aggregated Events, Audience Setup, Catalog, Creative Assets, Compliance)
- LinkedIn Ads Setup (Campaign Manager Foundation, Insight Tag & Tracking, Audience Setup, Lead Gen Forms, Document Ads, Creative Assets, Budget Considerations)
- Twitter/X Ads Setup (Account Foundation, Tracking, Audience Setup, Creative)
- TikTok Ads Setup (Account Foundation, Pixel & Tracking, Audience Setup, Creative)
- Universal Pre-Launch Checklist

## Google Ads Setup

### Account Foundation

- [ ] Google Ads account created and verified
- [ ] Billing information added
- [ ] Time zone and currency set correctly
- [ ] Account access granted to team members

### Conversion Tracking

- [ ] Google tag installed on all pages
- [ ] Conversion actions created (purchase, lead, signup)
- [ ] Conversion values assigned (if applicable)
- [ ] Enhanced conversions enabled
- [ ] Test conversions firing correctly
- [ ] Import conversions from GA4 (optional)

### Analytics Integration

- [ ] Google Analytics 4 linked
- [ ] Auto-tagging enabled
- [ ] GA4 audiences available in Google Ads
- [ ] Cross-domain tracking set up (if multiple domains)

### Audience Setup

- [ ] Remarketing tag verified
- [ ] Website visitor audiences created:
  - All visitors (180 days)
  - Key page visitors (pricing, demo, features)
  - Converters (for exclusion)
- [ ] Customer match lists uploaded
- [ ] Similar audiences enabled

### Campaign Readiness

- [ ] Negative keyword lists created:
  - Universal negatives (free, jobs, careers, reviews, complaints)
  - Competitor negatives (if needed)
  - Irrelevant industry terms
- [ ] Location targeting set (include/exclude)
- [ ] Language targeting set
- [ ] Ad schedule configured (if B2B, business hours)
- [ ] Device bid adjustments considered

### Ad Extensions

- [ ] Sitelinks (4-6 relevant pages)
- [ ] Callouts (key benefits, offers)
- [ ] Structured snippets (features, types, services)
- [ ] Call extension (if phone leads valuable)
- [ ] Lead form extension (if using)
- [ ] Price extensions (if applicable)
- [ ] Image extensions (where available)

### Brand Protection

- [ ] Brand campaign running (protect branded terms)
- [ ] Competitor campaigns considered
- [ ] Brand terms in negative lists for non-brand campaigns

---

## Meta Ads Setup

### Business Manager Foundation

- [ ] Business Manager created
- [ ] Business verified (if running certain ad types)
- [ ] Ad account created within Business Manager
- [ ] Payment method added
- [ ] Team access configured with proper roles

### Pixel & Tracking

- [ ] Meta Pixel installed on all pages
- [ ] Standard events configured:
  - PageView (automatic)
  - ViewContent (product/feature pages)
  - Lead (form submissions)
  - Purchase (conversions)
  - AddToCart (if e-commerce)
  - InitiateCheckout (if e-commerce)
- [ ] Conversions API (CAPI) set up for server-side tracking
- [ ] Event Match Quality score > 6
- [ ] Test events in Events Manager

### Domain & Aggregated Events

- [ ] Domain verified in Business Manager
- [ ] Aggregated Event Measurement configured
- [ ] Top 8 events prioritized in order of importance
- [ ] Web events prioritized for iOS 14+ tracking

### Audience Setup

- [ ] Custom audiences created:
  - Website visitors (all, 30/60/90/180 days)
  - Key page visitors
  - Video viewers (25%, 50%, 75%, 95%)
  - Page/Instagram engagers
  - Customer list uploaded
- [ ] Lookalike audiences created (1%, 1-3%)
- [ ] Saved audiences for common targeting

### Catalog (E-commerce)

- [ ] Product catalog connected
- [ ] Product feed updating correctly
- [ ] Catalog sales campaigns enabled
- [ ] Dynamic product ads configured

### Creative Assets

- [ ] Images in correct sizes:
  - Feed: 1080x1080 (1:1)
  - Stories/Reels: 1080x1920 (9:16)
  - Landscape: 1200x628 (1.91:1)
- [ ] Videos in correct formats
- [ ] Ad copy variations ready
- [ ] UTM parameters in all destination URLs

### Compliance

- [ ] Special Ad Categories declared (if housing, credit, employment, politics)
- [ ] Landing page complies with Meta policies
- [ ] No prohibited content in ads

---

## LinkedIn Ads Setup

### Campaign Manager Foundation

- [ ] Campaign Manager account created
- [ ] Company Page connected
- [ ] Billing information added
- [ ] Team access configured

### Insight Tag & Tracking

- [ ] LinkedIn Insight Tag installed on all pages
- [ ] Tag verified and firing
- [ ] Conversion tracking configured:
  - URL-based conversions
  - Event-specific conversions
- [ ] Conversion values set (if applicable)

### Audience Setup

- [ ] Matched Audiences created:
  - Website retargeting audiences
  - Company list uploaded (for ABM)
  - Contact list uploaded
- [ ] Lookalike audiences created
- [ ] Saved audiences for common targeting

### Lead Gen Forms (if using)

- [ ] Lead gen form templates created
- [ ] Form fields selected (minimize for conversion)
- [ ] Privacy policy URL added
- [ ] Thank you message configured
- [ ] CRM integration set up (or CSV export process)

### Document Ads (if using)

- [ ] Documents uploaded (PDF, PowerPoint)
- [ ] Gating configured (full gate or preview)
- [ ] Lead gen form connected

### Creative Assets

- [ ] Single image ads: 1200x627 (1.91:1) or 1080x1080 (1:1)
- [ ] Carousel images ready
- [ ] Video specs met (if using)
- [ ] Ad copy within character limits:
  - Intro text: 600 max, 150 recommended
  - Headline: 200 max, 70 recommended

### Budget Considerations

- [ ] Budget realistic for LinkedIn CPCs ($8-15+ typical)
- [ ] Audience size validated (50K+ recommended)
- [ ] Daily vs. lifetime budget decided
- [ ] Bid strategy selected

---

## Twitter/X Ads Setup

### Account Foundation

- [ ] Ads account created
- [ ] Payment method added
- [ ] Account verified (if required)

### Tracking

- [ ] Twitter Pixel installed
- [ ] Conversion events created
- [ ] Website tag verified

### Audience Setup

- [ ] Tailored audiences created:
  - Website visitors
  - Customer lists
- [ ] Follower lookalikes identified
- [ ] Interest and keyword targets researched

### Creative

- [ ] Tweet copy within 280 characters
- [ ] Images: 1200x675 (1.91:1) or 1200x1200 (1:1)
- [ ] Video specs met (if using)
- [ ] Cards configured (website, app, etc.)

---

## TikTok Ads Setup

### Account Foundation

- [ ] TikTok Ads Manager account created
- [ ] Business verification completed
- [ ] Payment method added

### Pixel & Tracking

- [ ] TikTok Pixel installed
- [ ] Events configured (ViewContent, Purchase, etc.)
- [ ] Events API set up (recommended)

### Audience Setup

- [ ] Custom audiences created
- [ ] Lookalike audiences created
- [ ] Interest categories identified

### Creative

- [ ] Vertical video (9:16) ready
- [ ] Native-feeling content (not too polished)
- [ ] First 3 seconds are compelling hooks
- [ ] Captions added (most watch without sound)
- [ ] Music/sounds selected (licensed if needed)

---

## Universal Pre-Launch Checklist

Before launching any campaign:

- [ ] Conversion tracking tested with real conversion
- [ ] Landing page loads fast (<3 sec)
- [ ] Landing page mobile-friendly
- [ ] UTM parameters working
- [ ] Budget set correctly (daily vs. lifetime)
- [ ] Start/end dates correct
- [ ] Targeting matches intended audience
- [ ] Ad creative approved
- [ ] Team notified of launch
- [ ] Reporting dashboard ready

