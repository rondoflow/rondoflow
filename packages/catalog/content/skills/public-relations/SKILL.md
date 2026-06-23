---
name: public-relations
description: "When the user wants help with public relations, earned media, press coverage, journalist outreach, or media strategy (not pull requests). Also use when the user mentions 'PR,' 'public relations,' 'press,' 'press release,' 'press coverage,' 'media outreach,' 'pitch a journalist,' 'get featured,' 'media list,' 'media kit,' 'press kit,' 'newsjacking,' 'news hijack,' 'HARO,' 'Qwoted,' 'Featured,' 'Help A Reporter,' 'reporter request,' 'tech press,' 'TechCrunch,' 'earned media,' 'thought leadership placement,' 'op-ed,' 'guest article,' 'press contacts,' or 'how do I get press.' Use this for earned media work — finding journalists, pitching stories, newsjacking, and responding to press requests. For startup/SaaS/AI directory submissions, see directory-submissions. For product launches, see launch. For social-media engagement, see social. For cold-email outreach to prospects, see cold-email."
category: Marketing
author: community
version: "1.0.0"
icon: megaphone
---

# Public Relations & Earned Media

You are an expert in earned media for software products. Your goal is to help the user get covered by journalists, podcasts, and newsletters — efficiently, with respect for the people on the other end of the pitch.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

---

## Core Philosophy

PR is not a substitute for distribution. It's a multiplier for it.

- **Earned media doesn't drive direct conversions.** A TechCrunch hit will not give you 1,000 paying customers. It will give you backlinks, brand legitimacy, AI-citation surface area, and ammo for sales conversations.
- **Pitch journalists like you'd pitch a customer:** specific, useful, fast, and never about you.
- **The story is not your product. The story is the trend, the data, the conflict, or the human.** Your product is the evidence.
- **Speed beats polish on reactive PR.** A B+ pitch in the first hour of a story beats an A+ pitch on day three.

### When PR is worth it

- You have **a real story** — proprietary data, a strong opinion, a milestone, a customer with a sharp before/after, or a fresh angle on a trending topic
- You have **founder/exec time** — journalists want quotes from people with skin in the game, not from a PR rep
- You have **a destination** — a press page, blog post, or product launch that converts attention into something useful

### When to skip PR (for now)

- Pre-launch with no story beyond "we exist"
- No one on the team can sustain pitching for 4–6 weeks (PR is a momentum game)
- You don't have a clear ICP — journalists ask "who reads my piece because of this?" and if you can't answer, neither can they

---

## The PR Mix

Four modes. Most teams over-index on one. Run at least three.

| Mode | What it is | Effort | Speed to coverage |
|------|------------|--------|-------------------|
| **Reactive (newsjacking)** | Inject your POV into trending news | Low–medium | Hours to days |
| **Proactive (pitching)** | Build a media list, pitch original stories | High | 2–8 weeks |
| **Inbound (press requests)** | Respond to journalist queries on HARO/Qwoted/Featured | Low | Days to weeks |
| **Owned (press page + media kit)** | Make it easy for journalists to find you | One-time setup | N/A |

**For the reactive newsjacking workflow** — see [references/newsjacking.md](references/newsjacking.md)

**For proactive journalist pitching** — see [references/journalist-pitching.md](references/journalist-pitching.md)

**For inbound press-request platforms (HARO, Qwoted, etc.)** — see [references/press-platforms.md](references/press-platforms.md)

**For where to pitch (media outlets, podcasts, newsletters)** — see [references/media-outlets.md](references/media-outlets.md). For startup/SaaS/AI directories, use the separate `directory-submissions` skill — different intent, different list.

---

## Owned: Press Page + Media Kit

Set this up once. It's the cheapest PR investment with the highest ROI on every future story.

**Press page (`/press` or `/newsroom`) should include:**
- One-paragraph company description (copy/paste ready)
- Founder bios with headshots (high-res, downloadable)
- Logo pack (SVG + PNG, light + dark, with usage guidelines)
- Product screenshots (high-res)
- Recent coverage list (social proof for the next journalist)
- Founding date, employee count, funding (if disclosed)
- Press contact email (not a form — journalists hate forms)
- Recent press releases / announcements

**One sentence at the top:** "For interview requests or assets, email press@yourcompany.com — we respond within 24 hours."

Then *actually* respond within 24 hours.

---

## Quick Reference: Pitch Quality Bar

Before sending any pitch, the answer to all of these should be yes:

- [ ] Does this journalist cover this beat? (Check their last 5 articles.)
- [ ] Is there a clear news hook — something that just happened or is about to?
- [ ] Could this journalist write a complete story from this email alone? (Data, quotes, customer name, contact.)
- [ ] Is the subject line specific enough to predict the article's headline?
- [ ] Is the pitch under 150 words?
- [ ] Did you avoid the words "revolutionary," "game-changing," "disruptive," and "synergy"?
- [ ] Is the ask clear? (Interview? Embargo? Exclusive? Quote?)

If any answer is no, don't send.

---

## Measurement

What to track:

| Metric | Why |
|--------|-----|
| **Coverage count** (placements / month) | Activity baseline |
| **Domain rating of placements** | Backlink value |
| **Referral traffic from coverage** | Did anyone actually click? |
| **Brand search lift** | Did people search you after reading? |
| **AI citation rate** (ChatGPT, Perplexity quote your brand?) | The new measurement that matters |
| **Sales conversations citing the article** | The only one that matters for revenue |

What not to obsess over: AVE (advertising value equivalency) — it's a vanity metric PR firms invented.

---

## Common Workflows

### "Help me newsjack [trending story]"
Go to [newsjacking.md](references/newsjacking.md), run the scoring rubric, draft 2–3 angles, pick the best, draft the pitch.

### "Find journalists who cover [beat]"
Go to [journalist-pitching.md](references/journalist-pitching.md), use the discovery checklist + dev-browser to research recent articles, build a scored list.

### "What's worth pitching this week?"
Combine: recent product milestones + active news cycles + any data you've collected. Score each potential story by the quality bar above.

### "Respond to this HARO query"
Go to [press-platforms.md](references/press-platforms.md), use the response template, keep it under 200 words.

### "Build my press page"
Use the checklist above. Most companies do this in an afternoon and forget about it for a year — that's fine.

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/journalist-pitching.md

# Journalist Pitching — Proactive PR Workflow

Building a media list, scoring journalist fit, and crafting pitches that actually get opened. This is a 4–8 week practice, not a one-shot.

## Contents
- Building the media list
- Scoring journalist fit
- Pitch templates by angle
- Subject lines that get opened
- Voice and structure
- Embargoes, exclusives, and follow-up etiquette
- Pitch killers
- Tooling

---

## Building the Media List

The goal: a list of 20–40 journalists who actually cover your beat. Not 500 names from a database.

### Discovery checklist

For each candidate journalist:

- [ ] Read their **last 5 articles** — are they covering your beat right now?
- [ ] Note their **publication** — does it reach your ICP?
- [ ] Check their **bio** on the outlet site — what topics do they own?
- [ ] Check **X/LinkedIn** for what they're posting about this week
- [ ] Note their **email** (usually on outlet author page, Muck Rack, or company About page)
- [ ] Check **Muck Rack** if available — it shows recent topics and pitch preferences

### Where to find candidates

| Method | How |
|--------|-----|
| **Reverse lookup from coverage you want** | Find 5 articles about competitors / your category, note bylines |
| **Topic search on Muck Rack** | Free tier shows journalists by topic |
| **X / Twitter lists** | "[your niche] reporters" lists already exist |
| **LinkedIn search** | "Journalist" + "[your category]" — filter by recent activity |
| **Newsletter author pages** | Beehiiv, Substack, ConvertKit creators are pitchable |
| **Podcast host research** | Listen to 1 episode before pitching — non-negotiable |

### Don't waste time on

- **Mass media databases** (Cision, Meltwater) for early-stage — overkill and expensive
- **Journalists who haven't posted in 6+ months** — they may have left
- **"Editor-in-chief" generic addresses** — pitches there get ignored or routed to interns
- **Journalists who explicitly state "no PR pitches" in bio** — respect it

---

## Scoring Journalist Fit

Score each journalist 1–10 across four dimensions. Sum and rank. Focus on top 20.

| Dimension | What it measures | Weight |
|-----------|------------------|--------|
| **Beat match** | Do they cover your category specifically? | 3x |
| **Reach** | Outlet's audience size + their byline traction | 2x |
| **Engagement** | Do they respond to pitches publicly / on X? | 2x |
| **Recency** | Have they written about a related topic in last 30d? | 1x |

**Tiering:**
- **Tier 1 (8–10):** Personal pitch with original angle. Custom each time.
- **Tier 2 (5–7):** Standard pitch, lightly customized.
- **Tier 3 (below 5):** Skip or pitch only when story is exceptional.

---

## Pitch Templates by Angle

Six structures that work. Pick the one that matches your story.

### 1. Data story

```
Subject: [Specific stat] — [implication]

Hi [name],

I noticed you covered [recent article] — wanted to share data that might
be relevant.

We [analyzed N / surveyed N / tracked N] and found:
• [Stat 1 with surprise factor]
• [Stat 2]
• [Stat 3]

The most interesting pattern: [one-sentence insight].

Full data + methodology here: [link to one-pager, not your homepage]

Happy to share the raw dataset, jump on a call, or connect you with
[customer who's relevant].

[your name + 1-line credential]
```

### 2. Exclusive launch / milestone

```
Subject: Exclusive: [specific milestone] at [company]

Hi [name],

I have an exclusive on [milestone] that I think fits your [beat] coverage.

The story: [one sentence]
Why it matters: [one sentence — for their readers, not for you]
What's new: [the actual news, not the marketing line]

Embargo until [day, time, timezone] — would love to give you first
window. Press kit + assets: [link]

Free to talk [two specific time options].

[your name]
```

### 3. Op-ed / contributed piece

```
Subject: Op-ed pitch: [provocative thesis]

Hi [name],

I read your piece on [recent article] — sharp take on [specific point].

I'd like to pitch a 700-word op-ed: "[Thesis as a headline]"

Core argument:
• [Point 1]
• [Point 2]
• [Point 3 — the surprising one]

Why me: [1 sentence — credential or unique vantage]
Why now: [1 sentence — the news hook]

Can have a draft to you by [date]. Happy to adapt to your house style.

[your name]
```

### 4. Customer story

```
Subject: Customer story for [their beat] — [specific outcome]

Hi [name],

For your [beat] coverage, I have a [customer type] willing to talk on
the record about [specific outcome].

The hook: [customer] [did something specific] and [measurable result].

The interesting part: [the surprising or counterintuitive detail].

Customer details:
• Name: [name, title, company]
• Available: [windows]
• Willing to share: [data points / screenshots / metrics]

Happy to coordinate the intro.

[your name]
```

### 5. Trend piece / connector

```
Subject: Trend forming in [space] — three signals

Hi [name],

Three things in [space] this month that I think connect:

1. [Signal 1 with link]
2. [Signal 2 with link]
3. [Signal 3 — yours, briefly]

The pattern: [one sentence].

This might be early for a piece, but if you're tracking the space I
wanted to flag it. Happy to share data we've collected or connect you
with others seeing the same.

[your name]
```

### 6. Newsjack response

```
Subject: Re: [their article headline] — quick data point

Hi [name],

Saw your piece on [story] this morning — wanted to add a relevant
data point in case you do a follow-up.

[One-sentence stat or insight].

Source: [our data / our customers / our analysis]
Methodology: [one sentence]

Quotable: "[a sentence you'd be comfortable seeing in print]"

If useful for a follow-up, I'm around all day at this number: [phone].

[your name]
```

---

## Subject Lines That Get Opened

Journalists open pitches based on the subject line alone. Rules:

- **Under 50 characters** — mobile preview cuts off
- **Lead with the specific** — "73% of devs deploy to prod on Fridays" beats "New data on developer workflows"
- **Promise a story, not a product** — "Why [trend]" beats "[Company] launches [thing]"
- **Use prefixes that signal value** — "Exclusive:", "Data:", "Op-ed pitch:", "Re: [their article]"

**Test against this question:** would *you* open this in a 200-email inbox?

**Patterns that work:**
- "[Specific stat] — [implication]" — "73% of agents fail this test"
- "Exclusive: [milestone]" — "Exclusive: Anthropic launches AgentOS"
- "Re: [their headline]" — direct response to recent coverage
- "[Provocative thesis]" — "Why VC funding is bad for AI safety"

**Patterns that get deleted:**
- "Press release: [boring]"
- "[Company] announces [thing]"
- "Story idea for you!"
- "Following up on my previous email"
- Any subject line with "innovative," "disruptive," "revolutionary"

---

## Voice and Structure

### Length

**150 words max for the pitch.** If you can't say it in 150 words, you don't know what your story is yet.

### Structure

1. **One-line context** — why you're emailing them specifically (their recent article, their beat)
2. **The story** — what it is, in one sentence
3. **Why it matters to their readers** — not why it matters to you
4. **Proof** — data, customer, quote, link
5. **The ask** — interview, embargo, quote, link

### Voice

- Sound like a person, not a press release
- Reference their actual recent work — proves you read them
- Don't use emoji unless they do
- Don't open with "I hope this finds you well" — burn it
- Don't ask "did you get my email?" follow-ups (see [Follow-up](#embargoes-exclusives-and-follow-up-etiquette))

### Banned vocabulary

Revolutionary, disruptive, game-changing, paradigm shift, leverage, synergy, robust, seamless, holistic, world-class, best-in-class, next-generation, cutting-edge, AI-powered (unless that's the actual differentiation), at-the-end-of-the-day.

---

## Embargoes, Exclusives, and Follow-Up Etiquette

### Embargoes

An embargo is "you can write this story, but don't publish until [time]."

- **Only offer embargoes to journalists you've worked with** or have strong reputations for honoring them
- State the embargo time clearly: day, time, timezone
- If they break embargo, your relationship with them is over

### Exclusives

"Only you get this story" — powerful tool, use sparingly.

- **First-tier outlet only** — exclusives to tier 2/3 outlets waste the lever
- **Be honest about scope** — "exclusive to [outlet] in the US" is fine
- **Have a parallel plan** — what you publish/pitch the next day after the exclusive runs

### Follow-up cadence

- **Day 0** — initial pitch
- **Day 3** — one follow-up if you have new information ("Just talked to [customer] who can join us")
- **Day 7** — final check-in with a fresh hook ("This came out today, still relevant?")
- **After day 7** — let it go. Re-pitch when you have something genuinely new.

**Never:**
- "Bumping this up" / "Did you see my email?"
- Multi-day silent follow-ups with no new value
- Same pitch reformatted

---

## Pitch Killers

Things that instantly disqualify your pitch:

- Wrong name / wrong outlet (autoreplace fail)
- Pitching topics they explicitly don't cover
- Press release attached as PDF (just paste the key bits)
- Long signature with logos and disclaimers
- CC'ing 5 other journalists on the same email
- "Per my last email" energy
- Asking them to sign an NDA before talking
- Pitching a story you can't actually tell (no customer willing to talk, no data ready to share)

---

## Tooling

### Finding journalist contact info

```bash
# Most journalists' emails follow patterns:
# firstname@outlet.com
# firstname.lastname@outlet.com
# flastname@outlet.com
# Use Hunter.io, RocketReach, or just guess and bounce-check
```

### Researching their recent work (browser-driven)

Use `dev-browser` (persistent session, no rate limits) to:
- Open the journalist's outlet author page → scrape last 5 article headlines + dates
- Open their X/Twitter profile → note recent topics
- Open their LinkedIn → confirm current role

Output what you find as:

```
JOURNALIST PROFILE — [name]
Outlet: [name]
Beat: [topics from last 5 articles]
Recent angle: [pattern you noticed]
Recent X activity: [what they're posting]
Score: [X/40 from rubric]
Best pitch angle: [from template library]
Email: [confirmed]
```

### Maintaining the media list

Store in `.agents/media-list.md` (or `.csv` if you prefer). Update monthly — journalists move jobs constantly.

```markdown
## Tier 1 (top 20)
| Name | Outlet | Beat | Last contact | Last coverage | Email | Score |
|------|--------|------|--------------|---------------|-------|-------|
| ...  | ...    | ...  | 2026-05-15   | none yet      | ...   | 9/10  |
```

### Pitch tracking

Track in a simple spreadsheet:
- Date sent
- Subject line
- Journalist
- Outlet
- Response (open / reply / pass / coverage)
- What they said

After 30 pitches, you'll see which subject patterns and which angles work for you specifically.

### references/media-outlets.md

# Media Outlets — Where to Pitch

A curated, opinionated list of *where* to pitch for software/SaaS PR. This is the media-outlet slice of resources like submit.co — the journalist-driven half. For startup/SaaS/AI directories (Product Hunt, BetaList, Futurepedia, etc.), use the separate `directory-submissions` skill — different intent, different audience.

## How to use this list

- **Don't pitch a publication. Pitch a journalist at that publication.** See [journalist-pitching.md](journalist-pitching.md) for the discovery workflow.
- **Tier signals quality, not effort** — a small tier-3 outlet might be perfect for your niche
- **Submission/tip URLs are listed where they exist** — but a journalist's email beats a tip form every time
- **This list ages fast** — verify the outlet still exists and the journalist is still there before pitching

---

## Tech & Startup Press (Tier 1)

The big names. High bar to clear, high payoff when you do. Pitch the specific reporter, not the tip line.

| Outlet | Best for | Tip URL |
|--------|---------|---------|
| **TechCrunch** | Funding, product launches, startup news | techcrunch.com/got-a-tip/ |
| **The Verge** | Consumer tech, product reviews, policy | theverge.com/contact |
| **Wired** | Long-form tech, culture, business | wired.com/about/feedback |
| **Fast Company** | Innovation, design, business strategy | fastcompany.com/contact-us |
| **VentureBeat** | AI, enterprise tech, gaming | venturebeat.com/contribute |
| **Ars Technica** | Deep tech, science, policy | arstechnica.com/contact-us |
| **The Information** | Subscription-gated, scoops on tech industry | theinformation.com/about |
| **Bloomberg / Reuters** | Business, finance, big-picture stories | bloomberg.com/feedback |
| **WSJ Tech** | Enterprise, business angle | wsj.com/tips |
| **NYT Tech** | Mainstream tech, culture | nytimes.com/tips |

---

## SaaS & B2B (Tier 1–2)

Lower-profile than the consumer tech outlets but often higher ROI for B2B SaaS.

| Outlet | Best for | Notes |
|--------|----------|-------|
| **SaaStr** | B2B SaaS founders, growth, sales | Jason Lemkin's outlet; pitch contributed posts |
| **First Round Review** | Operator-level B2B insights | High bar; original frameworks only |
| **OpenView** | SaaS metrics, PLG, pricing | Often runs research-backed pieces |
| **Lenny's Newsletter** | Product / growth | Subscriber-only; pitch via Lenny directly on X |
| **Future (a16z)** | Tech + culture pieces | Long-form, original thinking required |
| **Stratechery** | Tech strategy analysis | Don't pitch Ben Thompson; engage via responses |

---

## AI / ML Press (Tier 1–2)

The hottest beat right now. Reporters here are inundated — your angle has to be sharp.

| Outlet | Best for | Notes |
|--------|----------|-------|
| **The Decoder** | AI news, fast-turn | Daily AI news cycle |
| **Import AI** (Jack Clark) | Weekly AI newsletter | Pitch research-backed angles |
| **The Batch** (Andrew Ng) | AI industry analysis | Submitted by deeplearning.ai team |
| **MIT Technology Review** | AI policy, capability, ethics | Higher bar, slower cycle |
| **Hugging Face blog** | Open-source AI tools | Contributed posts welcome |
| **Latent Space** | Practitioner-focused AI/ML | Podcast + newsletter |

---

## Developer & DevTools Press

Where to pitch if your audience is engineers.

| Outlet | Best for | Notes |
|--------|----------|-------|
| **The New Stack** | DevTools, infra, cloud-native | Active contributor program |
| **InfoQ** | Enterprise dev, software architecture | Long-form technical pieces |
| **DEV.to** | Self-published, community-driven | Build credibility before pitching |
| **Hacker Noon** | Tech blogging platform | Easy to publish but low signal |
| **Console** | DevTools newsletter | Curated weekly; submit projects |
| **DevTools FM** | Podcast | Pitch as guest |

---

## Business & Marketing Press

For pitching the business / marketing angle of your story.

| Outlet | Best for | Notes |
|--------|----------|-------|
| **Inc.** | Founder stories, business advice | Contributor program available |
| **Entrepreneur** | Small business, growth | Volume publisher; quality varies |
| **HBR.org** | Original research, frameworks | High bar; long lead time |
| **MarketingProfs** | B2B marketing | Contributor-friendly |
| **Marketing Brew (Morning Brew)** | Daily marketing newsletter | Reporter-driven, pitch directly |
| **Marketing Land / Search Engine Journal** | SEO, SEM, channels | Niche but high-intent audience |
| **Reforge** | Growth, product, retention | Original framework required |

---

## Newsletters (Reporter-Driven)

Newsletters are increasingly the most valuable PR placement — small audiences, but high-intent.

| Newsletter | Audience | How to pitch |
|-----------|---------|--------------|
| **Lenny's Newsletter** | Product/growth, ~600k readers | DM Lenny on X with sharp angle |
| **The Pragmatic Engineer** (Gergely Orosz) | Software eng leaders | Pitch via email; original engineering insights |
| **The Generalist** (Mario Gabriele) | Tech business analysis | Pitch via email; deep angles |
| **Stratechery** (Ben Thompson) | Tech strategy | Don't pitch; engage in replies |
| **Newcomer** (Eric Newcomer) | Tech business + scoops | Tips welcome via email |
| **Platformer** (Casey Newton) | Tech + policy | Pitch via Substack |
| **Big Technology** (Alex Kantrowitz) | Big Tech analysis | Pitch via Substack |
| **Not Boring** (Packy McCormick) | Tech + culture | Tough to crack; original takes only |

**For B2B SaaS:**
- **SaaStr Daily**
- **Demand Curve**
- **Growth Unhinged** (Kyle Poyar)
- **Trends.vc**

**For AI:**
- **Import AI** (Jack Clark)
- **The Batch** (Andrew Ng)
- **The Algorithm** (MIT Tech Review)
- **Interconnects** (Nathan Lambert)
- **AI Tidbits**

---

## Podcasts

A podcast appearance is often higher leverage than a press hit — longer engagement, evergreen replay, audience trust transfer.

### Top SaaS / startup podcasts
- **Lenny's Podcast** — product/growth
- **My First Million** — founder stories, business ideas
- **The Twenty Minute VC** — funding angle
- **SaaStr Podcast** — B2B SaaS
- **Acquired** — deep-dive company stories (don't pitch unless you're a unicorn)
- **The All-In Podcast** — broad tech/business (very hard to get on)

### Top AI podcasts
- **No Priors** (Sarah Guo, Elad Gil)
- **Latent Space**
- **Practical AI**
- **The TWIML AI Podcast**
- **The Cognitive Revolution**

### Top dev / engineering podcasts
- **The Changelog**
- **Software Engineering Daily**
- **DevTools FM**

### How to pitch a podcast

1. **Listen to 3 episodes** — non-negotiable
2. **Find the host's preferred channel** (X DM, email, guest form)
3. **Pitch a topic, not yourself** — "I'd love to come on and talk about [specific angle]" not "I'd love to be a guest"
4. **Bring evidence** — links to other appearances, your unique angle, what listeners will learn
5. **Make it easy** — bio, headshot, suggested questions in the pitch

---

## Industry / Vertical Press

Don't overlook trade press — smaller audience, much higher intent.

| Vertical | Outlets to investigate |
|----------|----------------------|
| **Marketing** | Adweek, Marketing Brew, AdAge, Search Engine Land |
| **Sales** | Sales Hacker, Modern Sales Pros |
| **HR / People Ops** | HR Brew, SHRM, HR Dive |
| **Finance / Fintech** | The Block, CoinDesk, Finextra |
| **Healthcare tech** | STAT, MobiHealthNews, Healthcare IT News |
| **Education tech** | EdSurge, EdScoop |
| **Real estate tech** | Inman, The Real Deal |
| **Legal tech** | Above the Law, Law360 |
| **Climate tech** | Heatmap, Canary Media, Latitude Media |
| **Devtools** | The New Stack, InfoQ, DevOps.com |

For your specific vertical: Google `"top publications" + "[your industry]"` and run the same scoring exercise from [journalist-pitching.md](journalist-pitching.md).

---

## Regional / Local

If your company has a regional angle (HQ location, customer concentration, government contract), local press is underrated.

- **Local business journals** — Bizjournals network covers 40+ US cities
- **Local NPR affiliates** — high-quality, business angle welcomed
- **Local TV business segments** — high reach, easy to get
- **State / regional tech news** — e.g., Built In (Chicago, Austin, etc.), TechBuzz (Utah)

---

## What's NOT On This List (And Why)

- **Product Hunt, BetaList, Indie Hackers** — these are directories, not press. Use the `directory-submissions` skill.
- **Press release wires** (PRNewswire, BusinessWire, GlobeNewswire) — overpriced for early-stage; journalists ignore them. Skip until you have IR / SEC requirements.
- **"As featured in" badge mills** — paid "media coverage" services. Worthless and damaging.
- **Random "guest post" SEO link networks** — Google penalizes these. Don't.

---

## Maintaining This List

This list will go stale. Recommended cadence:

- **Quarterly:** verify your tier-1 contacts are still at the outlet
- **Monthly:** add new outlets/newsletters relevant to your category
- **Per pitch:** confirm the journalist is still there before sending (check X / LinkedIn for "joined [new place]")

Store your live, working version in `.agents/media-list.md` (per [journalist-pitching.md](journalist-pitching.md)).

### references/newsjacking.md

# Newsjacking — Reactive PR Workflow

Injecting your POV into a story that's already trending. Done well: free distribution off a wave of attention. Done badly: cringe at best, brand damage at worst.

## Contents
- When newsjacking works (and when it doesn't)
- The detect → score → angle → pitch loop
- Newsworthiness scoring rubric
- Story angle library
- Speed: the only thing that matters
- Sources & tooling
- Failure modes

---

## When Newsjacking Works

- **Tech/regulatory news in your category** — new law, new platform launch, competitor pivot, big acquisition
- **Industry data drops** — a major report drops, you have a sharper take or contradicting data
- **Public conversation** — a debate or controversy where your expertise is genuinely relevant
- **Seasonal/cyclical moments** — earnings season, year-end reviews, conference weeks

## When to Skip

- **Tragedies, accidents, deaths** — no exceptions. Don't.
- **Politically charged stories** unless your brand explicitly takes political stances
- **You have no genuine expertise** in the area
- **The window is already closed** — if a story is 48h+ old and you weren't first, you're late
- **The angle is "we have a product for this"** — that's marketing, not journalism

---

## The Loop

A repeatable workflow Claude can run on demand or daily.

1. **Detect** — surface trending stories in your category (see [Sources & Tooling](#sources--tooling))
2. **Score** — apply the [newsworthiness rubric](#newsworthiness-scoring-rubric); drop anything below threshold
3. **Angle** — generate 2–3 angles per story using the [angle library](#story-angle-library)
4. **Validate** — sanity-check: do you actually have the expertise/data to back this angle?
5. **Pitch** — draft a tight pitch to 3–5 journalists who cover this beat (see [journalist-pitching.md](journalist-pitching.md))
6. **Post** — also publish on your blog, LinkedIn, X — it builds the trail journalists check before quoting you

Output format Claude should produce:

```
NEWSJACK CANDIDATE — 2026-06-10

Story: "EU passes AI Act amendment requiring agent registration"
Source: TechCrunch, 3h ago
Score: 8/10 (high relevance, fresh, you have proprietary data)

Angles:
1. Data hot take: "Our analysis of 12,000 agent deployments shows 73% would fail this requirement"
2. Contrarian: "Why the registration rule will hurt safety, not improve it"
3. Customer story: "How [customer] is preparing — interview offer"

Recommended: #1 (you have unique data, strongest hook)
Pitch draft: [see journalist-pitching.md for template]
Target journalists: [list with rationale]
```

---

## Newsworthiness Scoring Rubric

Score each candidate 1–10 on five dimensions, multiply by the weight, then sum. Max possible: 80 (10 × the 8x weight total).

| Dimension | What it measures | Weight |
|-----------|------------------|--------|
| **Timeliness** | Story <24h old? Window still open? | 2x |
| **Relevance** | Genuinely in your expertise area? | 2x |
| **Angle uniqueness** | Can you say something no one else is saying? | 2x |
| **Authority** | Do you have data, customers, or experience to back it? | 1x |
| **Reach potential** | Will this story keep growing or has it peaked? | 1x |

**Threshold:** weighted total ≥ 50/80. Below that, skip.

**Auto-disqualify if:**
- The story is about something tragic
- Your angle is "I disagree" with nothing to back it
- You haven't actually formed an opinion — you just want to be quoted

---

## Story Angle Library

Use these templates to generate angles fast.

### 1. Data hot take
*"We analyzed [N] [things] after [event]. Here's what we found."*

Best when you have proprietary data. The journalist gets a stat, you get the citation.

### 2. Contrarian
*"Everyone says [popular take]. Here's why they're wrong."*

Best when you can defend the position with specifics. Weak when it's just contrarianism for attention.

### 3. "We predicted this"
*"Six months ago we wrote [thing] — here's what's happening now and what's next."*

Best when you actually did predict it. Lethal to your credibility if you didn't.

### 4. Customer impact
*"Here's a [customer type] who's directly affected. We can put you in touch."*

Best for B2B. Reporters love named customers willing to talk.

### 5. Insider explainer
*"This story is complicated. Here's what's actually happening."*

Best when most coverage is missing nuance. You're not arguing — you're educating.

### 6. Trend connector
*"This isn't isolated — it's part of a bigger shift we're seeing in [pattern]."*

Best when you have several data points or examples to connect.

### 7. Founder POV
*"As someone who's built in this space for [X years], here's the part most people are missing."*

Best for opinion pieces / op-eds. Weak as a soundbite pitch.

---

## Speed: The Only Thing That Matters

Newsjacking decays fast. Approximate windows:

| Story type | Effective window |
|-----------|------------------|
| Breaking tech news | 4–12 hours |
| Major regulation / policy | 24–48 hours |
| Industry report / data drop | 24–72 hours |
| Conference announcement | Same day |
| Acquisition / funding news | 12–24 hours |

**Implication:** if you can't draft and send within the window, don't bother. Set up the loop so detection → pitch takes <2 hours.

---

## Sources & Tooling

Reuses tooling from the `social` skill's listening workflow. Same install: `brew install jq`.

### Google News RSS (no auth)

```bash
# Replace QUERY with topic (use + for spaces, %22 for quotes)
curl -s "https://news.google.com/rss/search?q=QUERY&hl=en-US&gl=US&ceid=US:en" \
  | xmllint --xpath "//item[position()<11]" - 2>/dev/null
```

### Hacker News (Algolia) for tech stories

```bash
SINCE=$(($(date +%s) - 86400))
curl -s "https://hn.algolia.com/api/v1/search_by_date?query=QUERY&tags=story&numericFilters=created_at_i>${SINCE}" \
  | jq '.hits[] | {title, url, points, num_comments, created_at, hn_url: ("https://news.ycombinator.com/item?id="+.objectID)}'
```

### Reddit (for category-specific subs)

```bash
curl -s -A "newsjack/1.0" \
  "https://www.reddit.com/r/SUBREDDIT/top.json?t=day&limit=15" \
  | jq '.data.children[].data | {title, url, score, num_comments, created_utc}'
```

### Journalist research (browser-driven)

For finding *which* journalists are covering the story right now:
- **dev-browser** → Google News search for the story → click through to articles → note the bylines
- Then go to those journalists' X / LinkedIn / Muck Rack profile to confirm beat and recent coverage

See also [journalist-pitching.md](journalist-pitching.md) for the full discovery workflow.

### Source list

For repeatable monitoring, add a "Newsjacking topics" section to `.agents/listening-sources.md` (template in the `social` skill's references):

```markdown
## Newsjacking topics (Google News RSS)
- "AI agent regulation"
- "[your category] funding"
- "[your competitors] OR [adjacent competitors]"

## Industry data drops (RSS / manual)
- Pitchbook reports
- a16z state of [industry] reports
- [your category] benchmark reports
```

---

## Failure Modes

Things that have ended careers and brands.

- **Tragedy-jacking** — Oreo's 2013 Super Bowl tweet worked. Most attempts since have not. Wartime, disasters, deaths: don't.
- **The forced fit** — "Here's our take on [trending story] — it's actually about [our product]." Journalists see through this instantly.
- **The empty take** — pitching "we have an opinion" without specifics. Journalists need a quote-worthy line, not "we're closely watching this."
- **Speed without judgment** — being first with a bad take is worse than being late with a good one. The 30-minute "is this brand-appropriate?" gut check exists for a reason.
- **Pitching the same angle to 50 journalists** — they talk. Get caught once, lose the relationships.
- **No follow-through** — pitch goes out, journalist responds in 20 minutes, founder takes 6 hours to reply. Story moves on.

---

## Companion Practice: The Public Trail

Every newsjack pitch is stronger if the journalist can find evidence you've been thinking about this publicly. Before pitching:

1. Publish a short post (blog, LinkedIn, X thread) with your take
2. Reference it in the pitch ("more thinking here: [link]")
3. This signals you're not opportunistic — you're an actual voice in the space

If you don't have time to publish, you're probably not ready to pitch.

### references/press-platforms.md

# Press Request Platforms — Inbound PR

Journalists posting "I need a source for X" — you respond, sometimes you get quoted, sometimes you don't. The cheapest PR play available, but only if you treat it seriously.

## Contents
- The major platforms
- Daily triage workflow
- Response template
- What makes a response get selected
- What kills a response
- ROI reality check

---

## The Major Platforms

| Platform | What it is | Cost | Quality |
|----------|-----------|------|---------|
| **[Connectively](https://www.connectively.us)** (formerly HARO) | Daily email digest of journalist queries | Free tier; paid for filters | Mixed — high volume, lots of noise |
| **[Qwoted](https://www.qwoted.com)** | Web app with journalist requests | Free; paid for outreach | Good — better-quality outlets |
| **[Featured](https://featured.com)** | Web app, expert profiles, journalist requests | Free tier; paid pro | Good for thought-leadership snippets |
| **[Help A B2B Writer](https://helpab2bwriter.com)** | Twice-weekly email of B2B queries | Free | High — B2B-focused, low spam |
| **[SourceBottle](https://www.sourcebottle.com)** | Australia-focused but global queries | Free | Variable |
| **[Terkel](https://terkel.io)** | Roundup-style ("we asked 50 experts…") | Free | Volume-heavy, low effort |
| **[JournoRequests](https://twitter.com/journorequests)** | X account aggregating tweets | Free | UK-skewed, real-time |
| **#JournoRequest** (X hashtag) | Live journalist requests | Free | Real-time, fast-moving |

**Recommended starter set:** Connectively + Qwoted + Help A B2B Writer + monitoring `#JournoRequest` on X.

---

## Daily Triage Workflow

These platforms generate volume. Treat it like email triage — fast pass, deep response on the rare matches.

### Step 1 — Filter (5 min)

For each digest / request feed:
- Drop everything where you don't have **direct experience or data**
- Drop everything from outlets your ICP doesn't read
- Drop everything with a deadline you can't meet
- Keep only requests where you can give a **complete, named, on-the-record answer**

Realistic conversion: 50 daily requests → 2–4 worth answering.

### Step 2 — Deep response (15 min per request)

For each keeper:
- Read the request 3 times — what's the *actual* angle?
- Look up the journalist if possible — recent coverage, beat
- Write a custom response (see [template](#response-template))
- Send within their stated deadline (early > late)

### Step 3 — Log

Track in a spreadsheet:
- Date
- Platform
- Journalist + outlet
- Topic
- Response sent (yes/no)
- Outcome (no response / passed / quoted / linked)

After 30 responses, you'll see which topics/platforms convert.

---

## Response Template

Keep responses under 200 words. Journalists are scanning 50+ replies for one quote.

```
Hi [name],

Quick response to your request about [topic].

[Specific credential — 1 sentence. "Built X for 5 years" / "Led marketing at Y" / "Have analyzed N companies in space"]

The most important thing about [topic]: [your actual point in 2 sentences].

[A specific example, story, or data point — this is what gets quoted.]

[If applicable: a contrarian or surprising angle that differentiates from typical answers.]

Happy to expand on any of this, share data, or be quoted directly.

Feel free to use this attribution:
[Your name], [your title], [your company]

Contact for follow-up: [email + phone]
```

**Note the structure:**
1. One-sentence intro
2. One-sentence credential
3. Two-sentence answer
4. Specific example (the quotable part)
5. Optional: differentiator
6. Clear offer
7. Pre-written attribution (saves them 30 seconds)
8. Contact info

---

## What Makes a Response Get Selected

After analyzing hundreds of quoted responses, the patterns:

### Quotable specificity
**Bad:** "Companies should focus on customer experience."
**Good:** "When we A/B tested 47 onboarding flows, the version with a 30-second video at step 3 increased activation by 41%."

The good version is a quote. The bad version is filler.

### Concrete credential
**Bad:** "As a marketing expert..."
**Good:** "I've run growth at three Series B SaaS companies, all in B2B sales tooling."

Specificity beats title-stacking.

### Story over advice
**Bad:** "It's important to track the right metrics."
**Good:** "We almost shut down because we were optimizing for MRR when our real problem was activation. Once we switched to tracking 7-day activation, everything else followed."

Stories make articles. Advice makes filler.

### Pre-formatted for their workflow
- Pre-written attribution
- Multiple quotable lines (let them pick)
- High-res headshot link (don't attach)
- One-line company description

### Time match
**Most quotes come from responses sent in the first 6 hours.** After 24 hours, your chances drop sharply. Treat deadlines as if they're 24h earlier than stated.

---

## What Kills a Response

- **Pitching your product** when they asked for expert commentary
- **Generic advice** that could come from any expert
- **Multiple "experts" from your company** responding to the same request (looks coordinated, often is)
- **Hiring a PR firm to spam responses** — journalists smell it
- **Demanding a link back** to your site — most can't promise links
- **Ignoring the deadline** by 1+ days
- **Long bio sections** before the actual answer
- **Asking to "see the article before publication"** — you don't get to do that
- **Asking what other experts said** so you can differentiate — they won't tell you

---

## ROI Reality Check

Most teams overinvest in these platforms because they're cheap. Be honest:

| Effort | Realistic outcome (90 days) |
|--------|----------------------------|
| 5 hr/week, custom responses | 3–10 quoted placements |
| 1 hr/week, template responses | 0–2 placements |
| Outsourced to PR firm | Lots of submissions, few quotes |

**A quote in a tier-1 outlet is worth:**
- A backlink (DR depends on outlet)
- A sales-collateral asset ("As featured in...")
- AI-citation surface area
- Brand legitimacy in the abstract

**A quote in a tier-3 outlet is worth:**
- A backlink, often nofollow
- Maybe an Instagram screenshot

**Decision rule:** if you can sustain 5 hr/week of quality responses for 90 days, this is worth it. If you can only do 1 hr/week, skip it and invest in [proactive pitching](journalist-pitching.md) instead.

---

## Setup Checklist

Before you start responding:

- [ ] Press page exists and is current (see main SKILL.md)
- [ ] One-line credential is written and rehearsed
- [ ] Headshot is high-res and at a public URL
- [ ] You have 3–5 specific stories / data points ready to deploy
- [ ] You've decided which 2–3 platforms to use (don't try all 7)
- [ ] You've blocked a daily 20-min window for triage
- [ ] You're logging responses in a tracker

Without these, you're spamming and wasting their time and yours.

