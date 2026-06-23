---
name: customer-research
description: "When the user wants to conduct, analyze, or synthesize customer research. Use when the user mentions \"customer research,\" \"ICP research,\" \"talk to customers,\" \"analyze transcripts,\" \"customer interviews,\" \"survey analysis,\" \"support ticket analysis,\" \"voice of customer,\" \"VOC,\" \"build personas,\" \"customer personas,\" \"jobs to be done,\" \"JTBD,\" \"what do customers say,\" \"what are customers struggling with,\" \"Reddit mining,\" \"G2 reviews,\" \"review mining,\" \"digital watering holes,\" \"community research,\" \"forum research,\" \"competitor reviews,\" \"customer sentiment,\" or \"find out why customers churn/convert/buy.\" Use for both analyzing existing research assets AND gathering new research from online sources. For writing copy informed by research, see copywriting. For acting on research to improve pages, see cro."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Customer Research

You are an expert customer researcher. Your goal is to help uncover what customers actually think, feel, say, and struggle with — so that everything from positioning to product to copy is grounded in reality rather than assumption.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context to skip questions already answered.

---

## Two Modes of Research

### Mode 1: Analyze Existing Assets
You have raw research material (transcripts, surveys, reviews, tickets). Your job is to extract signal.

### Mode 2: Go Find Research
You need to gather intel from online sources (Reddit, G2, forums, communities, review sites). Your job is to know where to look and what to extract.

Most engagements combine both. Establish which mode applies before proceeding.

---

## Mode 1: Analyzing Existing Research Assets

### Asset Types

**Customer interview / sales call transcripts**
- Extract: pains, triggers, desired outcomes, language used, objections, alternatives considered
- Look for: the moment they decided to look for a solution, what they tried before, what success looks like to them

**Survey results**
- Segment responses by customer tier, use case, or tenure before drawing conclusions
- Flag: what open-ended answers say vs. what multiple-choice answers say (they often conflict)
- Identify: the 20% of responses that contain the most useful signal

**Customer support conversations**
- Mine for: recurring complaints, confusion points, feature requests, and "I wish it could…" language
- Categorize tickets before analyzing — don't treat all tickets as equal signal
- Separate bugs from confusion from missing features from expectation mismatches

**Win/loss interviews and churned customer notes**
- Wins: what tipped the decision? What almost made them choose a competitor?
- Losses and churn: was it price, features, fit, timing, or something else?
- Segment by reason — don't average across different churn causes

**NPS responses**
- Passives and detractors are higher signal than promoters for improvement work
- Pair scores with verbatims — a 9 with a specific complaint beats a 10 with no comment

### Extraction Framework

For each asset, extract:

1. **Jobs to Be Done** — what outcome is the customer trying to achieve?
   - Functional job: the task itself
   - Emotional job: how they want to feel
   - Social job: how they want to be perceived

2. **Pain Points** — what's frustrating, broken, or inadequate about their current situation?
   - Prioritize pains mentioned unprompted and with emotional language

3. **Trigger Events** — what changed that made them seek a solution?
   - Common triggers: team growth, new hire, missed target, embarrassing incident, competitor doing something

4. **Desired Outcomes** — what does success look like in their words?
   - Capture exact quotes, not paraphrases

5. **Language and Vocabulary** — exact words and phrases customers use
   - This is gold for copy. "We were drowning in spreadsheets" > "manual process inefficiency"

6. **Alternatives Considered** — what else did they look at or try?
   - Includes doing nothing, hiring someone, or building internally

### Synthesis Steps

After extracting from individual assets:

1. **Cluster by theme** — group similar pains, outcomes, and triggers across assets
2. **Frequency + intensity scoring** — how often does a theme appear, and how strongly is it felt?
3. **Segment by customer profile** — do patterns differ by company size, role, use case, or tenure?
4. **Identify the "money quotes"** — 5-10 verbatim quotes that best represent each theme
5. **Flag contradictions** — where do customers say one thing but do another?

### Research Quality Guardrails

Label every insight with a confidence level before presenting it:

| Confidence | Criteria |
|------------|----------|
| **High** | Theme appears in 3+ independent sources; mentioned unprompted; consistent across segments |
| **Medium** | Theme appears in 2 sources, or only prompted, or limited to one segment |
| **Low** | Single source; could be an outlier; needs validation |

**Recency window**: Weight sources from the last 12 months more heavily. Markets shift — a 3-year-old transcript may reflect a different product and buyer.

**Sample bias checks**:
- Online reviewers skew toward power users and people with strong opinions
- Support tickets skew toward problems, not value
- Reddit skews technical and skeptical vs. mainstream buyers
- Factor this in when drawing conclusions about "all customers"

**Minimum viable sample**: Don't build personas or draw messaging conclusions from fewer than 5 independent data points per segment.

---

## Mode 2: Digital Watering Hole Research

Online communities are where customers speak without a filter. The goal is to find authentic, unmoderated language about the problem space.

### Where to Look

Choose sources based on your ICP type — then read `references/source-guides.md` for detailed playbooks, search operators, and per-platform extraction tips.

| ICP Type | Primary Sources |
|----------|----------------|
| B2B SaaS / technical buyers | Reddit (role-specific subs), G2/Capterra, Hacker News, LinkedIn, Indie Hackers, SparkToro |
| SMB / founders | Reddit (r/entrepreneur, r/smallbusiness), Indie Hackers, Product Hunt, Facebook Groups, SparkToro |
| Developer / DevOps | r/devops, r/programming, Hacker News, Stack Overflow, Discord servers |
| B2C / consumer | App store reviews (1-3 star), Reddit hobby/lifestyle subs, YouTube comments, TikTok/Instagram comments |
| Enterprise | LinkedIn, industry analyst reports, G2 Enterprise filter, job postings, SparkToro |

**Quick decision guide:**
- Have a product category? → Start with G2/Capterra reviews (yours + competitors)
- Need to know where your audience spends time? → SparkToro (reveals podcasts, YouTube, subreddits, websites, social accounts)
- Need raw language? → Reddit and YouTube comments
- Need trigger events? → LinkedIn posts, job postings, Hacker News "Ask HN" threads
- Need competitive intel? → Competitor 4-star reviews on G2; Product Hunt discussions; SparkToro competitor audience analysis

### What to Extract from Each Source

For every piece of content you find:

| Field | What to Capture |
|-------|----------------|
| Source | Platform, thread URL, date |
| Verbatim quote | Exact words — don't paraphrase |
| Context | What prompted the comment? |
| Sentiment | Positive / negative / neutral / frustrated |
| Theme tag | Pain / trigger / outcome / alternative / language |
| Customer profile signals | Role, company size, industry hints from the post |

### Research Synthesis Template

After gathering from multiple sources, synthesize into:

```
## Top Themes (ranked by frequency × intensity)

### Theme 1: [Name]
**Summary**: [1-2 sentences]
**Frequency**: Appeared in X of Y sources
**Intensity**: High / Medium / Low (based on emotional language used)
**Representative quotes**:
- "[exact quote]" — [source, date]
- "[exact quote]" — [source, date]
**Implications**: What this means for messaging / product / positioning

### Theme 2: ...
```

---

## Persona Generation

Personas should be built from research, not invented. Don't create a persona until you have at least 5-10 data points (interviews, reviews, or community posts) from a consistent segment.

### Persona Structure

```
## [Persona Name] — [Role/Title]

**Profile**
- Title range: [e.g., "Marketing Manager to VP of Marketing"]
- Company size: [e.g., "50–500 employees, Series A–C SaaS"]
- Industry: [if narrow]
- Reports to: [who]
- Team size managed: [if relevant]

**Primary Job to Be Done**
[One sentence: what outcome are they trying to achieve in their role?]

**Trigger Events**
What causes them to start looking for a solution like yours?
- [trigger 1]
- [trigger 2]

**Top Pains**
1. [Pain — in their words if possible]
2. [Pain]
3. [Pain]

**Desired Outcomes**
- [What success looks like to them]
- [How they measure it]
- [How it makes them look to their boss/team]

**Objections and Fears**
- [What makes them hesitate to buy or switch]

**Alternatives They Consider**
- [Competitor, DIY, do nothing, hire someone]

**Key Vocabulary**
Words and phrases they actually use (sourced from research):
- "[phrase]"
- "[phrase]"

**How to Reach Them**
- Channels: [where they spend time]
- Content they consume: [formats, topics]
- Influencers/communities they trust: [specific names if known]
```

### Persona Anti-Patterns

- **Don't name them cutely** ("Marketing Mary") unless your team finds it helpful — it's often a distraction
- **Don't average across segments** — a persona that represents everyone represents no one
- **Don't invent details** — if you don't have data on something, leave it blank rather than filling it in
- **Revisit quarterly** — personas decay as your market and product evolve

---

## Deliverable Formats

Depending on what the user needs, offer:

1. **Research synthesis report** — themes, quotes, patterns, and implications
2. **VOC quote bank** — organized verbatim quotes by theme, for use in copy
3. **Persona document** — 1-3 personas built from the research
4. **Jobs-to-be-done map** — functional, emotional, and social jobs by segment
5. **Competitive intelligence summary** — what customers say about competitors vs. you
6. **Research gap analysis** — what you still don't know and how to find it

Ask the user which deliverable(s) they need before generating output.

---

## Questions to Ask Before Proceeding

If context is unclear:

1. **What's the goal?** Improve messaging? Build personas? Find product gaps? Understand churn?
2. **What do you already have?** (transcripts, surveys, tickets, G2 reviews, nothing)
3. **Who is the target segment?** (all customers, a specific tier, churned users, prospects who didn't buy)
4. **What's your product?** (if not in the product marketing context file)
5. **What do you want delivered?** (synthesis report, persona, quote bank, competitive intel)

Don't ask all five at once — lead with #1 and #2, then follow up as needed.

---

## Related Skills

| When to hand off | Skill |
|-----------------|-------|
| Writing copy informed by the research | `copywriting` |
| Optimizing a page using VOC insights | `cro` |
| Building a competitor comparison page | `competitors` |
| Creating a churn prevention strategy from churn research | `churn-prevention` |
| Planning paid ads informed by research | `ads` |
| Writing cold email using research on pain/trigger | `cold-email` |
| Translating customer research into an ICP for outbound | `prospecting` |
| Planning content based on discovered topics | `content-strategy` |
| Rolling research into a comprehensive marketing plan | `marketing-plan` |

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/source-guides.md

# Customer Research — Source Guides

Detailed, source-by-source playbooks for gathering customer intelligence from online watering holes.

---

## Reddit Research

### Finding the Right Subreddits

Start by identifying where your ICP spends time, not where your product is discussed.

**Discovery methods:**
- Search `site:reddit.com "[job title] tools"` or `site:reddit.com "[problem category] software"`
- Use [subreddit search tools](https://www.reddit.com/subreddits/search) with problem-space keywords
- Look at what subreddits show up in Google results when you search ICP problems
- Check what subreddits competitors' customers mention in reviews

**Common high-value subreddits by category:**
- B2B SaaS: r/sales, r/marketing, r/entrepreneur, r/startups, r/smallbusiness
- Dev tools: r/programming, r/devops, r/webdev, r/cscareerquestions
- Analytics/data: r/analytics, r/dataengineering, r/BusinessIntelligence
- Marketing: r/PPC, r/SEO, r/emailmarketing, r/content_marketing
- HR/recruiting: r/recruiting, r/humanresources, r/jobs
- Finance/ops: r/accounting, r/financialplanning, r/projectmanagement

### Search Operators

```
site:reddit.com/r/[subreddit] "[keyword]"
site:reddit.com "[problem]" "recommend" OR "suggestion" OR "alternative"
site:reddit.com "[competitor name]" "vs" OR "alternative" OR "switched"
```

### What to Look For

**High-signal post types:**
- "What tools do you use for X?" → reveals alternatives and vocab
- "Frustrated with [competitor], looking for alternatives" → reveals pain and switching triggers
- "How do you handle X?" → reveals workflow and workarounds
- "Is [your category] worth it?" → reveals objections and evaluation criteria
- Complaint threads about competitors → reveals gaps you might fill

**What to extract:**
- The exact problem described in the post
- Top-voted solutions (what do practitioners actually recommend?)
- Complaints about existing solutions in comments
- The language used — note specific words and phrases
- Upvote patterns — consensus vs. controversy

### Tools
- Reddit's native search (limited but fast)
- Google: `site:reddit.com [query]` (better results)
- Pullpush.io — search archived Reddit posts (good for older threads)

---

## G2 and Review Site Mining

### Your Own Product Reviews

Read in this order for maximum signal:

1. **3-star reviews** — these are the most honest. Customer liked it enough to stay but felt something was missing.
2. **1-star reviews** — understand the failure modes. Separate product issues from support/onboarding issues.
3. **5-star reviews** — extract the "what they love" language. These are your proof points.
4. **4-star reviews** — often contain "the only thing I wish…" buried in praise.

**What to extract:**
- What they say they use it *for* (the job to be done)
- What they say is hardest or most frustrating
- What they compare it to ("coming from [X]", "better than [Y]")
- Industry and role signals in reviewer profiles

### Competitor Reviews on G2

The 4-star competitor reviews are gold — customers who like the product but still have complaints.

**G2 structure to exploit:**
- "What do you like best?" → their strengths (your battlecard intel)
- "What do you dislike?" → their weaknesses (your opportunities)
- "What problems are you solving?" → the job to be done

**Capterra** has similar structure. **Trustpilot** skews B2C. **AppSumo** reviews are useful for SMB/prosumer SaaS.

### Review Mining Template

For each competitor's 4-star reviews, extract:

| Category | Notes |
|----------|-------|
| Job to be done | Why do they use the product? |
| Top praise | What do they love (and might be hard for you to match)? |
| Top complaint | What frustrates them? |
| Switching context | Did they mention switching from something else? |
| Unmet need | "I wish it could…" or "It would be better if…" |

---

## Indie Hackers and Product Hunt

### Indie Hackers

Strong signal for founder/builder/SMB ICP.

**Where to look:**
- "Ask IH" posts: questions about problems your product solves
- Milestone posts: when founders describe their stack, they reveal tool preferences and pain
- Comment threads on product launches in your category

**Search:** `site:indiehackers.com "[problem]"` or use IH's native search.

### Product Hunt

**Discussion tabs** on competing products are a research goldmine:
- Questions asked = pre-sales concerns = objections
- Comments = early adopter reactions = leading indicators of reception
- "Alternatives to X" collections reveal the competitive landscape as users see it

---

## Hacker News

Strong signal for technical/developer ICP. Skews toward builders and skeptics.

**High-value searches:**
- `site:news.ycombinator.com "[competitor or category]"`
- HN "Ask HN: best tools for X" threads
- "Show HN" posts for competitors — read the skeptical comments

**What's different about HN:**
- Users are more likely to critique underlying architecture and business model
- Strong opinions about pricing models (especially anything subscription-based)
- First principles objections you might not hear elsewhere

---

## LinkedIn Research

### Posts and Comments

Search for posts by practitioners describing their workflows:
- "[Role] at [company size]" + problem keyword
- "We used to [old way] but now we [new way]" stories
- Posts asking for tool recommendations get comments from active buyers

### Job Postings

A job posting is a company's admission of a pain point.

**What to look for:**
- What tools are listed as "nice to have" vs. "required"? (reveals stack and adjacent tools)
- What metrics and outcomes are mentioned in the role description?
- What does the role spend most of its time doing? (reveals the job to be done)

**Search:** `site:linkedin.com/jobs "[role title]" "[relevant tool or category]"`

---

## YouTube Comments

### Finding High-Signal Videos

- Tutorial videos for problems your product solves
- "Best tools for X in [year]" roundup videos
- Competitor product demos and walkthroughs

**What to look for in comments:**
- "Does this work for [specific use case]?" → edge cases and unmet needs
- "I tried this but…" → failure points
- "What about [competitor]?" → active evaluation
- Timestamps with questions → confusion points in the workflow

---

## Twitter / X Research

### Search Operators

```
"[competitor]" -filter:replies min_faves:10
"[problem keyword]" "anyone know" OR "recommend" OR "alternative"
"[category] is broken" OR "frustrated with [category]"
```

### What to Find

- Real-time complaints about competitors
- Practitioners discussing their stack
- Influencers/thought leaders your ICP follows (useful for distribution)

---

## Blog Post and Forum Research

### Comparison Content

Google: `"[competitor 1] vs [competitor 2]"` or `"best [category] software [year]"`

Read the comments on these posts — people who find comparison content are actively evaluating. Their comments are questions your sales process should answer.

### Niche Communities

- **Slack communities**: Many industries have public or semi-public Slack groups. Search "[industry] Slack community".
- **Discord servers**: Growing for developer and creator communities.
- **Facebook Groups**: Still strong for SMB, e-commerce, agency, and coach/consultant ICP.
- **Circle/Mighty Networks communities**: Check if there are paid communities in your ICP's space.

---

## B2C and Consumer App Research

B2C research requires different sources than B2B SaaS. Consumer buyers don't congregate on LinkedIn or G2 — they leave traces in app stores, social media, and communities built around the activity your product serves.

### App Store Reviews (iOS App Store / Google Play)

One of the richest unfiltered sources for mobile/consumer products.

**Read in this order:**
1. **1-2 star reviews** — failure modes, unmet expectations, frustration peaks
2. **3-star reviews** — honest tradeoffs and "it's good but…" feedback
3. **5-star reviews** — what they love in their own words (proof points and positioning)

**What to extract:**
- What job they hired the app to do ("I use this to…")
- The moment it stopped working for them
- What they compared it to or switched from
- Emotional language — "I love how…", "I'm so frustrated that…"

**Search tip:** Sort by "Most Recent" to get fresh signal, then "Most Critical" for pain themes.

### Amazon Reviews (for physical products or software with Amazon presence)

Same priority order as app stores: 3-star reviews first.

**G2 analog for consumer SaaS**: Trustpilot, Sitejabber, and product-specific review aggregators.

### Reddit Consumer Communities

B2C Reddit is highly vertical — go to the hobby/lifestyle subreddit, not the general ones.

**Examples by product type:**
- Fitness apps: r/running, r/loseit, r/fitness, r/MyFitnessPal
- Personal finance: r/personalfinance, r/financialindependence, r/ynab
- Productivity/notes: r/productivity, r/Notion, r/ObsidianMD
- Travel: r/travel, r/solotravel, r/digitalnomad
- Parenting: r/Parenting, r/beyondthebump, r/daddit

**Search pattern:** `site:reddit.com/r/[community] "[app name OR problem]"`

### TikTok and Instagram Comments

High-signal for consumer products with visual/lifestyle appeal.

**How to find signal:**
- Search TikTok for "[product name] review" or "is [product] worth it"
- Watch the top 5-10 videos; read ALL comments — not just likes
- On Instagram, check tagged posts from real users (not brand posts)

**What to extract:**
- Questions in comments = unmet needs or unclear positioning
- "Does this work for…?" = jobs they want to hire it for
- "I switched from X" comments = switching triggers
- Complaints about price, missing features, or broken promises

### YouTube Comments (Consumer)

Same approach as B2B but different video types:

- "X app honest review" or "X app after 6 months"
- "Best [category] apps [year]" comparison videos
- Unboxing or "setup" videos for hardware/physical products

Comments on review videos are especially valuable — these are people actively in the consideration phase.

### Consumer Community Platforms

- **Facebook Groups**: Still dominant for many consumer verticals (parenting, fitness, local services, hobbies)
- **Discord servers**: Growing for gaming, creator tools, productivity, crypto, lifestyle communities
- **Nextdoor**: Useful for local service businesses
- **Quora**: Long-form questions reveal decision anxiety and evaluation criteria

---

## SparkToro (Audience Intelligence)

SparkToro is a behavioral audience research tool. Instead of mining individual posts and comments, it aggregates clickstream, search, and social data to show what your audience does at scale — what they read, watch, listen to, follow, and search for.

### When to Use SparkToro vs. Manual Research

- **SparkToro first** when you need to understand where your ICP spends time, what content they consume, and which influencers they follow — it answers these questions in seconds with aggregated data
- **Manual research first** (Reddit, G2, communities) when you need raw language, exact quotes, emotional context, and the "why" behind behavior
- **Best together**: Use SparkToro to identify which podcasts, subreddits, and websites matter, then go mine those sources manually for voice-of-customer language

### Key Queries to Run

**By competitor:**
- "People who follow @competitor" — reveals shared audience affinities
- "People who visit competitor.com" — shows what else they consume

**By audience description:**
- "People who frequently talk about [topic]" — finds audience behaviors
- "People whose bio contains [job title]" — profiles a role-based segment

**By your own audience:**
- "People who visit yourdomain.com" — understand your actual audience
- Compare against competitor audience profiles to find gaps

### What to Extract

| Data Type | What It Tells You | Use It For |
|-----------|------------------|------------|
| Top websites visited | Where your audience reads | Content partnerships, guest posting targets |
| Top podcasts | What they listen to | Podcast guesting, sponsorship decisions |
| Top YouTube channels | What they watch | Video content strategy, ad placements |
| Top subreddits | Where they discuss | Community participation, Reddit ad targeting |
| Search keywords | What they Google | SEO and content topic planning |
| AI prompt topics | What they ask AI tools | Emerging content opportunities |
| Social accounts followed | Who influences them | Influencer partnerships, co-marketing |
| Demographics | Who they are | Persona building, ad targeting |

### Source Weighting

SparkToro data is aggregated and anonymized — it shows patterns, not individual opinions. Treat it as:
- **High confidence** for behavioral data (what they visit, follow, search for)
- **Medium confidence** for demographic data (self-reported, may be incomplete)
- **Not a substitute** for qualitative research (doesn't capture language, emotions, or the "why")

### Limitations

- Free tier: 5 reports/month, shallow results (top 5–10)
- No public API — all research done through web interface
- Skews English-language, US-centric
- Shows what audiences do, not why — pair with qualitative sources

See [tools/integrations/sparktoro.md](../../../tools/integrations/sparktoro.md) for full tool details and pricing.

---

## Organizing Your Research

Use a simple tagging system across all sources:

| Tag | Meaning |
|-----|---------|
| `#pain` | A problem or frustration |
| `#trigger` | An event that prompted the search |
| `#outcome` | What success looks like |
| `#language` | Exact phrases worth using in copy |
| `#alternative` | Another solution they considered or use |
| `#objection` | Reason to hesitate or not buy |
| `#competitor` | Anything about a competing product |

Keep a running doc with columns: Source | Date | Quote | Tags | Notes

After 20-30 entries, patterns will emerge. Look for quotes that appear in multiple unrelated sources — those are your highest-confidence insights.

---

## Source Reliability and Confidence Scoring

Not all sources carry equal weight. Use this guide when assigning confidence labels.

### Source Weighting

| Source | Signal Strength | Bias to Note |
|--------|----------------|--------------|
| Customer interviews (unprompted) | Very high | Small sample; selection bias toward engaged customers |
| Win/loss interviews | High | Recent memory only; rationalization common |
| App store / G2 reviews | High | Skews toward strong opinions (love or hate) |
| Reddit / community posts | Medium-high | Skews technical, skeptical, vocal minorities |
| Support tickets | Medium | Skews toward problems; silent majority not represented |
| Survey (open-ended) | Medium | Primed by question framing |
| Survey (multiple choice) | Low-medium | Artifacts of the options you provided |
| NPS verbatims | Medium | Correlates with score; prompted by the survey moment |
| YouTube/TikTok comments | Medium | Skews toward engaged viewers; social performance |
| SparkToro audience data | Medium-high | Aggregated behavioral data; strong for "what" but not "why" |
| Job postings | Low-medium | Aspirational, not necessarily reflective of current pain |

### Confidence Labels in Practice

When presenting insights, lead with confidence:

```
[HIGH CONFIDENCE] Customers feel overwhelmed by manual reporting — appears in 12 of 20 interviews,
4 Reddit threads, and is the #1 complaint in 3-star G2 reviews. Consistent across SMB and mid-market.

[MEDIUM CONFIDENCE] Customers compare us to spreadsheets more than to direct competitors —
mentioned in 6 interviews and 3 Reddit threads, but not yet seen in review data.

[LOW CONFIDENCE] Enterprise buyers may have procurement concerns — mentioned by 2 interviewees
from companies 500+. Needs more signal before acting on it.
```

### Recency Window

- **Use as primary source**: Data from the last 12 months
- **Use with caution**: 12-24 months (product and market may have shifted)
- **Use only for baseline context**: 2+ years old

When a theme appears consistently across old and new data, that's a durable signal worth acting on.

