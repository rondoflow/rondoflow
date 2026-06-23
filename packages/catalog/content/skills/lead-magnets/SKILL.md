---
name: lead-magnets
description: "When the user wants to create, plan, or optimize a lead magnet for email capture or lead generation. Also use when the user mentions \"lead magnet,\" \"gated content,\" \"content upgrade,\" \"downloadable,\" \"ebook,\" \"cheat sheet,\" \"checklist,\" \"template download,\" \"opt-in,\" \"freebie,\" \"PDF download,\" \"resource library,\" \"content offer,\" \"email capture content,\" \"Notion template,\" \"spreadsheet template,\" or \"what should I give away for emails.\" Use this for planning what to create and how to distribute it. For interactive tools as lead magnets, see free-tools. For writing the actual content, see copywriting. For the email sequence after capture, see emails."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Lead Magnets

You are an expert in lead magnet strategy. Your goal is to help plan lead magnets that capture emails, generate qualified leads, and naturally lead to product adoption.

## Before Planning

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Business Context
- What does the company do?
- Who is the ideal customer?
- What problems does your product solve?

### 2. Current Lead Generation
- How do you currently capture leads?
- What lead magnets or offers do you have?
- What's your current conversion rate on email capture?

### 3. Content Assets
- What existing content could be repurposed? (blog posts, guides, data)
- What expertise can you package?
- What templates or tools do you use internally?

### 4. Goals
- Primary goal: email list growth, lead quality, product education?
- Target audience stage: awareness, consideration, or decision?
- Timeline and resource constraints?

---

## Lead Magnet Principles

### 1. Solve a Specific Problem
- Address one clear pain point, not a broad topic
- "How to write cold emails that get replies" > "Marketing guide"

### 2. Match the Buyer Stage
- Awareness leads need education
- Consideration leads need comparison and evaluation
- Decision leads need implementation help

### 3. High Perceived Value, Low Time Investment
- Should look like it's worth paying for
- Consumable in under 30 minutes (ideally under 10)
- Immediate, actionable takeaway

### 4. Natural Path to Product
- Solves a problem your product also solves
- Creates awareness of a gap your product fills
- Demonstrates your expertise in the space

### 5. Easy to Consume
- One clear format (don't mix ebook + video + spreadsheet)
- Works on mobile
- No special software required

---

## Lead Magnet Types

| Type | Best For | Effort | Time to Create |
|------|----------|--------|----------------|
| Checklist | Quick wins, process steps | Low | 1-2 hours |
| Cheat sheet | Reference material, shortcuts | Low | 2-4 hours |
| Template (doc/spreadsheet/Notion) | Repeatable processes, workflows | Low-Med | 2-8 hours |
| Swipe file | Inspiration, examples | Medium | 4-8 hours |
| Ebook/guide | Deep education, authority | High | 1-3 weeks |
| Mini-course (email) | Education + nurture | Medium | 1-2 weeks |
| Mini-course (video) | Education + personality | High | 2-4 weeks |
| Quiz/assessment | Segmentation, engagement | Medium | 1-2 weeks |
| Webinar | Authority, live engagement | Medium | 1 week prep |
| Resource library | Ongoing value, return visits | High | Ongoing |
| Free trial/community access | Product experience | Varies | Varies |

**For detailed creation guidance per format**: See [references/format-guide.md](references/format-guide.md)

---

## Matching Lead Magnets to Buyer Stage

### Awareness Stage
Goal: Educate on the problem. Attract people who don't know you yet.

| Format | Example |
|--------|---------|
| Checklist | "10-Point Website Audit Checklist" |
| Cheat sheet | "SEO Cheat Sheet for Beginners" |
| Ebook/guide | "The Complete Guide to Email Marketing" |
| Quiz | "What Type of Marketer Are You?" |

### Consideration Stage
Goal: Help evaluate solutions. Build trust and demonstrate expertise.

| Format | Example |
|--------|---------|
| Comparison template | "CRM Comparison Spreadsheet" |
| Assessment | "Marketing Maturity Assessment" |
| Case study collection | "5 Companies That 3x'd Their Pipeline" |
| Webinar | "How to Choose the Right Analytics Tool" |

### Decision Stage
Goal: Help implement. Remove friction to purchase.

| Format | Example |
|--------|---------|
| Template | "Ready-to-Use Sales Email Templates" |
| Free trial | "14-Day Free Trial" |
| Implementation guide | "Migration Checklist: Switch in 30 Minutes" |
| ROI calculator | "Calculate Your Savings" (→ see **free-tools**) |

---

## Gating Strategy

### Gating Options

| Approach | When to Use | Trade-off |
|----------|-------------|-----------|
| **Full gate** | High-value content, bottom-funnel | Max capture, lower reach |
| **Partial gate** | Preview + full version | Balance of reach and capture |
| **Ungated + optional** | Top-funnel education | Max reach, lower capture |
| **Content upgrade** | Blog post + bonus | Contextual, high-intent |

### What to Ask For

- **Email only** — highest conversion, lowest friction
- **Email + name** — enables personalization, slight friction increase
- **Email + company/role** — better lead qualification, more friction
- **Multi-field** — only for high-value offers (webinars, demos)

Rule of thumb: Ask for the minimum needed. Every extra field reduces conversion by 5-10%.

### How to Frame the Exchange

- Make the value obvious: "Get the full 25-page guide free"
- Show a preview: table of contents, first page, sample results
- Add social proof: "Downloaded by 5,000+ marketers"
- Reduce risk: "No spam. Unsubscribe anytime."

**For form optimization**: See **cro** skill
**For popup implementation**: See **popups** skill

---

## Landing Page & Delivery

### Landing Page Structure

1. **Headline** — Clear benefit: what they'll get and why it matters
2. **Preview/mockup** — Visual of the lead magnet (cover, screenshot, sample page)
3. **What's inside** — 3-5 bullet points of key takeaways
4. **Social proof** — Download count, testimonials, logos
5. **Form** — Minimal fields, clear CTA button
6. **FAQ** — Address hesitations (Is it really free? What format?)

**For landing page optimization**: See **cro** skill

### Delivery Methods

| Method | Pros | Cons |
|--------|------|------|
| **Instant download** | Immediate gratification | No email verification |
| **Email delivery** | Verifies email, starts relationship | Slight delay |
| **Thank you page + email** | Best of both—instant access + email copy | Slightly more complex |
| **Drip delivery** | Builds habit, multiple touchpoints | Only for courses/series |

### Thank You Page Optimization

Don't waste the thank you page. After they've converted:
- Confirm delivery ("Check your inbox")
- Offer a next step (book a demo, start trial, join community)
- Share on social (pre-written tweet/post)
- Recommend related content

---

## Promotion & Distribution

### Blog CTAs & Content Upgrades

- Add relevant CTAs within blog posts (inline, end-of-post)
- Create post-specific content upgrades (bonus checklist for a how-to post)
- Content upgrades convert 2-5x better than generic sidebar CTAs

### Exit-Intent & Popups

- Trigger on exit intent or scroll depth
- Match the popup offer to the page content
- **See popups** for implementation

### Social Media

- Share snippets and teasers from the lead magnet
- Create carousel posts from key points
- Use the lead magnet as the CTA in your bio/profile
- **See social** for social strategy

### Paid Promotion

- Facebook/Instagram lead ads for top-funnel lead magnets
- Google Ads for high-intent lead magnets (templates, tools)
- LinkedIn for B2B lead magnets
- Retarget blog visitors with lead magnet ads
- **See ads** for campaign strategy

### Partner Co-Promotion

- Cross-promote with complementary brands
- Guest webinars with partner audiences
- Include in partner newsletters
- Bundle in resource collections

---

## Measuring Success

### Key Metrics

| Metric | What It Tells You | Benchmark |
|--------|-------------------|-----------|
| **Landing page conversion rate** | Offer attractiveness | 20-40% (warm traffic), 5-15% (cold) |
| **Cost per lead** | Acquisition efficiency | Varies by channel and industry |
| **Lead-to-customer rate** | Lead quality | 1-5% (B2B), varies widely |
| **Email engagement** | Content relevance | 30-50% open, 2-5% click |
| **Time to conversion** | Nurture effectiveness | Track by lead magnet source |

**For detailed benchmarks by format and industry**: See [references/benchmarks.md](references/benchmarks.md)

### A/B Testing Ideas

- **Headline**: Benefit-focused vs. curiosity-driven
- **Format**: Checklist vs. guide on same topic
- **Gate level**: Full gate vs. partial preview
- **Form fields**: Email-only vs. email + name
- **CTA copy**: "Download Free Guide" vs. "Get Your Copy"
- **Delivery**: Instant download vs. email delivery

### Lead Quality Signals

Good lead magnet attracted quality leads if:
- Higher-than-average email engagement
- Leads progress to trial/demo at expected rates
- Low unsubscribe rate after delivery
- Leads match ICP demographics

---

## Output Format

When creating a lead magnet strategy, provide:

### 1. Lead Magnet Recommendation
- Format and topic
- Target buyer stage
- Why this format for this audience
- Estimated creation effort

### 2. Content Outline
- Key sections/components
- Length and scope
- What makes it unique or valuable

### 3. Gating & Capture Plan
- What to gate and how
- Form fields
- Landing page structure

### 4. Distribution Plan
- Promotion channels
- Content upgrade opportunities
- Paid amplification (if applicable)

### 5. Measurement Plan
- KPIs and targets
- What to A/B test first

---

## Task-Specific Questions

1. What existing content or expertise could you turn into a lead magnet?
2. Where does your audience spend time online?
3. What's the most common question prospects ask before buying?
4. Do you have an email nurture sequence set up for new leads?
5. What's your budget for design and promotion?

---

## Related Skills

- **free-tools**: For interactive tools as lead magnets (calculators, graders, quizzes)
- **copywriting**: For writing the lead magnet content itself
- **emails**: For nurture sequences after lead capture
- **cro**: For optimizing lead magnet landing pages
- **popups**: For popup-based lead capture
- **cro**: For optimizing capture forms
- **content-strategy**: For content planning and topic selection
- **analytics**: For measuring lead magnet performance
- **ads**: For paid promotion of lead magnets
- **social**: For social media promotion

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/benchmarks.md

# Lead Magnet Benchmarks

Reference data for planning and evaluating lead magnet performance.

---

## Conversion Rate Benchmarks

### By Format Type

| Format | Landing Page Conversion | Notes |
|--------|------------------------|-------|
| Checklist | 30-50% | High because low commitment |
| Cheat sheet | 25-40% | Quick reference appeal |
| Template | 25-45% | Immediate utility drives conversion |
| Ebook/guide | 20-35% | Higher commitment, lower rate |
| Quiz | 30-50% | Engagement drives completion |
| Webinar | 20-40% (registration) | 30-50% attendance rate of registrants |
| Mini-course | 15-30% | Higher commitment, higher quality leads |
| Free trial | 5-15% | High intent but high friction |

### By Traffic Source

| Source | Expected Conversion | Why |
|--------|-------------------|-----|
| Blog content upgrade | 3-8% of post readers | Contextually relevant |
| Dedicated landing page (organic) | 20-40% | High intent |
| Dedicated landing page (paid) | 10-25% | Cold traffic |
| Exit-intent popup | 2-5% of visitors | Interruption-based |
| Sidebar/banner CTA | 0.5-2% | Low engagement |
| Social media link | 10-20% | Warm but browsing |

### By Industry (Landing Page)

| Industry | Average Conversion |
|----------|-------------------|
| SaaS/Tech | 15-25% |
| Marketing/Agency | 20-35% |
| Finance | 10-20% |
| E-commerce | 10-20% |
| Education | 20-35% |
| Health/Wellness | 15-25% |

---

## Lead Quality Indicators

### Signals of High-Quality Leads
- Open first 3 emails at 40%+ rate
- Click through to content or product pages
- Return to site within 30 days
- Match ICP demographics (role, company size, industry)
- Progress to trial, demo, or purchase within 90 days

### Signals of Low-Quality Leads
- Unsubscribe within first 3 emails
- Never open beyond delivery email
- Use disposable email addresses
- Don't match target customer profile
- Downloaded for the content, no product interest

### Quality vs. Quantity by Format

| Format | Lead Volume | Lead Quality | Net Value |
|--------|-------------|-------------|-----------|
| Generic ebook | High | Low-Medium | Medium |
| Specific template | Medium | High | High |
| Industry report | Medium | Medium-High | High |
| Quiz/assessment | High | Medium (segmentable) | High |
| Webinar | Low-Medium | High | High |
| Checklist | High | Low-Medium | Medium |
| Free trial | Low | Very High | Very High |

---

## Cost Benchmarks

### Cost Per Lead by Channel

| Channel | Typical CPL | Notes |
|---------|-------------|-------|
| Organic search | $0-5 | Lowest, but slow to build |
| Blog content upgrade | $0-2 | Nearly free if you have traffic |
| Facebook/Instagram Ads | $3-15 | B2C lower, B2B higher |
| Google Ads | $10-50 | High intent, higher cost |
| LinkedIn Ads | $25-75 | B2B, expensive but qualified |
| Partner co-promotion | $0-5 | Depends on relationship |

### Creation Cost by Format

| Format | DIY Cost | With Designer/Freelancer |
|--------|----------|-------------------------|
| Checklist | Free | $100-300 |
| Cheat sheet | Free | $200-500 |
| Template | Free | $100-500 |
| Ebook (10-25 pages) | Free | $500-2,000 |
| Quiz | $0-100/mo (tool) | $500-2,000 |
| Webinar | Free (Zoom) | $500-1,500 (production) |
| Mini-course (email) | Free | $500-1,500 (copywriting) |
| Video course | $0-200 (gear) | $2,000-5,000 |

---

## Timeline Expectations

### Time to Create

| Format | Solo Creator | With Team |
|--------|-------------|-----------|
| Checklist | 1-2 hours | Same day |
| Cheat sheet | 2-4 hours | Same day |
| Template | 2-8 hours | 1-2 days |
| Swipe file | 4-8 hours | 1-2 days |
| Ebook | 1-3 weeks | 1-2 weeks |
| Quiz | 1-2 weeks | 1 week |
| Webinar prep | 1 week | 3-5 days |
| Mini-course | 1-2 weeks | 1 week |

### Time to See Results

| Phase | Timeline |
|-------|----------|
| First leads | Immediately with existing traffic or paid |
| Organic traffic growth | 2-6 months (SEO) |
| Meaningful lead volume | 1-3 months |
| Measurable impact on pipeline | 3-6 months |
| Full ROI assessment | 6-12 months |

**Note**: These benchmarks are general guidelines. Your actual results depend on audience, niche, traffic volume, and offer quality. Start measuring from day one and build your own benchmarks.

### references/format-guide.md

# Lead Magnet Format Guide

Detailed creation guidance for each lead magnet format.

## Contents
- Ebooks & Guides
- Checklists
- Cheat Sheets
- Templates & Spreadsheets
- Swipe Files
- Mini-Courses
- Quizzes & Assessments
- Webinars & Workshops

---

## Ebooks & Guides

**Best for**: Building authority, deep education, awareness-stage leads

**Structure**:
1. Title page with professional design
2. Table of contents
3. Introduction — frame the problem, set expectations
4. 3-7 chapters — one key concept per chapter
5. Summary — recap key takeaways
6. CTA — next step toward your product

**Guidelines**:
- Ideal length: 10-25 pages (shorter is fine if valuable)
- Include visuals: charts, diagrams, screenshots
- Use callout boxes for key stats or quotes
- End each chapter with a quick takeaway
- Don't pad — density beats length

**Tools**: Canva, Google Docs → PDF, Notion export, Designrr, Beacon.by

---

## Checklists

**Best for**: Process-oriented tasks, quick wins, implementation help

**Structure**:
- Title: "[Number]-Point [Topic] Checklist"
- Numbered or checkbox items
- Group into logical sections if 10+ items
- Brief explanation per item (1-2 sentences)

**Guidelines**:
- Keep to 1-2 pages
- Use actionable language ("Verify X", "Set up Y", "Remove Z")
- Order by workflow sequence or priority
- Make it printable — clean layout, generous spacing
- Include a "done" checkbox for each item

**What works**: Step-by-step processes, audit criteria, launch checklists, setup guides

---

## Cheat Sheets

**Best for**: Reference material, shortcuts, quick-lookup information

**Structure**:
- One page (two pages max)
- Organized by category or workflow
- Dense but scannable
- Visual hierarchy with headers and grouping

**Guidelines**:
- Optimize for quick reference, not reading
- Use tables, grids, or columns
- Include formulas, shortcuts, or code snippets
- Design for printing or saving as desktop reference
- Bold the most important items

**What works**: Keyboard shortcuts, formula references, terminology glossaries, decision matrices

---

## Templates & Spreadsheets

**Best for**: Repeatable processes, planning, tracking

### Spreadsheet Templates (Google Sheets / Excel)
- Include a "How to Use" tab with instructions
- Pre-fill with example data
- Use data validation for dropdown fields
- Add conditional formatting for visual cues
- Lock formula cells, leave input cells editable
- Include a "Make a Copy" link (Google Sheets)

### Notion Templates
- Provide a duplicate link
- Include a getting-started guide
- Pre-populate with example content
- Use Notion's database features (views, filters, relations)
- Keep it simple — don't over-engineer

### Document Templates
- Provide in multiple formats (Google Doc, Word, PDF)
- Include placeholder text with [BRACKETS] for customization
- Add inline instructions in a different color
- Make it immediately usable with minimal editing

**Key principle**: Templates should be usable within 5 minutes of downloading.

---

## Swipe Files

**Best for**: Inspiration, examples, learning from others

**Structure**:
- Curated collection of 15-50 examples
- Organized by category, type, or use case
- Each example includes:
  - The example itself (screenshot, text, link)
  - Why it works (2-3 bullet annotations)
  - How to adapt it (1-2 sentences)

**Guidelines**:
- Quality over quantity — curate ruthlessly
- Add your analysis, don't just collect
- Organize for browsing (categories, tags)
- Update periodically with fresh examples
- Credit original sources

**What works**: Email subject lines, landing pages, ad copy, CTAs, onboarding flows, pricing pages

---

## Mini-Courses

### Email-Based Mini-Courses
- 3-5 emails delivered over 5-7 days
- One lesson per email, one concept per lesson
- Each email: teach → example → exercise
- Progressive difficulty (build on previous lessons)
- Final email: summary + CTA for product or next step

### Video-Based Mini-Courses
- 3-5 videos, 5-15 minutes each
- Host on unlisted YouTube, Loom, or course platform
- Deliver links via email drip
- Include worksheets or exercises per lesson
- More personal — builds stronger connection

**Cadence**: Every 1-2 days. Don't stretch too thin or compress too tight.

**Key principle**: Each lesson should deliver standalone value. If someone only watches lesson 2, they should still learn something useful.

---

## Quizzes & Assessments

**Best for**: Engagement, segmentation, personalized results

**Question Design**:
- 5-10 questions (sweet spot: 7)
- Multiple choice only — no open-ended
- Questions should feel insightful, not obvious
- Progress indicator ("Question 3 of 7")

**Result Segmentation**:
- 3-5 result categories
- Each result: name, description, personalized recommendations
- Tailor follow-up emails by result type
- Share-worthy result format ("I got: Growth Stage Marketer!")

**Implementation**: Gate results behind email capture. The quiz itself is ungated — the personalized results require an email.

**For building interactive quizzes**: See **free-tools** skill for technical implementation guidance.

---

## Webinars & Workshops

### Live Webinars
- 30-45 minutes teaching + 15 minutes Q&A
- Structure: Hook → Teach (3 key points) → Demo/example → CTA
- Promote 1-2 weeks in advance
- Send 3 reminder emails (confirmation, day before, 1 hour before)
- Record for replay (extends value)

### Evergreen Webinars
- Pre-recorded, available on demand
- Same structure as live but tighter editing
- Always-on lead generation
- Gate with email registration
- Automated follow-up sequence

**Follow-up**: Send replay link + summary + CTA within 24 hours. Continue with nurture sequence.

**Key principle**: Teach something genuinely useful. A webinar that's just a sales pitch will damage trust.

