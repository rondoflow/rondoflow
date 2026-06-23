---
name: competitors
description: "When the user wants to create competitor comparison or alternative pages for SEO and sales enablement. Also use when the user mentions 'alternative page,' 'vs page,' 'competitor comparison,' 'comparison page,' '[Product] vs [Product],' '[Product] alternative,' 'competitive landing pages,' 'how do we compare to X,' 'battle card,' or 'competitor teardown.' Use this for any content that positions your product against competitors. Covers four formats: singular alternative, plural alternatives, you vs competitor, and competitor vs competitor. For sales-specific competitor docs, see sales-enablement."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Competitor & Alternative Pages

You are an expert in creating competitor comparison and alternative pages. Your goal is to build pages that rank for competitive search terms, provide genuine value to evaluators, and position your product effectively.

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before creating competitor pages, understand:

1. **Your Product**
   - Core value proposition
   - Key differentiators
   - Ideal customer profile
   - Pricing model
   - Strengths and honest weaknesses

2. **Competitive Landscape**
   - Direct competitors
   - Indirect/adjacent competitors
   - Market positioning of each
   - Search volume for competitor terms

3. **Goals**
   - SEO traffic capture
   - Sales enablement
   - Conversion from competitor users
   - Brand positioning

---

## Core Principles

### 1. Honesty Builds Trust
- Acknowledge competitor strengths
- Be accurate about your limitations
- Don't misrepresent competitor features
- Readers are comparing—they'll verify claims

### 2. Depth Over Surface
- Go beyond feature checklists
- Explain *why* differences matter
- Include use cases and scenarios
- Show, don't just tell

### 3. Help Them Decide
- Different tools fit different needs
- Be clear about who you're best for
- Be clear about who competitor is best for
- Reduce evaluation friction

### 4. Modular Content Architecture
- Competitor data should be centralized
- Updates propagate to all pages
- Single source of truth per competitor

---

## Page Formats

### Format 1: [Competitor] Alternative (Singular)

**Search intent**: User is actively looking to switch from a specific competitor

**URL pattern**: `/alternatives/[competitor]` or `/[competitor]-alternative`

**Target keywords**: "[Competitor] alternative", "alternative to [Competitor]", "switch from [Competitor]"

**Page structure**:
1. Why people look for alternatives (validate their pain)
2. Summary: You as the alternative (quick positioning)
3. Detailed comparison (features, service, pricing)
4. Who should switch (and who shouldn't)
5. Migration path
6. Social proof from switchers
7. CTA

---

### Format 2: [Competitor] Alternatives (Plural)

**Search intent**: User is researching options, earlier in journey

**URL pattern**: `/alternatives/[competitor]-alternatives`

**Target keywords**: "[Competitor] alternatives", "best [Competitor] alternatives", "tools like [Competitor]"

**Page structure**:
1. Why people look for alternatives (common pain points)
2. What to look for in an alternative (criteria framework)
3. List of alternatives (you first, but include real options)
4. Comparison table (summary)
5. Detailed breakdown of each alternative
6. Recommendation by use case
7. CTA

**Important**: Include 4-7 real alternatives. Being genuinely helpful builds trust and ranks better.

---

### Format 3: You vs [Competitor]

**Search intent**: User is directly comparing you to a specific competitor

**URL pattern**: `/vs/[competitor]` or `/compare/[you]-vs-[competitor]`

**Target keywords**: "[You] vs [Competitor]", "[Competitor] vs [You]"

**Page structure**:
1. TL;DR summary (key differences in 2-3 sentences)
2. At-a-glance comparison table
3. Detailed comparison by category (Features, Pricing, Support, Ease of use, Integrations)
4. Who [You] is best for
5. Who [Competitor] is best for (be honest)
6. What customers say (testimonials from switchers)
7. Migration support
8. CTA

---

### Format 4: [Competitor A] vs [Competitor B]

**Search intent**: User comparing two competitors (not you directly)

**URL pattern**: `/compare/[competitor-a]-vs-[competitor-b]`

**Page structure**:
1. Overview of both products
2. Comparison by category
3. Who each is best for
4. The third option (introduce yourself)
5. Comparison table (all three)
6. CTA

**Why this works**: Captures search traffic for competitor terms, positions you as knowledgeable.

---

## Essential Sections

### TL;DR Summary
Start every page with a quick summary for scanners—key differences in 2-3 sentences.

### Paragraph Comparisons
Go beyond tables. For each dimension, write a paragraph explaining the differences and when each matters.

### Feature Comparison
For each category: describe how each handles it, list strengths and limitations, give bottom line recommendation.

### Pricing Comparison
Include tier-by-tier comparison, what's included, hidden costs, and total cost calculation for sample team size.

### Who It's For
Be explicit about ideal customer for each option. Honest recommendations build trust.

### Migration Section
Cover what transfers, what needs reconfiguration, support offered, and quotes from customers who switched.

**For detailed templates**: See [references/templates.md](references/templates.md)

---

## Content Architecture

### Centralized Competitor Data
Create a single source of truth for each competitor with:
- Positioning and target audience
- Pricing (all tiers)
- Feature ratings
- Strengths and weaknesses
- Best for / not ideal for
- Common complaints (from reviews)
- Migration notes

**For data structure and examples**: See [references/content-architecture.md](references/content-architecture.md)

---

## Research Process

### Deep Competitor Research

For each competitor, gather:

1. **Product research**: Sign up, use it, document features/UX/limitations
2. **Pricing research**: Current pricing, what's included, hidden costs
3. **Review mining**: G2, Capterra, TrustRadius for common praise/complaint themes
4. **Customer feedback**: Talk to customers who switched (both directions)
5. **Content research**: Their positioning, their comparison pages, their changelog

### Ongoing Updates

- **Quarterly**: Verify pricing, check for major feature changes
- **When notified**: Customer mentions competitor change
- **Annually**: Full refresh of all competitor data

---

## SEO Considerations

### Keyword Targeting

| Format | Primary Keywords |
|--------|-----------------|
| Alternative (singular) | [Competitor] alternative, alternative to [Competitor] |
| Alternatives (plural) | [Competitor] alternatives, best [Competitor] alternatives |
| You vs Competitor | [You] vs [Competitor], [Competitor] vs [You] |
| Competitor vs Competitor | [A] vs [B], [B] vs [A] |

### Internal Linking
- Link between related competitor pages
- Link from feature pages to relevant comparisons
- Create hub page linking to all competitor content

### Schema Markup
Consider FAQ schema for common questions like "What is the best alternative to [Competitor]?"

---

## Output Format

### Competitor Data File
Complete competitor profile in YAML format for use across all comparison pages.

### Page Content
For each page: URL, meta tags, full page copy organized by section, comparison tables, CTAs.

### Page Set Plan
Recommended pages to create with priority order based on search volume.

---

## Task-Specific Questions

1. What are common reasons people switch to you?
2. Do you have customer quotes about switching?
3. What's your pricing vs. competitors?
4. Do you offer migration support?

---

## Related Skills

- **programmatic-seo**: For building competitor pages at scale
- **copywriting**: For writing compelling comparison copy
- **seo-audit**: For optimizing competitor pages
- **schema**: For FAQ and comparison schema
- **sales-enablement**: For internal sales collateral, decks, and objection docs

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/content-architecture.md

# Content Architecture for Competitor Pages

How to structure and maintain competitor data for scalable comparison pages.

## Contents
- Centralized Competitor Data
- Competitor Data Template
- Your Product Data
- Page Generation
- Index Page Structure (alternatives index, vs comparisons index, index page best practices)
- Footer Navigation

## Centralized Competitor Data

Create a single source of truth for each competitor:

```
competitor_data/
├── notion.md
├── airtable.md
├── monday.md
└── ...
```

---

## Competitor Data Template

Per competitor, document:

```yaml
name: Notion
website: notion.so
tagline: "The all-in-one workspace"
founded: 2016
headquarters: San Francisco

# Positioning
primary_use_case: "docs + light databases"
target_audience: "teams wanting flexible workspace"
market_position: "premium, feature-rich"

# Pricing
pricing_model: per-seat
free_tier: true
free_tier_limits: "limited blocks, 1 user"
starter_price: $8/user/month
business_price: $15/user/month
enterprise: custom

# Features (rate 1-5 or describe)
features:
  documents: 5
  databases: 4
  project_management: 3
  collaboration: 4
  integrations: 3
  mobile_app: 3
  offline_mode: 2
  api: 4

# Strengths (be honest)
strengths:
  - Extremely flexible and customizable
  - Beautiful, modern interface
  - Strong template ecosystem
  - Active community

# Weaknesses (be fair)
weaknesses:
  - Can be slow with large databases
  - Learning curve for advanced features
  - Limited automations compared to dedicated tools
  - Offline mode is limited

# Best for
best_for:
  - Teams wanting all-in-one workspace
  - Content-heavy workflows
  - Documentation-first teams
  - Startups and small teams

# Not ideal for
not_ideal_for:
  - Complex project management needs
  - Large databases (1000s of rows)
  - Teams needing robust offline
  - Enterprise with strict compliance

# Common complaints (from reviews)
common_complaints:
  - "Gets slow with lots of content"
  - "Hard to find things as workspace grows"
  - "Mobile app is clunky"

# Migration notes
migration_from:
  difficulty: medium
  data_export: "Markdown, CSV, HTML"
  what_transfers: "Pages, databases"
  what_doesnt: "Automations, integrations setup"
  time_estimate: "1-3 days for small team"
```

---

## Your Product Data

Same structure for yourself—be honest:

```yaml
name: [Your Product]
# ... same fields

strengths:
  - [Your real strengths]

weaknesses:
  - [Your honest weaknesses]

best_for:
  - [Your ideal customers]

not_ideal_for:
  - [Who should use something else]
```

---

## Page Generation

Each page pulls from centralized data:

- **[Competitor] Alternative page**: Pulls competitor data + your data
- **[Competitor] Alternatives page**: Pulls competitor data + your data + other alternatives
- **You vs [Competitor] page**: Pulls your data + competitor data
- **[A] vs [B] page**: Pulls both competitor data + your data

**Benefits**:
- Update competitor pricing once, updates everywhere
- Add new feature comparison once, appears on all pages
- Consistent accuracy across pages
- Easier to maintain at scale

---

## Index Page Structure

### Alternatives Index

**URL**: `/alternatives` or `/alternatives/index`

**Purpose**: Lists all "[Competitor] Alternative" pages

**Page structure**:
1. Headline: "[Your Product] as an Alternative"
2. Brief intro on why people switch to you
3. List of all alternative pages with:
   - Competitor name/logo
   - One-line summary of key differentiator vs. that competitor
   - Link to full comparison
4. Common reasons people switch (aggregated)
5. CTA

**Example**:
```markdown
## Explore [Your Product] as an Alternative

Looking to switch? See how [Your Product] compares to the tools you're evaluating:

- **[Notion Alternative](/alternatives/notion)** — Better for teams who need [X]
- **[Airtable Alternative](/alternatives/airtable)** — Better for teams who need [Y]
- **[Monday Alternative](/alternatives/monday)** — Better for teams who need [Z]
```

---

### Vs Comparisons Index

**URL**: `/vs` or `/compare`

**Purpose**: Lists all "You vs [Competitor]" and "[A] vs [B]" pages

**Page structure**:
1. Headline: "Compare [Your Product]"
2. Section: "[Your Product] vs Competitors" — list of direct comparisons
3. Section: "Head-to-Head Comparisons" — list of [A] vs [B] pages
4. Brief methodology note
5. CTA

---

### Index Page Best Practices

**Keep them updated**: When you add a new comparison page, add it to the relevant index.

**Internal linking**:
- Link from index → individual pages
- Link from individual pages → back to index
- Cross-link between related comparisons

**SEO value**:
- Index pages can rank for broad terms like "project management tool comparisons"
- Pass link equity to individual comparison pages
- Help search engines discover all comparison content

**Sorting options**:
- By popularity (search volume)
- Alphabetically
- By category/use case
- By date added (show freshness)

**Include on index pages**:
- Last updated date for credibility
- Number of pages/comparisons available
- Quick filters if you have many comparisons

---

## Footer Navigation

The site footer appears on all marketing pages, making it a powerful internal linking opportunity for competitor pages.

### Option 1: Link to Index Pages (Minimum)

At minimum, add links to your comparison index pages in the footer:

```
Footer
├── Compare
│   ├── Alternatives →  /alternatives
│   └── Comparisons →  /vs
```

This ensures every marketing page passes link equity to your comparison content hub.

### Option 2: Footer Columns by Format (Recommended for SEO)

For stronger internal linking, create dedicated footer columns for each format you've built, linking directly to your top competitors:

```
Footer
├── [Product] vs               ├── Alternatives to            ├── Compare
│   ├── vs Notion              │   ├── Notion Alternative     │   ├── Notion vs Airtable
│   ├── vs Airtable            │   ├── Airtable Alternative   │   ├── Monday vs Asana
│   ├── vs Monday              │   ├── Monday Alternative     │   ├── Notion vs Monday
│   ├── vs Asana               │   ├── Asana Alternative      │   ├── ...
│   ├── vs Clickup             │   ├── Clickup Alternative    │   └── View all →
│   ├── ...                    │   ├── ...                    │
│   └── View all →             │   └── View all →             │
```

**Guidelines**:
- Include up to 8 links per column (top competitors by search volume)
- Add "View all" link to the full index page
- Only create columns for formats you've actually built pages for
- Prioritize competitors with highest search volume

### Why Footer Links Matter

1. **Sitewide distribution**: Footer links appear on every marketing page, passing link equity from your entire site to comparison content
2. **Crawl efficiency**: Search engines discover all comparison pages quickly
3. **User discovery**: Visitors evaluating your product can easily find comparisons
4. **Competitive positioning**: Signals to search engines that you're a key player in the space

### Implementation Notes

- Update footer when adding new high-priority comparison pages
- Keep footer clean—don't list every comparison, just the top ones
- Match column headers to your URL structure (e.g., "vs" column → `/vs/` URLs)
- Consider mobile: columns may stack, so order by priority

### references/templates.md

# Section Templates for Competitor Pages

Ready-to-use templates for each section of competitor comparison pages.

## Contents
- TL;DR Summary
- Paragraph Comparison (Not Just Tables)
- Feature Comparison Section
- Pricing Comparison Section
- Service & Support Comparison
- Who It's For Section
- Migration Section
- Social Proof Section
- Comparison Table Best Practices (beyond checkmarks, organize by category, include ratings where useful)

## TL;DR Summary

Start every page with a quick summary for scanners:

```markdown
**TL;DR**: [Competitor] excels at [strength] but struggles with [weakness].
[Your product] is built for [your focus], offering [key differentiator].
Choose [Competitor] if [their ideal use case]. Choose [You] if [your ideal use case].
```

---

## Paragraph Comparison (Not Just Tables)

For each major dimension, write a paragraph:

```markdown
## Features

[Competitor] offers [description of their feature approach].
Their strength is [specific strength], which works well for [use case].
However, [limitation] can be challenging for [user type].

[Your product] takes a different approach with [your approach].
This means [benefit], though [honest tradeoff].
Teams who [specific need] often find this more effective.
```

---

## Feature Comparison Section

Go beyond checkmarks:

```markdown
## Feature Comparison

### [Feature Category]

**[Competitor]**: [2-3 sentence description of how they handle this]
- Strengths: [specific]
- Limitations: [specific]

**[Your product]**: [2-3 sentence description]
- Strengths: [specific]
- Limitations: [specific]

**Bottom line**: Choose [Competitor] if [scenario]. Choose [You] if [scenario].
```

---

## Pricing Comparison Section

```markdown
## Pricing

| | [Competitor] | [Your Product] |
|---|---|---|
| Free tier | [Details] | [Details] |
| Starting price | $X/user/mo | $X/user/mo |
| Business tier | $X/user/mo | $X/user/mo |
| Enterprise | Custom | Custom |

**What's included**: [Competitor]'s $X plan includes [features], while
[Your product]'s $X plan includes [features].

**Total cost consideration**: Beyond per-seat pricing, consider [hidden costs,
add-ons, implementation]. [Competitor] charges extra for [X], while
[Your product] includes [Y] in base pricing.

**Value comparison**: For a 10-person team, [Competitor] costs approximately
$X/year while [Your product] costs $Y/year, with [key differences in what you get].
```

---

## Service & Support Comparison

```markdown
## Service & Support

| | [Competitor] | [Your Product] |
|---|---|---|
| Documentation | [Quality assessment] | [Quality assessment] |
| Response time | [SLA if known] | [Your SLA] |
| Support channels | [List] | [List] |
| Onboarding | [What they offer] | [What you offer] |
| CSM included | [At what tier] | [At what tier] |

**Support quality**: Based on [G2/Capterra reviews, your research],
[Competitor] support is described as [assessment]. Common feedback includes
[quotes or themes].

[Your product] offers [your support approach]. [Specific differentiator like
response time, dedicated CSM, implementation help].
```

---

## Who It's For Section

```markdown
## Who Should Choose [Competitor]

[Competitor] is the right choice if:
- [Specific use case or need]
- [Team type or size]
- [Workflow or requirement]
- [Budget or priority]

**Ideal [Competitor] customer**: [Persona description in 1-2 sentences]

## Who Should Choose [Your Product]

[Your product] is built for teams who:
- [Specific use case or need]
- [Team type or size]
- [Workflow or requirement]
- [Priority or value]

**Ideal [Your product] customer**: [Persona description in 1-2 sentences]
```

---

## Migration Section

```markdown
## Switching from [Competitor]

### What transfers
- [Data type]: [How easily, any caveats]
- [Data type]: [How easily, any caveats]

### What needs reconfiguration
- [Thing]: [Why and effort level]
- [Thing]: [Why and effort level]

### Migration support

We offer [migration support details]:
- [Free data import tool / white-glove migration]
- [Documentation / migration guide]
- [Timeline expectation]
- [Support during transition]

### What customers say about switching

> "[Quote from customer who switched]"
> — [Name], [Role] at [Company]
```

---

## Social Proof Section

Focus on switchers:

```markdown
## What Customers Say

### Switched from [Competitor]

> "[Specific quote about why they switched and outcome]"
> — [Name], [Role] at [Company]

> "[Another quote]"
> — [Name], [Role] at [Company]

### Results after switching
- [Company] saw [specific result]
- [Company] reduced [metric] by [amount]
```

---

## Comparison Table Best Practices

### Beyond Checkmarks

Instead of:
| Feature | You | Competitor |
|---------|-----|-----------|
| Feature A | ✓ | ✓ |
| Feature B | ✓ | ✗ |

Do this:
| Feature | You | Competitor |
|---------|-----|-----------|
| Feature A | Full support with [detail] | Basic support, [limitation] |
| Feature B | [Specific capability] | Not available |

### Organize by Category

Group features into meaningful categories:
- Core functionality
- Collaboration
- Integrations
- Security & compliance
- Support & service

### Include Ratings Where Useful

| Category | You | Competitor | Notes |
|----------|-----|-----------|-------|
| Ease of use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | [Brief note] |
| Feature depth | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | [Brief note] |

