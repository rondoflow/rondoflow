---
name: directory-submissions
description: "When the user wants to submit their product to startup, SaaS, AI, agent, MCP, no-code, or review directories for backlinks, domain rating, and discovery. Also use when the user mentions \"directory submissions,\" \"submit to directories,\" \"backlinks from directories,\" \"list my product,\" \"submit to Product Hunt,\" \"BetaList,\" \"TAAFT,\" \"Futurepedia,\" \"G2 listing,\" \"Capterra listing,\" \"AlternativeTo,\" \"SaaSHub,\" \"AI directories,\" \"MCP registry,\" \"agent directory,\" \"dofollow backlinks,\" \"launch directories,\" or \"directory tracker.\" Use this whenever someone is planning the directory layer of a product launch or an ongoing backlink campaign. For the broader launch moment, see launch. For programmatic SEO pages that should live behind these backlinks, see programmatic-seo. For AI citation optimization, see ai-seo."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Directory Submissions

You are an expert in directory-driven distribution for software products. Your goal is to help the user build a compounding backlink + discovery foundation by submitting to the right directories, in the right order, with the right positioning — and to make sure that foundation actually produces leads instead of vanity backlinks.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

---

## Core Philosophy

Directory submissions are the **foundation layer** of distribution — never the whole strategy. They do three things well:

1. **Pass dofollow backlinks** from high domain-rating sites into your marketing pages. This raises your DR, which makes your entire site easier to rank for competitive keywords.
2. **Create discovery surface area** — people browsing AI/SaaS directories are in-market buyers, not random traffic.
3. **Get cited by AI engines** — ChatGPT, Claude, Perplexity, and Google AI Overviews all pull heavily from high-DR directories when answering "what's the best [category]?" queries. AI-referred traffic converts **6–27× higher** than traditional search traffic.

But directories alone will not generate meaningful leads. They exist to pass link equity into the pages that DO generate leads — template galleries, comparison pages, alternative pages, blog posts. **Build the destination pages first, then submit to directories so the link equity has somewhere useful to land.**

The full directory catalog lives in `references/directory-list.md`. The positioning variant library lives in `references/positioning-variations.md`. The submission tracker template lives in `references/submission-tracker-template.csv`.

---

## The Three Hard Rules

### Rule 1: Foundation before submission
Never submit to a directory until the landing page it will link to is live, indexed, and has:
- A single `<h1>` and sequential heading hierarchy — pages with clean hierarchy have **2.8× higher AI citation rates**, and 87% of ChatGPT-cited pages use a single H1.
- A real pricing page (even "free while in beta" counts — most Tier 1 directories require one).
- Privacy policy + terms.
- Logo assets in PNG + SVG + square 1024×1024 + favicon.
- 5–8 real product screenshots at 1920×1080 (not marketing mockups).
- A 60–90 second demo video — products with video on Product Hunt get **2.7× more upvotes**.
- FAQ schema markup (AI engines heavily weight `FAQPage` JSON-LD for answer extraction).
- Structured data: `Organization`, `Product`, `SoftwareApplication`.

### Rule 2: Destination pages before directories
Directories are the *source* of link equity. You need *destinations* that can convert the resulting traffic. Minimum destinations before submitting to anything:
- 3–5 competitor alternative pages (`/alternatives/[competitor]`) targeting "[competitor] alternative" keywords. Comparison/alternative pages convert at **5–15%** vs 0.5–2% for generic content.
- 3–5 use-case pages (`/for/[audience]` or `/use-cases/[use-case]`).
- Template gallery with 20+ entries (if applicable — this was Typeform's largest SEO growth driver, generating 30K non-branded signups and $3M/year LTV).
- 1 "best of" blog post you wrote yourself about your own category, including honest coverage of competitors.

### Rule 3: Positioning varies by directory type
Never copy-paste the same description everywhere. AI engines penalize duplicate content, and each directory audience responds to different framing. See `references/positioning-variations.md` for the full variant library. Short version:

| Surface | Lead with | Why |
|---|---|---|
| Startup directories | **Outcome** | Audience is other founders. They care what it does. |
| SaaS directories | **Alternative framing** | People search "[competitor] alternative" — meet them there. |
| AI directories | **AI-first architecture** | TAAFT/Futurepedia audiences explicitly want AI tools. |
| Agent/MCP directories | **Agent/MCP angle** | Niche but high-intent. A real moat. |
| No-code directories | **Ease + power** | Audience values speed-to-build over depth. |
| Dev directories | **Technical depth** | Dev audiences reward technical substance. |
| B2B review sites | **ROI + use case** | Buyers want outcomes and case studies. |

---

## Workflow

### Step 1: Readiness assessment (Phase 0)

Ask the user these 9 questions. If any are "no", they're not ready — help them build the missing piece first.

1. Is the product publicly accessible (no password wall)?
2. Is there a pricing page (even "free while in beta")?
3. Are privacy policy + terms live?
4. Logo assets in PNG + SVG + square + favicon?
5. 5–8 real screenshots + 60–90s demo video?
6. Landing pages GEO-ready (single H1, sequential hierarchy, FAQ schema, structured data)?
7. At least 3 alternative pages and 3 use-case pages live and indexed?
8. Template gallery or lead magnet asset (if applicable to category)?
9. At least 20 beta/early users who could leave a review on G2?

A "no" on any of 1–7 is a hard block. A "no" on 8–9 is a soft block: you can launch but will lose Tier 2 review value and Typeform-style compounding.

### Step 2: Choose the tiers

Full catalog in `references/directory-list.md`. Summary:

| Tier | When | Examples | Typical count |
|---|---|---|---|
| **Tier 1 — Flagship launch** | Launch week only | Product Hunt (anchor), BetaList, HN Show HN, Fazier, DevHunt | ~15 |
| **Tier 2 — Startup/SaaS** | Week 1 + rolling | AlternativeTo, SaaSHub, G2, Capterra, F6S, SourceForge, Slashdot | ~50 |
| **Tier 3 — AI directories** | Week 1–3 | TAAFT, Futurepedia, Toolify, Future Tools, aitools.inc, AIStage | ~40 |
| **Tier 4 — Agent/MCP registries** | Week 1–3 (if MCP) | Glama, APITracker, LF MCP Registry, AI Agents List | ~10 |
| **Tier 5 — No-code directories** | Week 1–3 (if no-code) | NoCodeFinder, No Code MBA, We Are No Code, MakerPad | ~8 |
| **Tier 6 — "Best of" listicles** | Rolling outreach | Cold outreach to DR 40+ blog posts | ~10 inclusions |
| **Tier 7 — Integration marketplaces** | When integrations ship | Zapier, HubSpot, Slack, Airtable, Notion | ~5 |
| **Tier 8 — Profile & content platforms** | Rolling | GitHub, WordPress.com, Substack, Dev.to, SlideShare, Behance | ~50 |
| **Tier 9 — Local business directories** | Rolling (if applicable) | Manta, Hotfrog, Locanto, MerchantCircle | ~20 |
| **Tier 10 — Forums & communities** | Rolling (participate first) | SitePoint, GrowthHackers, Warrior Forum, Designer News | ~13 |
| **Tier 11 — Press release & article sites** | Launch + milestones | PRLog, PR.com, EzineArticles, Feedspot | ~25 |
| **Tier 12 — Social bookmarking** | Rolling | Scoop.it, Diigo, Pearltrees | ~5 |
| **Tier 13 — Niche vertical directories** | When vertical fits | Justia (legal), Porch (home), LandBook (design), etc. | ~20 |

**Triage rule:** Only submit where the product is a genuine fit. Forcing a listing into the wrong category burns the first-submission advantage and gets rejected by moderators.

### Step 3: Prepare asset variations

For each tier, prep a distinct description variant (pulled from `references/positioning-variations.md`):
- **Tagline** under 10 words
- **Short description** at 60 chars
- **Long description** at 150 words
- **5–8 category tags**
- **Logo** assets
- **Screenshots** + demo video URL
- **Founder story** (2–3 sentences)

**Critical:** Don't copy-paste the same long description into every directory. Vary the opening sentence, the feature emphasis, and the audience framing per tier. AI engines cross-reference and down-weight duplicate content.

### Step 4: Batch submit

Set up the tracker spreadsheet (`references/submission-tracker-template.csv`). Work left-to-right through it. 2–3 hours per batch is realistic.

Per submission:
1. Copy the tier-appropriate positioning variant.
2. Fill in the form.
3. Upload assets.
4. Submit.
5. Log: date, URL, status, moderator notes.
6. Once live, verify the backlink exists and is dofollow: `curl -sIL https://directory.com/your-listing | grep -i rel=`. If absent, the link is dofollow.

---

## Product Hunt Deep Dive (The Anchor Event)

Product Hunt is the single highest-leverage submission but also the most easily wasted. The 2026 PH algorithm weights **comment quality** more than upvote count — a post with 50 upvotes + 30 genuine comments ranks above one with 200 upvotes + 5 comments. **80% of failed launches** fail because they launched without a warm audience OR asked for upvotes instead of feedback.

### 3-week prep timeline

- **Day -21 to -14:** Warm up hunter account. Upvote + thoughtfully comment on 3 launches/day. Follow 100+ active makers. Build history so your account looks real to the algorithm.
- **Day -14:** Create "Upcoming" page on PH. Drive traffic to it to collect "notify on launch" subscribers.
- **Day -10:** (Optional) book a hunter. Don't pay cash — trade a feature, shoutout, or intro. A known hunter adds ~15% to day-one momentum but isn't required.
- **Day -7:** Draft launch-day assets: gallery images (1270×760), tagline, 260-char description, first comment from you, first comment from a customer.
- **Day -3:** Email list warm-up. "We're launching Tuesday. Here's what to expect. Reply if you want a heads up."
- **Day -1:** Final check — product works in incognito, video autoplays, CTA goes to signup, PH listing preview looks right.

### Launch day execution

- **Launch at 12:01 AM Pacific Time.** Tuesday, Wednesday, or Thursday only — weekend launches get 60–70% less traffic. The 12:01 AM PT start maximizes your 24-hour window.
- **First 2 hours are everything.** Need 50+ supporters in the first 2 hours to trigger algorithmic distribution.
- **Post the first comment yourself** with the story: why you built it, what's different, what to try first.
- **Reply to every comment** in under 30 minutes. PH measures maker responsiveness.
- **Share the link to:** Twitter/X thread, LinkedIn long-form post, personal Slack/Discord communities, your email list, Indie Hackers, every power user via DM.
- **Never ask for upvotes.** Ask for **feedback**. "Would love your honest take on the positioning" converts 3× better than "support us!" and doesn't trigger the algorithm's anti-manipulation filters.
- **Don't message strangers.** The community flags this and moderators will hide your post.

### Post-launch

- Write a launch recap blog post with numbers + lessons. Honest, not bragging. Publish on day 2.
- Cross-post the recap to Indie Hackers and r/SaaS (where promotion is allowed).
- Only submit to Show HN if you have a *technical* angle to share (architecture, DSL, novel approach). A generic "we launched a SaaS" post will get flagged to death.

---

## Reviews Playbook (G2 / Capterra / TrustRadius)

G2 and Capterra (now owned by G2 as of Feb 2026) listings are **worthless without reviews**. 10 reviews is the magic threshold for Grid appearance. Run the 10-in-30 protocol during launch month.

### The 10-in-30 protocol

1. **Day 1 post-launch:** Identify 20 users who have completed a meaningful action with the product.
2. **Send each a personal email** with a direct review URL (reduces friction by ~70%). No forms, no landing pages — direct link.
3. **Offer a modest thank-you.** G2 and TrustRadius explicitly allow small incentives like a $25 Amazon gift card.
4. **Follow up once** after 5 days. Don't follow up twice — it becomes annoying and damages the relationship.
5. **Target:** 50% conversion → 10 reviews from 20 asks.

### Critical deadlines

- **G2 Summer reports:** cut off ~April 28. Plan review drives to land before this.
- **G2 Fall reports:** cut off ~July 28.
- Missing a cutoff means waiting 3 months for the next grid update.

### Badges and paid plans

- **"Users Love Us" badge** is still free: requires 20 reviews at 4.0+ average.
- **Grid, Momentum, Index, and Award badges** require a paid G2 plan ($2,999+/year starting Summer 2025).
- **Do not spend on paid G2 in year one.** The free listing + Users Love Us badge is sufficient.

### Cross-platform

- TrustRadius follows similar mechanics but smaller volume.
- Capterra auto-syncs from Gartner Digital Markets in some categories — may populate without direct action.

---

## Destination Pages Strategy (What the Backlinks Point At)

Directories are useless if the backlinks land on a generic homepage. Build these destination pages *before* submitting:

### 1. Alternative pages (highest ROI)

Competitor alternative pages convert at **5–15%**, often hitting 15–30% for bottom-of-funnel queries. One page per top competitor:

- `/alternatives/[competitor-1]`
- `/alternatives/[competitor-2]`
- `/alternatives/[competitor-3]`
- `/alternatives/[competitor-4]`

Each page needs: honest feature comparison table, "when to choose X over us," "when to choose us over X," pricing comparison, 3–5 use-case examples, strong FAQ with schema.

**Critical:** Be honest. AI engines cross-reference competitor feature claims and de-rank pages that lie.

### 2. Use-case / ICP pages

Every ICP gets a dedicated landing page:
- `/for/[audience]` — coaches, agencies, ecommerce, SaaS, consultants, etc.
- `/use-cases/[use-case]` — lead qualification, onboarding, product recommendations, etc.

### 3. Template / asset gallery (if applicable)

Typeform's template library generated **30,000 non-branded organic signups and $3M/year LTV**. The pattern:
- One indexable page per template at `/templates/[slug]`.
- H1 with the keyword, 150+ word description, screenshot, "when to use this," "use this template" CTA.
- Related templates at the bottom of each page (internal linking = SEO compounding).
- 100 templates by day 30, 300 by day 90 is the realistic target.

### 4. "Best of" listicles you wrote yourself

Write honest roundups of your own category: `/blog/best-[category]-tools-2026`. Include yourself + 10 competitors with real reviews. These rank for category queries AND serve as canonical references AI engines cite.

### 5. Integration pages (when integrations ship)

Every integration = one landing page at `/integrations/[partner]`. Follows the Zapier playbook: Zapier gets **~2.6M monthly organic visits** from programmatic integration pages (~15% of their total organic traffic).

---

## GEO (Generative Engine Optimization)

In 2026, 30–50% of "research a tool" queries happen inside ChatGPT, Claude, Perplexity, or Google AI Overviews without ever touching a traditional search page. Directories matter here too — AI engines pull heavily from high-DR directories when generating answers. But the *destination pages* also need to be GEO-optimized.

### Tactics that get pages cited

1. **One H1 per page, sequential heading hierarchy.** 2.8× higher citation rate. 87% of cited pages use a single H1.
2. **Dense, factual content with citable stats.** AI engines prefer specific numbers ("3× faster than X") over vague claims.
3. **FAQ schema on every landing page.** AI engines heavily weight `FAQPage` JSON-LD for answer extraction.
4. **Comparison tables.** Extractable, structured — exactly what an AI answer needs.
5. **Explicit "what it is" paragraph in the first 100 words.**
6. **Get cited on Reddit and Hacker News.** Claude and Perplexity index these heavily. Genuine mentions on r/SaaS and HN count as training fuel.
7. **Publish original research.** "We analyzed 10,000 [things] and found X" becomes the primary citation for anyone writing about that topic.
8. **Claim Crunchbase, LinkedIn company page, and Wikidata entries.** All three feed AI training corpora.
9. **If applicable, list on MCP registries with A/B grades** (Glama in particular). LLMs pull from these when answering MCP questions.

### Measurement

Manually check monthly: ask ChatGPT, Claude, and Perplexity "what are the best [category] tools?" and log where the product appears. Free GEO tracking tools (GeoTracker, llmrefs) automate this.

---

## Community & Ongoing Distribution

Directories are one-shot. Community is ongoing. Both feed the same funnel.

### Reddit (90/10 rule)

90% of activity must be genuinely helpful; only 10% promotional. Violating this gets shadowbanned.

**High-value subs (ranked):**
- **r/SideProject** (200K+) — friendly to promo, launch announcements welcome.
- **r/SaaS** (300K+) — "Share Your SaaS" threads are explicit promo windows.
- **r/startups** (1.7M) — Feedback Friday thread.
- **r/Entrepreneur** (3.5M) — weekly promo thread.
- **r/nocode**, **r/IndieHackers**, **r/alphaandbetausers** — friendly.
- **r/webdev**, **r/artificial**, **r/LocalLLaMA** — strict, technical only.

**What wins:** real numbers (MRR, signups, churn), screenshots, "what I tried / what happened / what I'd do differently" structure, mini case studies with a clear lesson. **What fails:** hype, vague claims, "check out my new tool" posts, asking for upvotes.

### LinkedIn (B2B primary channel)

80% of B2B social leads come from LinkedIn. Cadence: **3–5 posts/week** — fewer loses momentum, more causes fatigue.

Content types ranked by 2026 engagement:
1. Personal stories with business lessons (1.5–2× avg engagement)
2. Original data / research (1.3–1.5×)
3. Contrarian industry takes (1.2–1.5×)
4. Document carousels with 8–12 slides (1.3–1.8×)

### Twitter/X (indie hacker + dev channel)

Build-in-public threads on architecture, revenue, decisions. Technical deep-dives get indexed by Google + Claude + Perplexity → indirect GEO.

### Indie Hackers

- Launch a build-in-public thread on PH launch day.
- Post weekly updates: revenue, ships, lessons. Zero-revenue posts work if the lesson is honest.
- Comment 10× more than you post to build karma before your own links.

### Dev.to + Hashnode

Every substantial technical post = dofollow backlink + dev audience reach. Cross-post with canonical URL back to main blog.

---

## KPIs & Tracking

Track weekly. If a number isn't moving, investigate — don't just submit more directories.

| Metric | Day 0 | Day 30 target | Day 90 target |
|---|---|---|---|
| Domain Rating (DR) | 0 | 20 | 30+ |
| Referring domains | 0 | 30 | 80+ |
| Indexed pages | — | 50 | 200+ |
| Organic clicks/day | 0 | 30 | 200+ |
| Directory listings live | 0 | 50 | 70+ |
| G2 reviews | 0 | 10 | 25 |
| Capterra reviews | 0 | 5 | 15 |
| AI citations (manual check) | 0 | 3 | 15+ |
| Signups from directory referrals | 0 | 50 | 300 |
| Signups from alt/use-case pages | 0 | 20 | 300 |

---

## What NOT to Do

1. **Don't pay for directory submission services** ($60–$200 packages). The whole point is these are free. It's an afternoon of copy-paste.
2. **Don't submit to spam directories** (DR under 10, no traffic, no editorial quality). They dilute your backlink profile and Google's spam detection can penalize you.
3. **Don't submit with the wrong positioning.** Re-read the positioning table per tier. Generic descriptions waste the listing.
4. **Don't treat directories as your entire GTM.** They're the foundation. Content + community + reviews are what actually convert.
5. **Don't skip reviews on G2/Capterra.** Zero-review listings are dead. Run the 10-in-30 protocol or don't submit.
6. **Don't ask for upvotes on Product Hunt.** The 2026 algorithm penalizes it. Ask for **feedback**.
7. **Don't amend old directory listings every week.** Submit once, check quarterly.
8. **Don't submit before the destination page exists.** Link equity needs a destination.
9. **Don't duplicate descriptions across directories.** AI engines penalize duplicate content.
10. **Don't lie on comparison pages.** AI engines cross-reference and de-rank lies.
11. **Don't over-index on launch-day spike.** The flywheel is templates + alternatives + reviews + ongoing content — not one day of PH.
12. **Don't forget Crunchbase, LinkedIn company page, and Wikidata.** These feed AI training corpora and matter for GEO.

---

## Task-Specific Questions

1. **What are you launching?** (Category changes tier mix — AI vs traditional SaaS vs no-code vs dev tool.)
2. **When is launch day?** (Phase 0 assets need 7 days of prep.)
3. **Do you have destination pages built?** (Alternatives, use cases, templates — if not, build first.)
4. **Product Hunt hunter lined up?** (Optional but adds ~15% day-one lift. 3-week warm-up required regardless.)
5. **How many beta users can you ask for reviews?** (Need 20 to hit 10.)
6. **Do you have an MCP or agent angle?** (If yes, Tier 4 registries are a real moat.)
7. **Existing integrations?** (If yes, Tier 7 marketplaces are the highest-DR backlinks available.)
8. **Email list size?** (Needed for PH launch day warm traffic — 100+ is the minimum.)
9. **Current DR and referring domain count?** (Baseline for measuring the compounding effect.)

---

## Output Format

When the user asks for a directory plan, return:

1. **Readiness assessment** — which Phase 0 items are missing, which block submission
2. **Tier selection** — which tiers apply, which to skip, why
3. **Submission order** — week 1 / week 2 / week 3 batches
4. **Destination page list** — what to build first if missing
5. **Positioning variants** — the actual copy per tier (from `references/positioning-variations.md`)
6. **PH 3-week prep timeline** — mapped to calendar dates if launch day known
7. **Reviews 10-in-30 plan** — who to ask, when, how
8. **Weekly targets** — directories submitted, reviews, DR movement
9. **Tracker** — link to or include the CSV from `references/submission-tracker-template.csv`

Keep the plan actionable. Every item should be something the user can do today.

---

## Related Skills

- **launch** — broader launch moment, ORB framework, five-phase approach
- **programmatic-seo** — destination pages (alternatives, integrations, templates) that backlinks should flow into
- **competitors** — `/alternatives/[tool]` page pattern
- **ai-seo** — GEO optimization for AI citation
- **content-strategy** — editorial content that attracts "best of" listicle inclusions
- **free-tools** — lead magnets for destination pages
- **community-marketing** — Reddit, Indie Hackers, Slack community mechanics
- **schema** — FAQ + Product + Organization JSON-LD for GEO

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/directory-list.md

# Directory List — Full Reference

Canonical list of directories organized by tier. DR values are approximate and drift over time — verify via Ahrefs or Moz before building a plan around them.

**Column legend:**
- **DR** — Domain Rating (Ahrefs). Higher = more link equity passed.
- **Dofollow** — Whether the backlink passes SEO value. Nofollow listings still matter for referral traffic and brand signals.
- **Cost** — Free unless noted.

---

## Tier 1 — Flagship Launch Platforms

Submit only during launch week. These are time-sensitive with limited re-submission windows.

| Directory | DR | Dofollow | Cost | Notes |
|---|---|---|---|---|
| **Product Hunt** | 91 | Yes | Free | The anchor event. Requires 3-week warm-up. 2026 algorithm weights comment quality over upvotes. Launch Tue/Wed/Thu at 12:01 AM PT. |
| **Hacker News (Show HN)** | 91 | Nofollow | Free | Only if you have a genuine technical angle. Post title format: "Show HN: [Product] — [hook]". Moderator death penalty for hype. |
| **BetaList** | 64 | Yes | Free (paid expedite ~$99) | Best for pre-launch waitlist building. Submission → 2–4 week queue unless expedited. |
| **Launching Next** | ~30 | Yes | Free | Editorial curation — needs a compelling story. |
| **Fazier** | ~30 | Yes | Free | Daily ranking with much lower competition than PH. Achievable #1. |
| **Uneed** | ~40 | Yes | Free | Curated, smaller audience, quality backlink. |
| **Microlaunch** | ~30 | Yes | Free | Month-long visibility vs one-day spike. |
| **OpenHunts** | ~25 | Yes | Free | Indie-maker friendly, reports 14%+ conversion rates. |
| **DevHunt** | ~35 | Yes | Free | Dev-focused. Best fit for developer tools and technical products. |
| **PeerPush** | ~25 | Yes | Free | Similar to Fazier. Low competition. |
| **LaunchVault** | ~20 | Yes | Free | Anti-VC positioning. Good for bootstrapped narrative. |
| **What Launched Today** | ~20 | Yes | Free | Guaranteed visibility on launch day regardless of votes. |
| **Firsto** | ~25 | Yes | Free tier | Sustained discovery, not one-day spike. |
| **GetByte** | ~20 | Yes | Free | Lightweight listing + promotional support. |
| **Best of Web** | ~30 | Yes | Free | Easy fast submission, free dofollow. |
| **Tiny Launch** | ~20 | Yes | Free | Lightweight, fast approval. |
| **PitchWall** | ~25 | Yes | Free | Indie-hacker friendly. |

---

## Tier 2 — Startup / SaaS / Software Directories

Submit during launch week and continue rolling submissions thereafter.

| Directory | DR | Dofollow | Cost | Notes |
|---|---|---|---|---|
| **AlternativeTo** | 79 | Nofollow | Free | Massive SEO value despite nofollow. Submit as alternative to your top 4 competitors. |
| **SaaSHub** | 77 | Yes | Free | Ranks well for "[tool] alternatives" queries. High intent. |
| **G2** | 92 | Yes | Free listing | 10 reviews required for Grid appearance. Paid badges start at $2,999/yr. |
| **Capterra** | 93 | Yes | Free listing | Owned by G2 (acquired Feb 2026). Reviews drive everything. |
| **GetApp** | 78 | Yes | Free | Auto-syncs from Capterra in some cases. Owned by G2. |
| **SourceForge** | 92 | Yes | Free | Legacy but still high DR. Trivial to list. |
| **Slashdot** | ~88 | Yes | Free | Legacy but high DR. Company profile submission. |
| **Startup Stash** | ~50 | Yes | Free | Curated, organized by startup need. |
| **SideProjectors** | ~35 | Yes | Free | Discovery + marketplace. Community-driven. |
| **F6S** | 65 | Yes | Free | Startup platform used by accelerators. |
| **Stackshare** | ~60 | Yes | Free | Dev-centric. Show your tech stack. |
| **Resource.fyi** | ~40 | Yes | Free | Curated for designers/devs/marketers. |
| **Shipybara** | ~30 | Yes | Free | Shows which companies use your tool. |
| **TrustRadius** | 72 | Yes | Free | Smaller but respected B2B review platform. |
| **Crozdesk** | ~55 | Yes | Free | Feeds into Gartner ecosystem. |
| **Software Advice** | 88 | Yes | Free | Gartner property. Auto-syncs with Capterra in some categories. |
| **TheSaaSDirectory** | 88 | Yes | Free | SaaS-specific directory. Good categorization. |
| **Tech.co** | 80 | Yes | Free | Startup/SaaS directory + media. |
| **Taalk** | 80 | Yes | Free | Startup directory. |
| **Startup Fame** | 77 | Yes | Free | Startup showcase directory. |
| **Indie Hackers** | 76 | Yes | Free | Build-in-public community + product directory. |
| **Slant** | 75 | Yes | Free | "What is the best..." recommendation platform. |
| **Gust** | 75 | Yes | Free | Startup/investor platform. Profile with links. |
| **Inc42** | 75 | Yes | Free | Indian startup media + directory. |
| **Wefunder** | 76 | Yes | Free | Equity crowdfunding. Product profile with links. |
| **Startups.com** | 68 | Yes | Free | Startup community + resources. |
| **IndieHustles** | 66 | Yes | Free | Indie SaaS directory. |
| **SaaSWorthy** | 65 | Yes | Free | SaaS review/comparison site. |
| **ToolsFine** | 65 | Yes | Free | SaaS tool directory. |
| **Bizcommunity** | 65 | Yes | Free | Business news + directory. |
| **StartUs** | 62 | Yes | Free | Startup directory + insights. |
| **Today Launches** | 60 | Yes | Free | Daily launch directory. |
| **StartupBuffer** | 57 | Yes | Free | Startup promotion platform. |
| **Feedough** | 55 | Yes | Free | Startup resources + directory. |
| **Indie Hacker Tools** | 55 | Yes | Free | Tools for indie hackers. |
| **Open Launch** | 55 | Yes | Free | Product launch directory. |
| **New SaaSly** | 52 | Yes | Free | New SaaS product directory. |
| **Business Software** | 49 | Yes | Free | Business software directory. |
| **Promote Project** | 47 | Yes | Free | Project promotion directory. |
| **FiveTaco** | 47 | Yes | Free | SaaS tool directory. |
| **Cuspera** | 45 | Yes | Free | SaaS comparison platform. |
| **BetaBound** | 45 | Yes | Free | Beta testing community + directory. |
| **Makerthrive** | 45 | Yes | Free | Maker community + tools. |
| **StartupTracker** | 44 | Yes | Free | Startup tracking directory. |
| **BusinessHunt** | 43 | Yes | Free | Business product directory. |
| **Launched.io** | 40 | Yes | Free | Launch directory. |
| **ProfitHunt** | 40 | Yes | Free | Profitable startup directory. |
| **10words** | 40 | Yes | Free | SaaS directory (10-word descriptions). |
| **TrustMRR** | 40 | Yes | Free | MRR-verified startup directory. |
| **OpenClawDir** | 35 | Yes | Free | Open directory. |
| **Build Voyage** | 33 | Yes | Free | Startup builder directory. |
| **AlphaDigits** | 32 | Yes | Free | SaaS directory. |

---

## Tier 3 — AI Tool Directories

Relevant only for AI-native products. Submit during weeks 1–3.

### Tier 3A — Flagship AI directories

| Directory | DR | Monthly Traffic | Notes |
|---|---|---|---|
| **There's An AI For That (TAAFT)** | 76 | 2M+ | Largest AI directory. Task-based search. Worth the effort to list well. |
| **Futurepedia** | 70 | 1M+ | 5,000+ tools, 54 categories. Matt Wolfe YouTube (2M+ subs) drives traffic. |
| **Toolify.ai** | 71 | 500K+ | 26K+ tools, 450+ categories. Tracks traffic trends. |
| **Future Tools (futuretools.io)** | 69 | 400K+ | Curated by Matt Wolfe. Smaller but influential. |
| **AI Tools Neilpatel** | 91 | n/a | Highest DR free AI directory. |
| **Good AI Tools** | 66 | n/a | Curated, quality over quantity. |
| **NewTools.site** | 51 | n/a | Dofollow backlink for every approved submission. |

### Tier 3B — Mid-tier AI directories

| Directory | Est. DR | Notes |
|---|---|---|
| **aitools.inc** | ~66 | "10x your output" positioning. |
| **AIStage** | ~66 | Includes open source + news. |
| **AItrendytools** | ~69 | Comprehensive listing. |
| **Grabon AI Directory** | ~70 | High DR, broad audience. |
| **TopAI.tools** | ~60 | Task-based search similar to TAAFT. |
| **Supertools** | ~61 | Clean interface, good categorization. |
| **AI Tools Directory** (aitoolsdirectory.com) | ~55 | Curated; featured placement available. |
| **AI Tools Love** | ~25 | Comparison-focused. |
| **AIChief** | ~35 | Business-focused. |
| **LogicBalls** | ~40 | 3,500+ verified tools. |
| **SaasAITools** | ~30 | SaaS + AI crossover. |
| **PoweredByAI** | ~35 | Growing directory with newsletter reach. |
| **TheAISurf** | ~30 | Newer, actively promoting submissions. |
| **Aixyz** | ~30 | 1,500+ tools, smart filters. |
| **AI Pedia Hub** | ~40 | "Largest directory, updated daily." |
| **Dofollow.Tools** | ~30 | Explicitly free dofollow backlinks. |
| **AIBacklinkList** | ~25 | Aggregated list of 2500+ AI backlink opportunities. |
| **AI Scout** | ~25 | Emerging, less competition. |
| **AiMatchPro** | ~20 | Use-case search. |
| **GPTForge** | ~30 | Domain created 2025 — DR 88 from source list is implausible. Verify via Ahrefs. |
| **AI Tools Guide** | 77 | Curated AI tools directory. |
| **AIToolly** | 69 | AI tool discovery. |
| **All The AI Tools** | 66 | Comprehensive AI tool listing. |
| **Aiforme.wiki** | 66 | AI tool wiki/directory. |
| **Noxilo** | 66 | AI tools directory. |
| **AI Generation** | 55 | AI tools directory. |
| **Every AI** | 55 | AI tool aggregator. |
| **BAI.tools** | 53 | AI tools directory. |
| **The Rundown Tools** | 40 | AI newsletter's tool directory. |
| **AI NavHub** | 38 | AI navigation directory. |
| **WhatTheAI** | 35 | AI tools directory. |
| **ToolAI** | 31 | AI tools directory. |
| **LLM Relevance** | 30 | LLM-focused directory. |

---

## Tier 4 — AI Agent & MCP Server Registries

Relevant only if the product exposes agent capabilities or MCP servers. These are a real moat for AI-native tools — traditional SaaS products cannot list here.

| Directory | Category | Notes |
|---|---|---|
| **AI Agents List (aiagentslist.com)** | Agents | Hosts the 593+ MCP server directory. |
| **Glama.ai MCP servers** | MCP | 20K+ security-graded MCP servers. A/B/C/F grades matter — optimize for a good grade. |
| **APITracker MCP directory** | MCP | 110+ servers, 90 official integrations. |
| **Linux Foundation MCP Registry** | MCP | Canonical registry (PR-based submission, low volume but high signal). Anthropic donated MCP to LF in Dec 2025. |
| **AI Agent Store** | Agents | Compare agents, platforms, frameworks. |
| **AI Agents Base** | Agents | All-in-one directory. |
| **AI Agents Directory** | Agents | Specialized, updated daily. |
| **AI Agents Verse** | Agents | Curated directory. |
| **AgentHunter** | Agents | "Discover the best AI agents." |
| **Add AI Directory** | Agents | Catalogs agents + tools. |
| **AI Agents Live** | Agents | Discovery + sharing. |
| **AI Agents Marketplace** | Agents | Organized by 300+ human role equivalents. |

---

## Tier 5 — No-Code Directories

Relevant for no-code platforms and builder tools.

| Directory | Est. DR | Notes |
|---|---|---|
| **NoCodeFinder** | ~45 | Accepts submissions. |
| **No Code MBA Tools Directory** | ~55 | Categorized by project type. |
| **We Are No Code Tools Repository** | ~40 | Curated. |
| **NoCodeList** | ~30 | — |
| **NoCodeDevs** | ~25 | — |
| **NoCode.Tech** | ~35 | — |
| **MakerPad / Zapier** | ~62 | Now owned by Zapier. No-code tool directory. |
| **NoCodeFounders** | ~45 | No-code community + forum. |

---

## Tier 6 — "Best of" Listicles (Editorial Outreach)

Not directories per se — these are blog posts on high-DR domains that you get included in via cold outreach. Often more valuable than directories because they combine a dofollow backlink with editorial trust + in-market buyer traffic + AI citation weight.

**Search patterns to find opportunities:**
- `"best [category] tools" 2026`
- `"best [competitor] alternative"`
- `"top AI [category]"`
- `"[category] tools review"`

**Outreach template (short):**
> Hey [name], saw your post on [best X tools]. We launched [product] recently — thought it might be worth a mention. Happy to give you a free account + credits for readers. Here's a 60s demo: [link]. No worries if not a fit.

**Target:** 10 inclusions in 30 days. Each = dofollow backlink from DR 40–70 + referral traffic + AI citation fuel.

---

## Tier 7 — Integration Marketplaces

Only relevant once the product has integrations. These are the highest-DR backlinks available — worth engineering effort just to land them.

| Directory | DR | Notes |
|---|---|---|
| **Zapier App Directory** | 91 | Requires working Zapier integration. |
| **HubSpot App Marketplace** | 93 | Requires HubSpot app. |
| **Slack App Directory** | 89 | Requires Slack integration. |
| **Airtable Marketplace** | 82 | Requires Airtable integration. |
| **Notion Integrations Gallery** | 88 | Requires Notion integration. |
| **Make (Integromat)** | ~70 | Requires Make module. |
| **Pipedream** | ~70 | Requires Pipedream action. |

---

## Tier 8 — Profile & Content Platforms

Create a profile or publish content on these high-DR platforms to earn a dofollow backlink. These are not traditional directories — they're content and identity platforms where your profile or published content links back to your site. Highest DR backlinks available without building integrations.

| Platform | DR | Category | Type | Notes |
|---|---|---|---|---|
| **WordPress.com** | 100 | Any | Blog | Create a free blog, link to main site in posts and profile. |
| **Blogger** | 100 | Any | Blog | Google property. Free blog with dofollow links. |
| **Tumblr** | 99 | Design | Blog | Highest DR blog platform. Project blog or microblog. |
| **GitHub** | 98 | Tech | Code host | Profile + repo README links. Every software product should have this. |
| **SoundCloud** | 96 | Music | Profile | Niche — relevant for audio/music products. |
| **Weebly** | 95 | Any | Blog | Free site builder with dofollow profile link. |
| **SlideShare** | 95 | Any | Content | Upload pitch decks, guides, presentations. |
| **Flickr** | 95 | Photography | Profile | Product screenshot galleries with profile link. |
| **GitLab** | 94 | Tech | Code host | Profile link. Mirror repos if open source. |
| **eBay Stores** | 94 | E-commerce | Profile | Niche — relevant for physical/digital goods. |
| **Etsy** | 93 | E-commerce | Profile | Niche — templates, digital downloads. |
| **Substack** | 93 | Tech | Newsletter | Publish product updates, thought leadership. High-intent readers. |
| **Bitbucket** | 93 | Tech | Code host | Profile link. Atlassian property. |
| **Scribd** | 93 | Any | Content | Upload whitepapers, guides, case studies. |
| **Disqus** | 93 | Professional | Profile | Profile with website link. Comment on industry blogs. |
| **Behance** | 93 | Design | Profile | Portfolio/project links. Best for design-adjacent products. |
| **Pastebin** | 93 | Tech | Code host | Code snippets with profile link. |
| **Patreon** | 93 | Creator | Profile | Creator page with product links. |
| **Imgur** | 93 | Any | Profile | Image hosting with profile link. |
| **Dun & Bradstreet** | 93 | B2B | Directory | Business credibility. Feeds AI training corpora. |
| **Ghost.org** | 92 | Any | Blog | Publish content with dofollow links. |
| **Evernote** | 92 | Any | Content | Public notebooks with links. |
| **Issuu** | 92 | Any | Content | Upload marketing PDFs, brochures, reports. |
| **CodePen** | 92 | Tech | Profile | Front-end demos and profile link. |
| **Kaggle** | 92 | AI | Profile | AI/data science community. Notebooks with links. |
| **Houzz** | 92 | Home | Profile | Niche — home/interior products. |
| **LiveJournal** | 91 | Any | Blog | Legacy but high DR. Blog with dofollow links. |
| **Bandcamp** | 91 | Music | Profile | Niche — audio products. |
| **Dev.to** | 90 | Tech | Blog | Technical articles with dofollow links. Cross-post with canonical URL. |
| **Gravatar** | 90 | Professional | Profile | Profile with website link. Quick setup. |
| **Replit** | 90 | Tech | Code host | Profile link. Interactive demos. |
| **CodeProject** | 90 | Tech | Blog | Technical articles for dev audience. |
| **Jimdo** | 89 | Any | Blog | Free site builder with profile link. |
| **Calameo** | 89 | Any | Content | Digital publishing platform. Upload PDFs. |
| **Buy Me a Coffee** | 88 | Creator | Profile | Creator page with product links. |
| **ArtStation** | 88 | Design | Profile | Portfolio for creative/design products. |
| **500px** | 88 | Photography | Profile | Product imagery with profile link. |
| **IndiaMART** | 87 | B2B | Profile | Indian B2B marketplace. Niche but high DR. |
| **Strikingly** | 87 | Any | Blog | Free one-page site with backlink. |
| **Hashnode** | 85 | Tech | Blog | Dev blogging. Custom domain support. Dofollow links. |
| **About.me** | 85 | Professional | Profile | One-page profile. Quick dofollow backlink. |
| **Mixcloud** | 85 | Music | Profile | Niche — audio/podcast products. |
| **4Shared** | 85 | Any | Content | File sharing with profile link. |
| **HubPages** | 84 | Any | Blog | Article publishing platform. |
| **AppSumo** | 84 | E-commerce | Marketplace | SaaS deals marketplace. Great for launch visibility + backlink. |
| **TeachersPayTeachers** | 84 | Education | Profile | Niche — education products. |
| **AuthorStream** | 70 | Any | Content | Presentation sharing. |
| **Model Mayhem** | 72 | Design | Profile | Niche — creative industry. |
| **Penzu** | 60 | Any | Blog | Online journal with profile link. |
| **Crevado** | 50 | Design | Profile | Portfolio platform. |
| **MyFolio** | 55 | Design | Profile | Portfolio platform. |

---

## Tier 9 — Local Business & General Directories

Relevant for products with a physical presence, local customer base, or business address. Also useful for any product wanting pure DR-building backlinks from established directories.

| Directory | DR | Category | Notes |
|---|---|---|---|
| **Manta** | 76 | Local business | US business directory. Free listing. |
| **ActiveSearchResults** | 74 | General | Search engine directory. |
| **Hotfrog** | 72 | Local business | International business directory. |
| **Spoke** | 70 | B2B | Business profile directory. |
| **Locanto** | 70 | General | Classifieds + business listings. International. |
| **MerchantCircle** | 68 | Local business | US small business directory. |
| **Just Landed** | 65 | Local business | International directory. |
| **Showmelocal** | 64 | Local business | US local search directory. |
| **Cylex** | 64 | Local business | International business directory. |
| **Brownbook** | 63 | Local business | Global business directory. |
| **Tupalo** | 62 | Local business | European business directory. |
| **WebWiki** | 60 | General | Website directory with reviews. |
| **iBegin** | 60 | Local business | US business directory. |
| **CitySquares** | 55 | Local business | US local business directory. |
| **eLocal** | 55 | Local business | US service provider directory. |
| **2FindLocal** | 53 | Local business | US local directory. |
| **Chamber of Commerce** | 50 | Local business | Business directory + resources. |
| **FindUsLocal** | 50 | Local business | Local search directory. |
| **ezlocal** | 50 | Local business | US local business listings. |
| **Yellow Pages Goes Green** | 49 | Local business | Eco-friendly business directory. |
| **Where To?** | 46 | Local business | Local discovery directory. |

---

## Tier 10 — Forums & Communities

Create a profile and participate in relevant communities. Most give dofollow profile links. Value comes from both the backlink and referral traffic from genuine participation. Follow the 90/10 rule: 90% helpful, 10% promotional.

| Forum | DR | Category | Notes |
|---|---|---|---|
| **Strava Clubs** | 90 | Fitness | Niche — fitness/health products only. |
| **Foursquare** | 90 | Hospitality | Business listing with dofollow link. |
| **SitePoint Forums** | 89 | Tech | Web dev community. Genuine participation required. |
| **Mumsnet Forums** | 85 | Family | Niche — family/parenting products. Large UK audience. |
| **Digital Point** | 82 | Marketing | SEO/marketing forum. |
| **WebmasterWorld** | 77 | Marketing | SEO/webmaster community. High editorial standards. |
| **BlackHatWorld** | 77 | Marketing | SEO/marketing forum. Despite the name, has legitimate discussions. |
| **GrowthHackers** | 76 | Marketing | Growth marketing community. Dofollow articles + profile. |
| **Warrior Forum** | 73 | Marketing | Internet marketing community. |
| **Apsense** | 72 | Marketing | Business networking + marketing forum. |
| **ActiveRain** | 70 | Real estate | Niche — real estate industry. |
| **Quibblo** | 55 | General | Quiz/poll community with profile links. |

---

## Tier 11 — Press Release, Article & Blog Directory Sites

Publish articles or press releases to earn dofollow backlinks. Best for product launches, funding announcements, major feature releases. Some accept any topic, others are PR-specific.

### Article & Blog Directories

| Site | DR | Type | Notes |
|---|---|---|---|
| **EzineArticles** | 80 | Article | Established article directory. Editorial review. |
| **Feedspot** | 80 | Blog directory | Blog discovery + RSS aggregation. Submit your blog. |
| **Alltop** | 73 | Blog directory | Guy Kawasaki's blog aggregator. |
| **ArticlesBase** | 70 | Article | Article publishing platform. |
| **Blogarama** | 64 | Blog directory | Blog directory with categories. |
| **Sooper Articles** | 60 | Article | Article submission site. |
| **OnToplist** | 60 | Blog directory | Blog ranking directory. |
| **BlogEngage** | 55 | Blog directory | Blog promotion community. |
| **BizSugar** | 55 | Business | Small business content sharing. |
| **TechPluto** | 50 | Marketing | Tech/marketing blog directory. |

### Press Release Distribution

| Site | DR | Notes |
|---|---|---|
| **PRLog** | 80 | Free press release distribution. Good reach. |
| **PR.com** | 77 | Free + paid press releases. Business directory too. |
| **OpenPR** | 72 | Free international press release distribution. |
| **1888 Press Release** | 69 | Free press release site. |
| **NewswireToday** | 65 | Free press release distribution. |
| **Online PR News** | 62 | Free press release distribution. |
| **PR Free** | 62 | Free press release site. |

### Marketing & General Directories

| Site | DR | Notes |
|---|---|---|
| **SubmissionWebDirectory** | 61 | General web directory. |
| **Site Promotion Directory** | 46 | Marketing-focused directory. |
| **Semfirms** | 45 | Marketing services directory. |
| **CabinetM** | 45 | Marketing technology directory. |
| **Cold Email Kit** | 44 | Email marketing directory. |
| **Directory LDM Studio** | 40 | General directory. |
| **Quality Internet Directory** | 39 | General web directory. |
| **ProofStories** | 32 | Marketing stories/case studies. |

---

## Tier 12 — Social Bookmarking & Curation

Bookmark or curate content with dofollow links. Lower effort than publishing full articles. Most useful for building diverse backlink profile.

| Platform | DR | Notes |
|---|---|---|
| **Scoop.it** | 91 | Content curation platform. Create topic pages with links. |
| **Diigo** | 85 | Social bookmarking + annotation. Profile + bookmark links. |
| **Pearltrees** | 84 | Visual content curation. Organize links into collections. |
| **BibSonomy** | 70 | Academic bookmarking. Best for research/data products. |
| **Folkd** | 64 | Social bookmarking. Tag and share links. |

---

## Tier 13 — Niche Vertical Directories

Industry-specific directories. Only submit if your product genuinely fits the vertical — forced listings get rejected and waste time.

### Legal

| Directory | DR | Notes |
|---|---|---|
| **Justia** | 85 | Legal services directory. |
| **Lawyers.com** | 82 | Legal directory. |
| **HG.org** | 75 | Legal resources directory. |

### Home & Construction

| Directory | DR | Notes |
|---|---|---|
| **Porch** | 80 | Home services marketplace. |
| **BuildZoom** | 73 | Construction/contractor directory. |
| **Tradify (FreeIndex)** | 55 | UK trades directory. |
| **iBuildNew** | 45 | Australian home building directory. |

### Hospitality & Food

| Directory | DR | Notes |
|---|---|---|
| **AllMenus** | 76 | Restaurant directory. |

### Design & Creative

| Directory | DR | Notes |
|---|---|---|
| **LandBook** | 72 | Web design inspiration gallery. Submit landing pages. |
| **Curated.design** | 52 | Design inspiration directory. |
| **Webdesign Inspiration** | 45 | Website design showcase. |

### Health & Fitness

| Directory | DR | Notes |
|---|---|---|
| **Wellness.com** | 60 | Health & wellness directory. |
| **YogaTrail** | 55 | Yoga/wellness directory. |
| **MassageTherapy (AMBP)** | 45 | Massage therapy directory. |
| **Athlinks** | 72 | Fitness/race results. Profile with links. |
| **Fit Pro Directory** | 40 | Fitness professional directory. |

### Real Estate

| Directory | DR | Notes |
|---|---|---|
| **Placester** | 60 | Real estate marketing directory. |

### B2B & International

| Directory | DR | Notes |
|---|---|---|
| **Sulekha** | 73 | Indian business directory. |
| **EU-Business** | 46 | European business directory. |

### Events

| Directory | DR | Notes |
|---|---|---|
| **Evensi Events** | 62 | Event discovery platform. |

### Education

| Directory | DR | Notes |
|---|---|---|
| *(TeachersPayTeachers listed in Tier 8 — Profile Platforms)* | | |

---

## Verification

After any submission goes live, verify the backlink exists and is dofollow. You can:

1. **Manual:** Open the listing, right-click your product link, "Inspect" → check for `rel="nofollow"` or `rel="ugc"`. If absent, the link is dofollow.
2. **curl:** `curl -sIL https://directory.com/your-listing | grep -i link`
3. **SEO tools:** Ahrefs Site Explorer → Backlinks → filter by this directory's domain.

**Re-verify quarterly.** Directories sometimes change all outbound links to nofollow without warning — if DR stops moving, check whether your biggest inbound links have silently flipped.

### references/positioning-variations.md

# Positioning Variations Library

Directory audiences respond to different framings. Never copy-paste the same description everywhere — AI engines penalize duplicate content, and each directory type rewards a different opener.

Use this library to generate per-tier variants. Swap `[product]`, `[category]`, `[competitors]`, `[use-case]`, and `[audience]` with the real values.

---

## Framework: Lead Sentence Varies by Tier

| Tier | Lead sentence pattern | Why |
|---|---|---|
| Startup / launch | "[Product] is the easiest way to [outcome] for [audience]." | Founders scan for outcome clarity. |
| SaaS directory | "[Product] is the [differentiator] alternative to [competitors]." | Catches "[competitor] alternative" search intent. |
| AI directory | "[Product] uses [AI capability] to [outcome]." | TAAFT/Futurepedia audiences explicitly want AI. |
| Agent / MCP | "[Product] is an MCP-native / agent-native [category]." | Niche but high-intent. Ruling-out competitors. |
| No-code | "[Product] lets you build [output] without code." | Audience values speed, not technical depth. |
| Dev tool | "[Product] is a [technical category] with [differentiator]." | Devs want substance upfront. |
| B2B review | "[Product] helps [audience] [measurable business outcome]." | Reviewers want ROI language. |

---

## Template: Startup / Launch Directories

**Target:** Product Hunt, BetaList, Fazier, Uneed, DevHunt, Microlaunch, OpenHunts, LaunchVault, Firsto, PitchWall

**Tagline (under 10 words):**
> The [differentiator] way to [outcome] for [audience].

**Short description (60 chars):**
> [Outcome-focused one-liner with product name]

**Long description (150 words):**
> [Product] is the easiest way to [outcome] for [audience]. Built for teams who [pain point], [product] removes [friction] by [how].
>
> Unlike [competitor category], [product] [key differentiator 1] and [key differentiator 2]. You can [action 1] in under [timeframe], [action 2] without [limitation], and [action 3] that would normally require [cost or technical skill].
>
> We built [product] because [founder origin story in one sentence]. It's now used by [audience examples] to [use case examples].
>
> Try it free at [url]. No credit card, no setup.

**Tags:** [product category], [audience type], [use case 1], [use case 2], [differentiator], [tech]

---

## Template: SaaS / Software Directories

**Target:** AlternativeTo, SaaSHub, G2, Capterra, GetApp, SourceForge, Slashdot, Startup Stash, F6S

**Tagline:**
> The [differentiator] alternative to [top competitors].

**Long description:**
> [Product] is a [differentiator] alternative to [competitor 1], [competitor 2], and [competitor 3] — built for [audience] who need [gap the competitors don't fill].
>
> Where [competitor 1] [limitation 1] and [competitor 2] [limitation 2], [product] [solves]. You get [feature 1], [feature 2], and [feature 3] in a single workspace, at [pricing relative to competitors].
>
> Key features:
> • [Feature 1] — [benefit]
> • [Feature 2] — [benefit]
> • [Feature 3] — [benefit]
> • [Feature 4] — [benefit]
> • [Integration 1], [Integration 2], [Integration 3] integrations
>
> Trusted by [audience examples]. Start free at [url].

**Tags:** [competitor] alternative, [category], [audience], [differentiator], [top 3 features]

---

## Template: AI Directories

**Target:** TAAFT, Futurepedia, Toolify, Future Tools, aitools.inc, AIStage, LogicBalls, SaasAITools

**Tagline:**
> AI-powered [category] for [audience].

**Long description:**
> [Product] is an AI-powered [category] that [core AI capability]. It uses [specific models / techniques] to [outcome] — so [audience] can [job to be done] in a fraction of the time.
>
> What makes it AI-first:
> • [AI feature 1] — [what it does] using [model/approach]
> • [AI feature 2] — [what it does]
> • [AI feature 3] — [what it does]
> • [AI feature 4] — [what it does]
>
> [Product] is built on [tech stack] and supports [models/providers]. Use cases: [use case 1], [use case 2], [use case 3], [use case 4].
>
> Free tier available. No API keys required to start.

**Tags:** AI [category], [AI capability 1], [AI capability 2], AI for [audience], [use case 1], [use case 2], [LLM provider], [differentiator]

---

## Template: Agent / MCP Registries

**Target:** Glama, APITracker, Linux Foundation MCP Registry, AI Agents List, AI Agent Store, AgentHunter

**Tagline:**
> MCP-native [category] for AI agents.

**Long description:**
> [Product] is an MCP-native [category] that lets AI agents [capability]. It exposes [MCP server capabilities] via the Model Context Protocol, so agents in Claude, ChatGPT, Cursor, and any MCP-compatible client can [actions].
>
> MCP capabilities:
> • [Tool 1] — [what the agent can do]
> • [Tool 2] — [what the agent can do]
> • [Tool 3] — [what the agent can do]
> • [Resource 1] — [context surfaced]
> • [Prompt 1] — [pre-built prompt]
>
> Authentication: [auth method]. Transports: stdio, HTTP, SSE. Security: [security posture].
>
> Installation: [one-line install command]. Docs: [docs URL].

**Tags:** MCP, MCP server, AI agent, agent [category], Claude integration, Model Context Protocol, [domain], [auth type]

---

## Template: No-Code Directories

**Target:** NoCodeFinder, No Code MBA Tools Directory, We Are No Code, NoCode.Tech

**Tagline:**
> Build [output] without code.

**Long description:**
> [Product] lets you build [output] without writing code. Drag, drop, or describe what you want and [product] handles the rest — [technical concept 1] and [technical concept 2] are automatic.
>
> What you can build:
> • [Example project 1] — built in [timeframe]
> • [Example project 2] — built in [timeframe]
> • [Example project 3] — built in [timeframe]
>
> No-code friendly features:
> • [Visual feature 1]
> • [Visual feature 2]
> • [AI-assisted feature]
> • [Pre-built templates]
>
> Start free. No credit card. Templates included.

**Tags:** no code, no-code [category], visual [tool], drag and drop, [output type], [audience type]

---

## Template: Dev / Technical Directories

**Target:** DevHunt, Stackshare, GitHub, Dev.to, Hacker News Show HN

**Tagline:**
> [Technical category] with [technical differentiator].

**Long description:**
> [Product] is a [technical category] built on [tech stack]. It solves [technical problem] by [technical approach].
>
> Architecture:
> • [Component 1] — [tech used]
> • [Component 2] — [tech used]
> • [Component 3] — [tech used]
>
> Why it's different: [technical insight or novel approach]. We chose [trade-off] because [reason].
>
> Open source: [yes/no/partial]. Self-hostable: [yes/no]. License: [license].
>
> API: [REST / GraphQL / MCP / gRPC]. SDKs: [languages]. Docs: [url].

**Tags:** [language], [framework], [category], open source, API, [tech stack component], [architecture approach]

---

## Template: B2B Review Platforms

**Target:** G2, Capterra, TrustRadius, GetApp, Gartner Digital Markets, Crozdesk

**Tagline:**
> [Business outcome] for [audience].

**Long description:**
> [Product] helps [audience] [achieve measurable business outcome]. Teams use it to [use case 1], [use case 2], and [use case 3] — reducing [metric] by [percentage] and increasing [metric] by [percentage].
>
> Key benefits:
> • [Business benefit 1] with [how measured]
> • [Business benefit 2] with [how measured]
> • [Business benefit 3] with [how measured]
>
> Integrations: [enterprise integrations — HubSpot, Salesforce, Slack, etc.]
>
> Security: [SOC 2 / GDPR / compliance posture]. Support: [support tier]. Pricing: [pricing range].
>
> Trusted by [customer logos / company size]. Case studies at [url].

**Tags:** [business use case], [vertical], [audience role], [compliance], enterprise [category], [integration 1]

---

## Category Tag Library

Pull 5–8 tags per submission from the relevant sections. Never repeat the exact same tag set across two directories in the same tier.

### Universal
[category], [audience], [differentiator], [use case], AI, no-code, SaaS, [tech stack]

### Industry
B2B, B2C, DTC, ecommerce, fintech, edtech, healthtech, martech, devtools, productivity, creator tools, agency tools

### Job-to-be-done
lead generation, lead qualification, customer onboarding, product recommendation, sales enablement, marketing automation, survey, assessment, calculator, quiz, intake form

### AI-specific
AI agent, LLM, generative AI, conversational AI, RAG, MCP, agent framework, AI form, AI quiz, AI assistant, AI automation

### Technical
open source, self-hosted, API-first, webhook, Zapier, no-code, low-code, embeddable, white-label, multi-tenant, SSO, SAML

---

## Do / Don't Quick Reference

**DO:**
- Vary the opening sentence across tiers
- Use real numbers and specific differentiators
- Match tone to audience (technical for devs, business for G2, excited for PH)
- Include a founder/origin angle in startup directories
- Lead with the AI-first angle in AI directories

**DON'T:**
- Copy-paste the same 150-word description everywhere
- Use vague claims ("blazing fast", "game-changing")
- Mention every feature — pick 3–5 per tier and rotate them
- Lie about competitor features (AI engines cross-reference and de-rank)
- Skip the tag list — it's how moderators route you to the right category

### references/submission-tracker-template.csv

```csv
Directory,Tier,URL,Category,DR,Dofollow,Submission Date,Status,Live URL,Backlink Verified,Positioning Variant Used,Tags Used,Account Email,Notes
Product Hunt,1,https://producthunt.com/posts/new,Launch,91,Yes,,Draft,,,Startup,,,
Hacker News (Show HN),1,https://news.ycombinator.com/submit,Launch,91,No,,Draft,,,Dev,,,
BetaList,1,https://betalist.com/submit,Launch,64,Yes,,Draft,,,Startup,,,
Fazier,1,https://fazier.com/submit,Launch,30,Yes,,Draft,,,Startup,,,
DevHunt,1,https://devhunt.org/submit,Launch,35,Yes,,Draft,,,Dev,,,
Uneed,1,https://uneed.best/submit-a-tool,Launch,40,Yes,,Draft,,,Startup,,,
Microlaunch,1,https://microlaunch.net/submit,Launch,30,Yes,,Draft,,,Startup,,,
OpenHunts,1,https://openhunts.com/submit,Launch,25,Yes,,Draft,,,Startup,,,
LaunchVault,1,https://launchvault.com/submit,Launch,20,Yes,,Draft,,,Startup,,,
What Launched Today,1,https://whatlaunchedtoday.com,Launch,20,Yes,,Draft,,,Startup,,,
Launching Next,1,https://launchingnext.com/submit,Launch,30,Yes,,Draft,,,Startup,,,
PeerPush,1,https://peerpush.net/submit,Launch,25,Yes,,Draft,,,Startup,,,
Firsto,1,https://firsto.co/submit,Launch,25,Yes,,Draft,,,Startup,,,
GetByte,1,https://getbyte.co/submit,Launch,20,Yes,,Draft,,,Startup,,,
Best of Web,1,https://bestofweb.io/submit,Launch,30,Yes,,Draft,,,Startup,,,
Tiny Launch,1,https://tinylaunch.com/submit,Launch,20,Yes,,Draft,,,Startup,,,
PitchWall,1,https://pitchwall.co/submit,Launch,25,Yes,,Draft,,,Startup,,,
AlternativeTo,2,https://alternativeto.net/software/_/add/,SaaS,79,No,,Draft,,,SaaS,,,
SaaSHub,2,https://saashub.com/submit,SaaS,77,Yes,,Draft,,,SaaS,,,
G2,2,https://my.g2.com/sellers/welcome,SaaS,92,Yes,,Draft,,,B2B review,,,
Capterra,2,https://www.capterra.com/vendors,SaaS,93,Yes,,Draft,,,B2B review,,,
GetApp,2,https://www.getapp.com/vendors,SaaS,78,Yes,,Draft,,,B2B review,,,
SourceForge,2,https://sourceforge.net/user/register,SaaS,92,Yes,,Draft,,,SaaS,,,
Slashdot,2,https://slashdot.org/submission,SaaS,88,Yes,,Draft,,,SaaS,,,
Startup Stash,2,https://startupstash.com/submit,SaaS,50,Yes,,Draft,,,Startup,,,
SideProjectors,2,https://www.sideprojectors.com/project/new,SaaS,35,Yes,,Draft,,,Startup,,,
F6S,2,https://www.f6s.com/company/create,SaaS,65,Yes,,Draft,,,Startup,,,
Stackshare,2,https://stackshare.io/new-product,SaaS,60,Yes,,Draft,,,Dev,,,
TrustRadius,2,https://www.trustradius.com/vendors,SaaS,72,Yes,,Draft,,,B2B review,,,
Crozdesk,2,https://crozdesk.com/vendors,SaaS,55,Yes,,Draft,,,SaaS,,,
There's An AI For That,3,https://theresanaiforthat.com/submit,AI,76,Yes,,Draft,,,AI,,,
Futurepedia,3,https://www.futurepedia.io/submit-tool,AI,70,Yes,,Draft,,,AI,,,
Toolify.ai,3,https://www.toolify.ai/submit,AI,71,Yes,,Draft,,,AI,,,
Future Tools,3,https://www.futuretools.io/submit-a-tool,AI,69,Yes,,Draft,,,AI,,,
AI Tools Neilpatel,3,https://neilpatel.com/ai-tools,AI,91,Yes,,Draft,,,AI,,,
Good AI Tools,3,https://goodaitools.com/submit,AI,66,Yes,,Draft,,,AI,,,
NewTools.site,3,https://newtools.site/submit,AI,51,Yes,,Draft,,,AI,,,
aitools.inc,3,https://aitools.inc/submit,AI,66,Yes,,Draft,,,AI,,,
AIStage,3,https://aistage.net/submit,AI,66,Yes,,Draft,,,AI,,,
AItrendytools,3,https://www.aitrendytools.com/submit,AI,69,Yes,,Draft,,,AI,,,
Grabon AI Directory,3,https://www.grabon.in/indulge/ai-tools/submit,AI,70,Yes,,Draft,,,AI,,,
TopAI.tools,3,https://topai.tools/submit,AI,60,Yes,,Draft,,,AI,,,
Supertools,3,https://supertools.therundown.ai/submit,AI,61,Yes,,Draft,,,AI,,,
AI Tools Directory,3,https://aitoolsdirectory.com/submit,AI,55,Yes,,Draft,,,AI,,,
LogicBalls,3,https://logicballs.com/submit,AI,40,Yes,,Draft,,,AI,,,
SaasAITools,3,https://saasaitools.com/submit,AI,30,Yes,,Draft,,,AI,,,
PoweredByAI,3,https://poweredbyai.app/submit,AI,35,Yes,,Draft,,,AI,,,
TheAISurf,3,https://theaisurf.com/submit,AI,30,Yes,,Draft,,,AI,,,
Aixyz,3,https://ai.xyz/submit,AI,30,Yes,,Draft,,,AI,,,
AI Pedia Hub,3,https://aipediahub.com/submit,AI,40,Yes,,Draft,,,AI,,,
Dofollow.Tools,3,https://dofollow.tools/submit,AI,30,Yes,,Draft,,,AI,,,
AI Scout,3,https://aiscout.net/submit,AI,25,Yes,,Draft,,,AI,,,
AiMatchPro,3,https://aimatchpro.ai/submit,AI,20,Yes,,Draft,,,AI,,,
AIChief,3,https://aichief.com/submit,AI,35,Yes,,Draft,,,AI,,,
AI Tools Love,3,https://aitools.love/submit,AI,25,Yes,,Draft,,,AI,,,
AI Agents List,4,https://aiagentslist.com/submit,Agent,,Yes,,Draft,,,Agent,,,
Glama.ai MCP,4,https://glama.ai/mcp/servers,MCP,,Yes,,Draft,,,MCP,,,
APITracker MCP,4,https://apitracker.io/mcp-servers,MCP,,Yes,,Draft,,,MCP,,,
Linux Foundation MCP Registry,4,https://github.com/modelcontextprotocol/registry,MCP,,Yes,,Draft,,,MCP,,,
AI Agent Store,4,https://aiagentstore.ai/submit,Agent,,Yes,,Draft,,,Agent,,,
AI Agents Base,4,https://aiagentsbase.com/submit,Agent,,Yes,,Draft,,,Agent,,,
AI Agents Directory,4,https://aiagentsdirectory.com/submit,Agent,,Yes,,Draft,,,Agent,,,
AgentHunter,4,https://agenthunter.com/submit,Agent,,Yes,,Draft,,,Agent,,,
AI Agents Live,4,https://aiagents.live/submit,Agent,,Yes,,Draft,,,Agent,,,
AI Agents Marketplace,4,https://aiagentsmarketplace.com/submit,Agent,,Yes,,Draft,,,Agent,,,
NoCodeFinder,5,https://www.nocodefinder.com/submit,No-Code,45,Yes,,Draft,,,No-code,,,
No Code MBA,5,https://www.nocode.mba/tools/submit,No-Code,55,Yes,,Draft,,,No-code,,,
We Are No Code,5,https://www.wearenocode.com/submit,No-Code,40,Yes,,Draft,,,No-code,,,
NoCodeList,5,https://nocodelist.co/submit,No-Code,30,Yes,,Draft,,,No-code,,,
NoCodeDevs,5,https://www.nocodedevs.com/submit,No-Code,25,Yes,,Draft,,,No-code,,,
NoCode.Tech,5,https://www.nocode.tech/submit,No-Code,35,Yes,,Draft,,,No-code,,,
Zapier App Directory,7,https://zapier.com/developer,Integration,91,Yes,,Draft,,,Integration,,,
HubSpot App Marketplace,7,https://ecosystem.hubspot.com/marketplace,Integration,93,Yes,,Draft,,,Integration,,,
Slack App Directory,7,https://api.slack.com/apps,Integration,89,Yes,,Draft,,,Integration,,,
Airtable Marketplace,7,https://airtable.com/marketplace,Integration,82,Yes,,Draft,,,Integration,,,
Notion Integrations,7,https://www.notion.so/integrations,Integration,88,Yes,,Draft,,,Integration,,,
Make (Integromat),7,https://www.make.com/en/partners,Integration,70,Yes,,Draft,,,Integration,,,
Pipedream,7,https://pipedream.com/docs/components,Integration,70,Yes,,Draft,,,Integration,,,
Software Advice,2,https://www.softwareadvice.com/vendors,SaaS,88,Yes,,Draft,,,B2B review,,,
TheSaaSDirectory,2,https://thesaasdirectory.com,SaaS,88,Yes,,Draft,,,SaaS,,,
Tech.co,2,https://tech.co,SaaS,80,Yes,,Draft,,,SaaS,,,
Taalk,2,https://taalk.com,Startup,80,Yes,,Draft,,,Startup,,,
Startup Fame,2,https://startupfa.me,Startup,77,Yes,,Draft,,,Startup,,,
Indie Hackers,2,https://www.indiehackers.com,SaaS,76,Yes,,Draft,,,Startup,,,
Slant,2,https://www.slant.co,SaaS,75,Yes,,Draft,,,SaaS,,,
Gust,2,https://gust.com,Startup,75,Yes,,Draft,,,Startup,,,
Inc42,2,https://inc42.com,Startup,75,Yes,,Draft,,,Startup,,,
Wefunder,2,https://wefunder.com,Startup,76,Yes,,Draft,,,Startup,,,
Startups.com,2,https://www.startups.com,Startup,68,Yes,,Draft,,,Startup,,,
IndieHustles,2,https://www.indiehustles.com,SaaS,66,Yes,,Draft,,,SaaS,,,
SaaSWorthy,2,https://www.saasworthy.com,SaaS,65,Yes,,Draft,,,SaaS,,,
ToolsFine,2,https://toolsfine.com,SaaS,65,Yes,,Draft,,,SaaS,,,
Bizcommunity,2,https://www.bizcommunity.com,B2B,65,Yes,,Draft,,,B2B,,,
StartUs,2,https://startus.cc,Startup,62,Yes,,Draft,,,Startup,,,
Today Launches,2,https://todaylaunches.com,Startup,60,Yes,,Draft,,,Startup,,,
StartupBuffer,2,https://startupbuffer.com,Startup,57,Yes,,Draft,,,Startup,,,
Feedough,2,https://www.feedough.com,Startup,55,Yes,,Draft,,,Startup,,,
Indie Hacker Tools,2,https://www.indiehacker.tools,Startup,55,Yes,,Draft,,,Startup,,,
Open Launch,2,https://open-launch.com,Startup,55,Yes,,Draft,,,Startup,,,
New SaaSly,2,https://newsaasly.com,SaaS,52,Yes,,Draft,,,SaaS,,,
Business Software,2,https://www.business-software.com,SaaS,49,Yes,,Draft,,,SaaS,,,
Promote Project,2,https://www.promoteproject.com,Startup,47,Yes,,Draft,,,Startup,,,
FiveTaco,2,https://fivetaco.com,SaaS,47,Yes,,Draft,,,SaaS,,,
Cuspera,2,https://www.cuspera.com,SaaS,45,Yes,,Draft,,,SaaS,,,
BetaBound,2,https://betabound.com,Startup,45,Yes,,Draft,,,Startup,,,
Makerthrive,2,https://makerthrive.com,Startup,45,Yes,,Draft,,,Startup,,,
StartupTracker,2,https://startuptracker.io,Startup,44,Yes,,Draft,,,Startup,,,
BusinessHunt,2,https://businesshunt.co,SaaS,43,Yes,,Draft,,,SaaS,,,
Launched.io,2,https://launched.io,Startup,40,Yes,,Draft,,,Startup,,,
ProfitHunt,2,https://profithunt.co,Startup,40,Yes,,Draft,,,Startup,,,
10words,2,https://10words.io,SaaS,40,Yes,,Draft,,,SaaS,,,
TrustMRR,2,https://trustmrr.com,Startup,40,Yes,,Draft,,,Startup,,,
OpenClawDir,2,https://openclawdir.com,Tech,35,Yes,,Draft,,,Dev,,,
Build Voyage,2,https://buildvoyage.com,Startup,33,Yes,,Draft,,,Startup,,,
AlphaDigits,2,https://alphadigits.com,SaaS,32,Yes,,Draft,,,SaaS,,,
GPTForge,3,https://gptforge.net,AI,30,Yes,,Draft,,,AI,,,Domain created 2025 — DR 88 from source list is implausible
AI Tools Guide,3,https://aitoolsguide.com,AI,77,Yes,,Draft,,,AI,,,
AIToolly,3,https://aitoolly.com,AI,69,Yes,,Draft,,,AI,,,
All The AI Tools,3,https://alltheaitools.com,AI,66,Yes,,Draft,,,AI,,,
Aiforme.wiki,3,https://aiforme.wiki,AI,66,Yes,,Draft,,,AI,,,
Noxilo,3,https://noxilo.com,AI,66,Yes,,Draft,,,AI,,,
AI Generation,3,https://www.theaigeneration.com,AI,55,Yes,,Draft,,,AI,,,
Every AI,3,https://every-ai.com,AI,55,Yes,,Draft,,,AI,,,
BAI.tools,3,https://bai.tools,AI,53,Yes,,Draft,,,AI,,,
The Rundown Tools,3,https://www.rundown.ai/tools,AI,40,Yes,,Draft,,,AI,,,
AI NavHub,3,https://ainavhub.com,AI,38,Yes,,Draft,,,AI,,,
WhatTheAI,3,https://whattheai.tech,AI,35,Yes,,Draft,,,AI,,,
ToolAI,3,https://toolai.io,AI,31,Yes,,Draft,,,AI,,,
LLM Relevance,3,https://www.llmrelevance.com,AI,30,Yes,,Draft,,,AI,,,
MakerPad / Zapier,5,https://www.makerpad.co,No-Code,62,Yes,,Draft,,,No-code,,,
NoCodeFounders,5,https://www.nocodefounders.com,No-Code,45,Yes,,Draft,,,No-code,,,
WordPress.com,8,https://wordpress.com,Blog,100,Yes,,Draft,,,Profile,,,
Blogger,8,https://www.blogger.com,Blog,100,Yes,,Draft,,,Profile,,,
Tumblr,8,https://www.tumblr.com,Blog,99,Yes,,Draft,,,Profile,,,
GitHub,8,https://github.com,Tech,98,Yes,,Draft,,,Profile,,,
SoundCloud,8,https://soundcloud.com,Music,96,Yes,,Draft,,,Profile,,,
Weebly,8,https://www.weebly.com,Blog,95,Yes,,Draft,,,Profile,,,
SlideShare,8,https://www.slideshare.net,Content,95,Yes,,Draft,,,Profile,,,
Flickr,8,https://www.flickr.com,Photography,95,Yes,,Draft,,,Profile,,,
GitLab,8,https://gitlab.com,Tech,94,Yes,,Draft,,,Profile,,,
eBay Stores,8,https://www.ebay.com,E-commerce,94,Yes,,Draft,,,Profile,,,
Etsy,8,https://www.etsy.com,E-commerce,93,Yes,,Draft,,,Profile,,,
Substack,8,https://substack.com,Newsletter,93,Yes,,Draft,,,Profile,,,
Bitbucket,8,https://bitbucket.org,Tech,93,Yes,,Draft,,,Profile,,,
Scribd,8,https://www.scribd.com,Content,93,Yes,,Draft,,,Profile,,,
Disqus,8,https://disqus.com,Professional,93,Yes,,Draft,,,Profile,,,
Behance,8,https://www.behance.net,Design,93,Yes,,Draft,,,Profile,,,
Pastebin,8,https://pastebin.com,Tech,93,Yes,,Draft,,,Profile,,,
Patreon,8,https://www.patreon.com,Creator,93,Yes,,Draft,,,Profile,,,
Imgur,8,https://imgur.com,Content,93,Yes,,Draft,,,Profile,,,
Dun & Bradstreet,8,https://www.dnb.com,B2B,93,Yes,,Draft,,,Profile,,,
Ghost.org,8,https://ghost.org,Blog,92,Yes,,Draft,,,Profile,,,
Evernote,8,https://evernote.com,Content,92,Yes,,Draft,,,Profile,,,
Issuu,8,https://issuu.com,Content,92,Yes,,Draft,,,Profile,,,
CodePen,8,https://codepen.io,Tech,92,Yes,,Draft,,,Profile,,,
Kaggle,8,https://www.kaggle.com,AI,92,Yes,,Draft,,,Profile,,,
Houzz,8,https://www.houzz.com,Home,92,Yes,,Draft,,,Profile,,,
LiveJournal,8,https://www.livejournal.com,Blog,91,Yes,,Draft,,,Profile,,,
Bandcamp,8,https://bandcamp.com,Music,91,Yes,,Draft,,,Profile,,,
Dev.to,8,https://dev.to,Tech,90,Yes,,Draft,,,Profile,,,
Gravatar,8,https://gravatar.com,Professional,90,Yes,,Draft,,,Profile,,,
Replit,8,https://replit.com,Tech,90,Yes,,Draft,,,Profile,,,
CodeProject,8,https://www.codeproject.com,Tech,90,Yes,,Draft,,,Profile,,,
Jimdo,8,https://www.jimdo.com,Blog,89,Yes,,Draft,,,Profile,,,
Calameo,8,https://www.calameo.com,Content,89,Yes,,Draft,,,Profile,,,
Buy Me a Coffee,8,https://www.buymeacoffee.com,Creator,88,Yes,,Draft,,,Profile,,,
ArtStation,8,https://www.artstation.com,Design,88,Yes,,Draft,,,Profile,,,
500px,8,https://500px.com,Photography,88,Yes,,Draft,,,Profile,,,
AppSumo,8,https://appsumo.com,E-commerce,84,Yes,,Draft,,,Profile,,,
IndiaMART,8,https://www.indiamart.com,B2B,87,Yes,,Draft,,,Profile,,,
Strikingly,8,https://www.strikingly.com,Blog,87,Yes,,Draft,,,Profile,,,
Hashnode,8,https://hashnode.com,Tech,85,Yes,,Draft,,,Profile,,,
About.me,8,https://about.me,Professional,85,Yes,,Draft,,,Profile,,,
Mixcloud,8,https://www.mixcloud.com,Music,85,Yes,,Draft,,,Profile,,,
4Shared,8,https://www.4shared.com,Content,85,Yes,,Draft,,,Profile,,,
HubPages,8,https://hubpages.com,Blog,84,Yes,,Draft,,,Profile,,,
TeachersPayTeachers,8,https://www.teacherspayteachers.com,Education,84,Yes,,Draft,,,Profile,,,
AuthorStream,8,https://www.authorstream.com,Content,70,Yes,,Draft,,,Profile,,,
Model Mayhem,8,https://www.modelmayhem.com,Design,72,Yes,,Draft,,,Profile,,,
Penzu,8,https://penzu.com,Blog,60,Yes,,Draft,,,Profile,,,
Crevado,8,https://crevado.com,Design,50,Yes,,Draft,,,Profile,,,
MyFolio,8,https://myfolio.com,Design,55,Yes,,Draft,,,Profile,,,
Manta,9,https://www.manta.com,Local business,76,Yes,,Draft,,,Local,,,
ActiveSearchResults,9,https://www.activesearchresults.com,Local business,74,Yes,,Draft,,,Local,,,
Hotfrog,9,https://www.hotfrog.com,Local business,72,Yes,,Draft,,,Local,,,
Spoke,9,https://www.spoke.com,Local business,70,Yes,,Draft,,,Local,,,
Locanto,9,https://www.locanto.com,General,70,Yes,,Draft,,,Local,,,
MerchantCircle,9,https://www.merchantcircle.com,Local business,68,Yes,,Draft,,,Local,,,
Just Landed,9,https://www.justlanded.com,Local business,65,Yes,,Draft,,,Local,,,
Showmelocal,9,https://www.showmelocal.com,Local business,64,Yes,,Draft,,,Local,,,
Cylex,9,https://www.cylex.us.com,Local business,64,Yes,,Draft,,,Local,,,
Brownbook,9,https://www.brownbook.net,Local business,63,Yes,,Draft,,,Local,,,
Tupalo,9,https://tupalo.com,Local business,62,Yes,,Draft,,,Local,,,
WebWiki,9,https://www.webwiki.com,Local business,60,Yes,,Draft,,,Local,,,
iBegin,9,https://www.ibegin.com,Local business,60,Yes,,Draft,,,Local,,,
CitySquares,9,https://citysquares.com,Local business,55,Yes,,Draft,,,Local,,,
eLocal,9,https://elocal.com,Local business,55,Yes,,Draft,,,Local,,,
2FindLocal,9,https://www.2findlocal.com,Local business,53,Yes,,Draft,,,Local,,,
Chamber of Commerce,9,https://www.chamberofcommerce.com,Local business,50,Yes,,Draft,,,Local,,,
FindUsLocal,9,https://www.finduslocal.com,Local business,50,Yes,,Draft,,,Local,,,
ezlocal,9,https://www.ezlocal.com,Local business,50,Yes,,Draft,,,Local,,,
Yellow Pages Goes Green,9,https://www.yellowpagesgoesgreen.org,Local business,49,Yes,,Draft,,,Local,,,
Where To?,9,https://www.where2go.com,Local business,46,Yes,,Draft,,,Local,,,
SitePoint Forums,10,https://www.sitepoint.com/community,Tech,89,Yes,,Draft,,,Forum,,,
Mumsnet Forums,10,https://www.mumsnet.com/Talk,Family,85,Yes,,Draft,,,Forum,,,
Digital Point,10,https://forums.digitalpoint.com,Marketing,82,Yes,,Draft,,,Forum,,,
WebmasterWorld,10,https://www.webmasterworld.com,Marketing,77,Yes,,Draft,,,Forum,,,
BlackHatWorld,10,https://www.blackhatworld.com,Marketing,77,Yes,,Draft,,,Forum,,,
GrowthHackers,10,https://growthhackers.com,Marketing,76,Yes,,Draft,,,Forum,,,
Warrior Forum,10,https://www.warriorforum.com,Marketing,73,Yes,,Draft,,,Forum,,,
Apsense,10,https://www.apsense.com,Marketing,72,Yes,,Draft,,,Forum,,,
Strava Clubs,10,https://www.strava.com,Fitness,90,Yes,,Draft,,,Forum,,,
Foursquare,10,https://business.foursquare.com,Hospitality,90,Yes,,Draft,,,Forum,,,
ActiveRain,10,https://activerain.com,Real estate,70,Yes,,Draft,,,Forum,,,
Quibblo,10,https://www.quibblo.com,General,55,Yes,,Draft,,,Forum,,,
EzineArticles,11,https://ezinearticles.com,Article,80,Yes,,Draft,,,Article,,,
PRLog,11,https://www.prlog.org,Press release,80,Yes,,Draft,,,PR,,,
Feedspot,11,https://www.feedspot.com,Blog directory,80,Yes,,Draft,,,Article,,,
PR.com,11,https://www.pr.com,Press release,77,Yes,,Draft,,,PR,,,
Alltop,11,https://alltop.com,Blog directory,73,Yes,,Draft,,,Article,,,
OpenPR,11,https://www.openpr.com,Press release,72,Yes,,Draft,,,PR,,,
ArticlesBase,11,https://www.articlesbase.com,Article,70,Yes,,Draft,,,Article,,,
1888 Press Release,11,https://www.1888pressrelease.com,Press release,69,Yes,,Draft,,,PR,,,
NewswireToday,11,https://www.newswiretoday.com,Press release,65,Yes,,Draft,,,PR,,,
Blogarama,11,https://www.blogarama.com,Blog directory,64,Yes,,Draft,,,Article,,,
Online PR News,11,https://www.onlineprnews.com,Press release,62,Yes,,Draft,,,PR,,,
PR Free,11,https://www.pr-free.com,Press release,62,Yes,,Draft,,,PR,,,
SubmissionWebDirectory,11,https://www.submissionwebdirectory.com,General,61,Yes,,Draft,,,Article,,,
Sooper Articles,11,https://www.sooperarticles.com,Article,60,Yes,,Draft,,,Article,,,
OnToplist,11,https://www.ontoplist.com,Blog directory,60,Yes,,Draft,,,Article,,,
BlogEngage,11,https://www.blogengage.com,Blog directory,55,Yes,,Draft,,,Article,,,
BizSugar,11,https://www.bizsugar.com,Business,55,Yes,,Draft,,,Article,,,
TechPluto,11,https://www.techpluto.com,Marketing,50,Yes,,Draft,,,Article,,,
Semfirms,11,https://www.semfirms.com,Marketing,45,Yes,,Draft,,,Article,,,
CabinetM,11,https://www.cabinetm.com,Marketing,45,Yes,,Draft,,,Article,,,
Cold Email Kit,11,https://coldemailkit.com,Marketing,44,Yes,,Draft,,,Article,,,
Directory LDM Studio,11,https://www.directory.ldmstudio.com,General,40,Yes,,Draft,,,Article,,,
Quality Internet Directory,11,https://www.qualityinternetdirectory.com,General,39,Yes,,Draft,,,Article,,,
Site Promotion Directory,11,https://www.sitepromotiondirectory.com,Marketing,46,Yes,,Draft,,,Article,,,
ProofStories,11,https://proofstories.io,Marketing,32,Yes,,Draft,,,Article,,,
Scoop.it,12,https://www.scoop.it,Curation,91,Yes,,Draft,,,Bookmarking,,,
Diigo,12,https://www.diigo.com,Bookmarking,85,Yes,,Draft,,,Bookmarking,,,
Pearltrees,12,https://www.pearltrees.com,Bookmarking,84,Yes,,Draft,,,Bookmarking,,,
BibSonomy,12,https://www.bibsonomy.org,Research,70,Yes,,Draft,,,Bookmarking,,,
Folkd,12,https://www.folkd.com,Bookmarking,64,Yes,,Draft,,,Bookmarking,,,
Justia,13,https://www.justia.com,Legal,85,Yes,,Draft,,,Niche,,,
Lawyers.com,13,https://www.lawyers.com,Legal,82,Yes,,Draft,,,Niche,,,
Porch,13,https://porch.com,Home,80,Yes,,Draft,,,Niche,,,
AllMenus,13,https://www.allmenus.com,Hospitality,76,Yes,,Draft,,,Niche,,,
HG.org,13,https://www.hg.org,Legal,75,Yes,,Draft,,,Niche,,,
Sulekha,13,https://www.sulekha.com,B2B,73,Yes,,Draft,,,Niche,,,
BuildZoom,13,https://www.buildzoom.com,Home,73,Yes,,Draft,,,Niche,,,
LandBook,13,https://land-book.com,Design,72,Yes,,Draft,,,Niche,,,
Athlinks,13,https://www.athlinks.com,Fitness,72,Yes,,Draft,,,Niche,,,
Evensi Events,13,https://evensi.com,Events,62,Yes,,Draft,,,Niche,,,
Wellness.com,13,https://www.wellness.com,Health,60,Yes,,Draft,,,Niche,,,
Placester,13,https://placester.com,Real estate,60,Yes,,Draft,,,Niche,,,
YogaTrail,13,https://www.yogatrail.com,Health,55,Yes,,Draft,,,Niche,,,
Tradify (FreeIndex),13,https://www.freeindex.co.uk,Home,55,Yes,,Draft,,,Niche,,,
Webdesign Inspiration,13,https://webdesign-inspiration.com,Design,45,Yes,,Draft,,,Niche,,,
iBuildNew,13,https://www.ibuildnew.com.au,Home,45,Yes,,Draft,,,Niche,,,
EU-Business,13,https://www.eu-business.com,B2B,46,Yes,,Draft,,,Niche,,,
MassageTherapy (AMBP),13,https://www.massagetherapy.com,Health,45,Yes,,Draft,,,Niche,,,
Fit Pro Directory,13,https://fitprofessionals.net,Fitness,40,Yes,,Draft,,,Niche,,,
Curated.design,13,https://www.curated.design,Design,52,Yes,,Draft,,,Niche,,,
```

