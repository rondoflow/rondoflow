---
name: content-strategy
description: "When the user wants to plan a content strategy, decide what content to create, or figure out what topics to cover. Also use when the user mentions \"content strategy,\" \"what should I write about,\" \"content ideas,\" \"blog strategy,\" \"topic clusters,\" \"content planning,\" \"editorial calendar,\" \"content marketing,\" \"content roadmap,\" \"what content should I create,\" \"blog topics,\" \"content pillars,\" or \"I don't know what to write.\" Use this whenever someone needs help deciding what content to produce, not just writing it. For writing individual pieces, see copywriting. For SEO-specific audits, see seo-audit. For social media content specifically, see social."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Content Strategy

You are a content strategist. Your goal is to help plan content that drives traffic, builds authority, and generates leads by being either searchable, shareable, or both.

## Before Planning

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Business Context
- What does the company do?
- Who is the ideal customer?
- What's the primary goal for content? (traffic, leads, brand awareness, thought leadership)
- What problems does your product solve?

### 2. Customer Research
- What questions do customers ask before buying?
- What objections come up in sales calls?
- What topics appear repeatedly in support tickets?
- What language do customers use to describe their problems?

### 3. Current State
- Do you have existing content? What's working?
- What resources do you have? (writers, budget, time)
- What content formats can you produce? (written, video, audio)

### 4. Competitive Landscape
- Who are your main competitors?
- What content gaps exist in your market?

---

## Searchable vs Shareable

Every piece of content must be searchable, shareable, or both. Prioritize in that order—search traffic is the foundation.

**Searchable content** captures existing demand. Optimized for people actively looking for answers.

**Shareable content** creates demand. Spreads ideas and gets people talking.

### When Writing Searchable Content

- Target a specific keyword or question
- Match search intent exactly—answer what the searcher wants
- Use clear titles that match search queries
- Structure with headings that mirror search patterns
- Place keywords in title, headings, first paragraph, URL
- Provide comprehensive coverage (don't leave questions unanswered)
- Include data, examples, and links to authoritative sources
- Optimize for AI/LLM discovery: clear positioning, structured content, brand consistency across the web

### When Writing Shareable Content

- Lead with a novel insight, original data, or counterintuitive take
- Challenge conventional wisdom with well-reasoned arguments
- Tell stories that make people feel something
- Create content people want to share to look smart or help others
- Connect to current trends or emerging problems
- Share vulnerable, honest experiences others can learn from

---

## Content Types

### Searchable Content Types

**Use-Case Content**
Formula: [persona] + [use-case]. Targets long-tail keywords.
- "Project management for designers"
- "Task tracking for developers"
- "Client collaboration for freelancers"

**Hub and Spoke**
Hub = comprehensive overview. Spokes = related subtopics.
```
/topic (hub)
├── /topic/subtopic-1 (spoke)
├── /topic/subtopic-2 (spoke)
└── /topic/subtopic-3 (spoke)
```
Create hub first, then build spokes. Interlink strategically.

**Note:** Most content works fine under `/blog`. Only use dedicated hub/spoke URL structures for major topics with layered depth (e.g., Atlassian's `/agile` guide). For typical blog posts, `/blog/post-title` is sufficient.

**Template Libraries**
High-intent keywords + product adoption.
- Target searches like "marketing plan template"
- Provide immediate standalone value
- Show how product enhances the template

### Shareable Content Types

**Thought Leadership**
- Articulate concepts everyone feels but hasn't named
- Challenge conventional wisdom with evidence
- Share vulnerable, honest experiences

**Data-Driven Content**
- Product data analysis (anonymized insights)
- Public data analysis (uncover patterns)
- Original research (run experiments, share results)

**Expert Roundups**
15-30 experts answering one specific question. Built-in distribution.

**Case Studies**
Structure: Challenge → Solution → Results → Key learnings

**Meta Content**
Behind-the-scenes transparency. "How We Got Our First $5k MRR," "Why We Chose Debt Over VC."

For programmatic content at scale, see **programmatic-seo** skill.

---

## Content Pillars and Topic Clusters

Content pillars are the 3-5 core topics your brand will own. Each pillar spawns a cluster of related content.

Most of the time, all content can live under `/blog` with good internal linking between related posts. Dedicated pillar pages with custom URL structures (like `/guides/topic`) are only needed when you're building comprehensive resources with multiple layers of depth.

### How to Identify Pillars

1. **Product-led**: What problems does your product solve?
2. **Audience-led**: What does your ICP need to learn?
3. **Search-led**: What topics have volume in your space?
4. **Competitor-led**: What are competitors ranking for?

### Pillar Structure

```
Pillar Topic (Hub)
├── Subtopic Cluster 1
│   ├── Article A
│   ├── Article B
│   └── Article C
├── Subtopic Cluster 2
│   ├── Article D
│   ├── Article E
│   └── Article F
└── Subtopic Cluster 3
    ├── Article G
    ├── Article H
    └── Article I
```

### Pillar Criteria

Good pillars should:
- Align with your product/service
- Match what your audience cares about
- Have search volume and/or social interest
- Be broad enough for many subtopics

---

## Keyword Research by Buyer Stage

Map topics to the buyer's journey using proven keyword modifiers:

### Awareness Stage
Modifiers: "what is," "how to," "guide to," "introduction to"

Example: If customers ask about project management basics:
- "What is Agile Project Management"
- "Guide to Sprint Planning"
- "How to Run a Standup Meeting"

### Consideration Stage
Modifiers: "best," "top," "vs," "alternatives," "comparison"

Example: If customers evaluate multiple tools:
- "Best Project Management Tools for Remote Teams"
- "Asana vs Trello vs Monday"
- "Basecamp Alternatives"

### Decision Stage
Modifiers: "pricing," "reviews," "demo," "trial," "buy"

Example: If pricing comes up in sales calls:
- "Project Management Tool Pricing Comparison"
- "How to Choose the Right Plan"
- "[Product] Reviews"

### Implementation Stage
Modifiers: "templates," "examples," "tutorial," "how to use," "setup"

Example: If support tickets show implementation struggles:
- "Project Template Library"
- "Step-by-Step Setup Tutorial"
- "How to Use [Feature]"

---

## Content Ideation Sources

### 1. Keyword Data

If user provides keyword exports (Ahrefs, SEMrush, GSC), analyze for:
- Topic clusters (group related keywords)
- Buyer stage (awareness/consideration/decision/implementation)
- Search intent (informational, commercial, transactional)
- Quick wins (low competition + decent volume + high relevance)
- Content gaps (keywords competitors rank for that you don't)

Output as prioritized table:
| Keyword | Volume | Difficulty | Buyer Stage | Content Type | Priority |

### 2. Call Transcripts

If user provides sales or customer call transcripts, extract:
- Questions asked → FAQ content or blog posts
- Pain points → problems in their own words
- Objections → content to address proactively
- Language patterns → exact phrases to use (voice of customer)
- Competitor mentions → what they compared you to

Output content ideas with supporting quotes.

### 3. Survey Responses

If user provides survey data, mine for:
- Open-ended responses (topics and language)
- Common themes (30%+ mention = high priority)
- Resource requests (what they wish existed)
- Content preferences (formats they want)

### 4. Forum Research

Use web search to find content ideas:

**Reddit:** `site:reddit.com [topic]`
- Top posts in relevant subreddits
- Questions and frustrations in comments
- Upvoted answers (validates what resonates)

**Quora:** `site:quora.com [topic]`
- Most-followed questions
- Highly upvoted answers

**Other:** Indie Hackers, Hacker News, Product Hunt, industry Slack/Discord

Extract: FAQs, misconceptions, debates, problems being solved, terminology used.

### 5. Competitor Analysis

Use web search to analyze competitor content:

**Find their content:** `site:competitor.com/blog`

**Analyze:**
- Top-performing posts (comments, shares)
- Topics covered repeatedly
- Gaps they haven't covered
- Case studies (customer problems, use cases, results)
- Content structure (pillars, categories, formats)

**Identify opportunities:**
- Topics you can cover better
- Angles they're missing
- Outdated content to improve on

### 6. Sales and Support Input

Extract from customer-facing teams:
- Common objections
- Repeated questions
- Support ticket patterns
- Success stories
- Feature requests and underlying problems

---

## Prioritizing Content Ideas

Score each idea on four factors:

### 1. Customer Impact (40%)
- How frequently did this topic come up in research?
- What percentage of customers face this challenge?
- How emotionally charged was this pain point?
- What's the potential LTV of customers with this need?

### 2. Content-Market Fit (30%)
- Does this align with problems your product solves?
- Can you offer unique insights from customer research?
- Do you have customer stories to support this?
- Will this naturally lead to product interest?

### 3. Search Potential (20%)
- What's the monthly search volume?
- How competitive is this topic?
- Are there related long-tail opportunities?
- Is search interest growing or declining?

### 4. Resource Requirements (10%)
- Do you have expertise to create authoritative content?
- What additional research is needed?
- What assets (graphics, data, examples) will you need?

### Scoring Template

| Idea | Customer Impact (40%) | Content-Market Fit (30%) | Search Potential (20%) | Resources (10%) | Total |
|------|----------------------|-------------------------|----------------------|-----------------|-------|
| Topic A | 8 | 9 | 7 | 6 | 8.0 |
| Topic B | 6 | 7 | 9 | 8 | 7.1 |

---

## Output Format

When creating a content strategy, provide:

### 1. Content Pillars
- 3-5 pillars with rationale
- Subtopic clusters for each pillar
- How pillars connect to product

### 2. Priority Topics
For each recommended piece:
- Topic/title
- Searchable, shareable, or both
- Content type (use-case, hub/spoke, thought leadership, etc.)
- Target keyword and buyer stage
- Why this topic (customer research backing)

### 3. Topic Cluster Map
Visual or structured representation of how content interconnects.

---

## Task-Specific Questions

1. What patterns emerge from your last 10 customer conversations?
2. What questions keep coming up in sales calls?
3. Where are competitors' content efforts falling short?
4. What unique insights from customer research aren't being shared elsewhere?
5. Which existing content drives the most conversions, and why?

---

## References

- **[Headless CMS Guide](references/headless-cms.md)**: CMS selection, content modeling for marketing, editorial workflows, platform comparison (Sanity, Contentful, Strapi)

---

## Related Skills

- **copywriting**: For writing individual content pieces
- **seo-audit**: For technical SEO and on-page optimization
- **ai-seo**: For optimizing content for AI search engines and getting cited by LLMs
- **programmatic-seo**: For scaled content generation
- **site-architecture**: For page hierarchy, navigation design, and URL structure
- **emails**: For email-based content
- **social**: For social media content

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/headless-cms.md

# Headless CMS Guide

Reference for choosing, modeling, and implementing a headless CMS for marketing content.

## When to Use This Reference

Use this when selecting a CMS for a new project, designing content models for marketing sites, setting up editorial workflows, or connecting CMS content to programmatic pages.

---

## Headless vs Traditional CMS

A headless CMS separates content management from presentation. Content is stored in a structured backend and delivered via API to any frontend.

### When Headless Makes Sense

- Multiple frontends consume the same content (web, mobile, email)
- Developers want full control over the frontend stack
- Content needs to be reused across channels
- You're building with a modern framework (Next.js, Remix, Astro)
- Marketing needs structured, reusable content blocks

### When Traditional Works Better

- Small team with no dedicated developers
- Simple blog or brochure site
- WYSIWYG editing is a hard requirement
- Budget is tight and WordPress/Webflow does the job

### Decision Checklist

| Factor | Headless | Traditional |
|--------|----------|-------------|
| Multi-channel delivery | Yes | Limited |
| Developer control | Full | Constrained |
| Non-technical editing | Requires setup | Built-in |
| Time to launch | Longer | Faster |
| Content reuse | Native | Manual |
| Hosting flexibility | Any frontend | Platform-dependent |

---

## Content Modeling for Marketing

### Core Principles

1. **Think in types, not pages.** A "Landing Page" is a content type with fields — not an HTML file. This lets you reuse components across pages.
2. **Separate content from presentation.** Store the headline text, not the styled headline. Presentation belongs in the frontend.
3. **Design for reuse.** If testimonials appear on 5 pages, create a Testimonial type and reference it — don't duplicate.
4. **Keep models flat.** Deeply nested structures are hard to query and maintain. Prefer references over nesting.

### Common Marketing Content Types

| Type | Key Fields | Notes |
|------|-----------|-------|
| **Landing Page** | title, slug, hero, sections[], seo | Modular sections for flexibility |
| **Blog Post** | title, slug, body, author, category, tags, publishedAt, seo | Rich text or Portable Text body |
| **Case Study** | title, customer, challenge, solution, results, metrics[], logo | Link to related products/features |
| **Testimonial** | quote, author, role, company, avatar, rating | Reference from landing pages |
| **FAQ** | question, answer, category | Group by category for programmatic pages |
| **Author** | name, bio, avatar, social links | Reference from blog posts |
| **CTA Block** | heading, body, buttonText, buttonUrl, variant | Reusable across pages |

### SEO Fields Checklist

Every page-level content type needs:

- `metaTitle` — 50-60 characters
- `metaDescription` — 150-160 characters
- `ogImage` — 1200x630px social preview
- `slug` — URL path segment
- `canonicalUrl` — optional override
- `noIndex` — boolean for excluding from search
- `structuredData` — optional JSON-LD override

---

## Editorial Workflows

### Draft → Review → Publish Cycle

1. **Draft** — Author creates or edits content
2. **Review** — Editor reviews for accuracy, brand voice, SEO
3. **Approve** — Stakeholder signs off
4. **Schedule** — Set publish date/time
5. **Publish** — Content goes live via API

### Preview APIs

All major headless CMS platforms support draft previews:

- **Sanity**: Real-time preview with `useLiveQuery` or Presentation tool
- **Contentful**: Preview API (`preview.contentful.com`) with separate access token
- **Strapi**: Draft & Publish system with `status=draft` query parameter (v5; replaces v4's `publicationState`)

Set up a preview route in your frontend (e.g., `/api/preview`) that authenticates and renders draft content.

### Roles and Permissions

| Role | Can Create | Can Edit | Can Publish | Can Delete |
|------|:----------:|:--------:|:-----------:|:----------:|
| Author | Yes | Own | No | Own drafts |
| Editor | Yes | All | Yes | Drafts |
| Admin | Yes | All | Yes | All |

Exact permission models vary by platform. Sanity uses role-based access. Contentful has space-level roles. Strapi has granular RBAC.

---

## Platform Comparison

| Feature | Sanity | Contentful | Strapi |
|---------|--------|------------|--------|
| Hosting | Cloud (managed) | Cloud (managed) | Self-hosted or Cloud |
| Query Language | GROQ | REST / GraphQL | REST / GraphQL |
| Free Tier | Generous | Limited | Open source (free) |
| Real-time Collab | Yes (built-in) | Limited | No |
| Best For | Developer flexibility | Enterprise multi-locale | Budget / self-hosted |
| Content Modeling | Schema-as-code | Web UI | Web UI or code |
| Media Handling | Built-in DAM | Built-in | Plugin-based |

### Sanity

**Strengths**: GROQ query language is powerful and flexible. Schema defined in code (version-controlled). Real-time collaborative editing. Portable Text for rich content. Generous free tier.

**Considerations**: Steeper learning curve for non-developers. Studio customization requires React knowledge. Vendor lock-in on GROQ queries.

**Marketing fit**: Best when developers and marketers collaborate closely. Strong for content-heavy sites with complex models.

### Contentful

**Strengths**: Mature enterprise platform. Excellent multi-locale support. Strong ecosystem of integrations. Composable content with Studio. Well-documented APIs.

**Considerations**: Pricing scales with content types and locales. Two separate APIs (Delivery and Management). Rate limits can be tight on lower plans.

**Marketing fit**: Best for enterprises with multi-market content needs. Good when you need established vendor reliability.

### Strapi

**Strengths**: Open source, self-hosted option. Full control over data. No per-seat pricing. Customizable admin panel. Plugin ecosystem. REST by default, GraphQL via plugin.

**Considerations**: Self-hosting means you handle infrastructure. Smaller ecosystem than Sanity/Contentful. V5 migration can be significant from V4.

**Marketing fit**: Best for teams with DevOps capability who want full control and no vendor lock-in. Good for budget-conscious projects.

### Others Worth Knowing

- **Hygraph** — GraphQL-native, strong for federation and multi-source content
- **Keystatic** — Git-based, good for developer-content hybrid workflows
- **Payload** — TypeScript-first, self-hosted, code-configured like Sanity
- **Builder.io** — Visual editor with headless backend, good for non-technical marketers
- **Prismic** — Slice-based content modeling, strong Next.js integration

---

## Integration with Marketing Skills

### Programmatic SEO

Use CMS as the data source for programmatic pages. Store structured data (FAQs, comparisons, city pages) as content types and generate pages from queries. See **programmatic-seo** skill.

### Copywriting

CMS content models enforce consistent structure. Define fields that match your copy frameworks (headline, subheadline, social proof, CTA). See **copywriting** skill.

### Site Architecture

URL structure, navigation hierarchy, and internal linking all depend on how content is organized in the CMS. Plan your content model and site architecture together. See **site-architecture** skill.

### Email Sequences

Pull CMS content into email templates for consistent messaging across web and email. Case studies, testimonials, and blog posts can feed email nurture sequences. See **emails** skill.

---

## Implementation Checklist

- [ ] Define content types based on page types and reusable blocks
- [ ] Add SEO fields to every page-level content type
- [ ] Set up preview/draft mode in your frontend
- [ ] Configure roles and permissions for your team
- [ ] Create sample content for each type before building frontend
- [ ] Set up webhook notifications for content changes (rebuild triggers)
- [ ] Document content guidelines for editors (field descriptions, character limits)
- [ ] Test content delivery performance (CDN, caching, ISR)
- [ ] Plan migration strategy if moving from existing CMS

---

## Relevant Integration Guides

- [Sanity](../../../tools/integrations/sanity.md) — GROQ queries, mutations, CLI
- [Contentful](../../../tools/integrations/contentful.md) — Delivery/Management APIs, publishing
- [Strapi](../../../tools/integrations/strapi.md) — REST CRUD, filters, document API

