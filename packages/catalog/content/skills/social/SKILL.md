---
name: social
description: "When the user wants help creating, scheduling, or optimizing social media content for LinkedIn, Twitter/X, Instagram, TikTok, Facebook, or other platforms, or wants to do social listening and engagement triage. Also use when the user mentions 'LinkedIn post,' 'Twitter thread,' 'social media,' 'content calendar,' 'social scheduling,' 'engagement,' 'viral content,' 'what should I post,' 'repurpose this content,' 'tweet ideas,' 'LinkedIn carousel,' 'social media strategy,' 'grow my following,' 'TikTok video,' 'Reels,' 'Shorts,' 'video script,' 'video hook,' 'short-form video,' 'create a reel,' 'social listening,' 'brand mentions,' 'competitor monitoring,' 'top posts to comment on,' or 'find people asking for.' Use this for social media content creation, repurposing, scheduling, short-form video scripting, and social listening. For broader content strategy, see content-strategy. For paid ads, see ad-creative. For earned media, see public-relations."
category: Marketing
author: community
version: "2.1.0"
icon: megaphone
---

# Social Content

You are an expert social media strategist. Your goal is to help create engaging content that builds audience, drives engagement, and supports business goals.

## Before Creating Content

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Goals
- What's the primary objective? (Brand awareness, leads, traffic, community)
- What action do you want people to take?
- Are you building personal brand, company brand, or both?

### 2. Audience
- Who are you trying to reach?
- What platforms are they most active on?
- What content do they engage with?

### 3. Brand Voice
- What's your tone? (Professional, casual, witty, authoritative)
- Any topics to avoid?
- Any specific terminology or style guidelines?

### 4. Resources
- How much time can you dedicate to social?
- Do you have existing content to repurpose?
- Can you create video content?

---

## Platform Quick Reference

| Platform | Best For | Frequency | Key Format |
|----------|----------|-----------|------------|
| LinkedIn | B2B, thought leadership | 3-5x/week | Carousels, stories |
| Twitter/X | Tech, real-time, community | 3-10x/day | Threads, hot takes |
| Instagram | Visual brands, lifestyle | 1-2 posts + Stories daily | Reels, carousels |
| TikTok | Brand awareness, younger audiences | 1-4x/day | Short-form video |
| Facebook | Communities, local businesses | 1-2x/day | Groups, native video |

**For detailed platform strategies**: See [references/platforms.md](references/platforms.md)

**For hashtag limits and character counts**: See [references/platform-limits.md](references/platform-limits.md)

---

## Content Pillars Framework

Build your content around 3-5 pillars that align with your expertise and audience interests.

### Example for a SaaS Founder

| Pillar | % of Content | Topics |
|--------|--------------|--------|
| Industry insights | 30% | Trends, data, predictions |
| Behind-the-scenes | 25% | Building the company, lessons learned |
| Educational | 25% | How-tos, frameworks, tips |
| Personal | 15% | Stories, values, hot takes |
| Promotional | 5% | Product updates, offers |

### Pillar Development Questions

For each pillar, ask:
1. What unique perspective do you have?
2. What questions does your audience ask?
3. What content has performed well before?
4. What can you create consistently?
5. What aligns with business goals?

---

## Hook Formulas

The first line determines whether anyone reads the rest.

### Curiosity Hooks
- "I was wrong about [common belief]."
- "The real reason [outcome] happens isn't what you think."
- "[Impressive result] — and it only took [surprisingly short time]."

### Story Hooks
- "Last week, [unexpected thing] happened."
- "I almost [big mistake/failure]."
- "3 years ago, I [past state]. Today, [current state]."

### Value Hooks
- "How to [desirable outcome] (without [common pain]):"
- "[Number] [things] that [outcome]:"
- "Stop [common mistake]. Do this instead:"

### Contrarian Hooks
- "Unpopular opinion: [bold statement]"
- "[Common advice] is wrong. Here's why:"
- "I stopped [common practice] and [positive result]."

**For post templates and more hooks**: See [references/post-templates.md](references/post-templates.md)

---

## Content Repurposing System

Turn one piece of content into many. The best social content isn't created from scratch — it's extracted from longer-form pillar content and adapted to each platform.

### Blog Post → Social Content

| Platform | Format |
|----------|--------|
| LinkedIn | Key insight + link in comments |
| LinkedIn | Carousel of main points |
| Twitter/X | Thread of key takeaways |
| Instagram | Carousel with visuals |
| Instagram | Reel summarizing the post |

### Podcast / Video → Social Content

Extract "content atoms" — self-contained moments from any long-form content that work on their own:

| Atom Type | What to Look For | Best Platform |
|-----------|-----------------|---------------|
| Quotable moment | A bold claim, hot take, or memorable line (15-60 sec) | Twitter/X, LinkedIn, TikTok |
| Story arc | A complete mini-story with setup, conflict, resolution (60-90 sec) | Instagram Reels, TikTok, YouTube Shorts |
| Tactical tip | A specific how-to or framework explained clearly (30-60 sec) | LinkedIn, YouTube Shorts |
| Controversial take | A contrarian opinion that sparks debate | Twitter/X, LinkedIn |
| Data/stat callout | A surprising number or research finding | LinkedIn carousel, Twitter/X |
| Behind-the-scenes | Authentic, unpolished moments | Instagram Stories, TikTok |

**Podcast repurposing workflow:**
1. **Get transcript** — use Whisper, Descript, or your podcast host's transcription
2. **Mark timestamps** — flag the 5-10 best moments while listening or scanning transcript
3. **Extract clips** — pull video/audio clips for each moment (Descript, Opus Clip, or manual)
4. **Write standalone captions** — each clip needs context; don't assume the viewer heard the rest
5. **Add subtitles** — most social video is watched without sound
6. **Schedule across 1-2 weeks** — spread a single episode across multiple posts

**Per episode, aim for:**
- 3-5 short video clips or audiograms (15-60 sec) for Reels/TikTok/Shorts
- 1-2 LinkedIn text posts from key insights
- 1 Twitter/X thread of takeaways
- 1 carousel summarizing the main framework or list
- 1 newsletter section or blog post from the best segment

### Webinar / Live Event → Social Content

| Extract | Format |
|---------|--------|
| Key slides with commentary | LinkedIn carousel |
| Q&A highlights | Twitter/X thread |
| Speaker quotes | Quote graphics for Instagram/LinkedIn |
| Audience reactions/poll results | Engagement posts |
| Full recording → short clips | Reels, TikTok, Shorts |

### Newsletter → Social Content

| Extract | Format |
|---------|--------|
| Main insight | LinkedIn post |
| Curated links with commentary | Twitter/X thread |
| Data or stat | Quote graphic |
| Hot take or opinion | Twitter/X post, LinkedIn |

### Repurposing Workflow

1. **Create pillar content** (blog, video, podcast, webinar, newsletter)
2. **Extract content atoms** (5-10 per piece — quotes, stories, tips, data)
3. **Adapt to each platform** (format, length, and tone)
4. **Write standalone captions** (each post must work without context)
5. **Schedule across the week** (spread distribution, don't dump all at once)
6. **Update and reshare** (evergreen content can repeat every 3-6 months)

---

## Content Calendar Structure

### Weekly Planning Template

| Day | LinkedIn | Twitter/X | Instagram |
|-----|----------|-----------|-----------|
| Mon | Industry insight | Thread | Carousel |
| Tue | Behind-scenes | Engagement | Story |
| Wed | Educational | Tips tweet | Reel |
| Thu | Story post | Thread | Educational |
| Fri | Hot take | Engagement | Story |

### Batching Strategy (2-3 hours weekly)

1. Review content pillar topics
2. Write 5 LinkedIn posts
3. Write 3 Twitter threads + daily tweets
4. Create Instagram carousel + Reel ideas
5. Schedule everything
6. Leave room for real-time engagement

---

## Engagement Strategy

### Daily Engagement Routine (30 min)

1. Respond to all comments on your posts (5 min)
2. Comment on 5-10 posts from target accounts (15 min)
3. Share/repost with added insight (5 min)
4. Send 2-3 DMs to new connections (5 min)

**For surfacing *which* posts to comment on** (top-10 daily lists, brand/competitor monitoring, intent-signal triage), see [references/listening.md](references/listening.md). Includes a scoring rubric and curl recipes for Reddit, Hacker News, and Bluesky.

### Quality Comments

- Add new insight, not just "Great post!"
- Share a related experience
- Ask a thoughtful follow-up question
- Respectfully disagree with nuance

### Building Relationships

- Identify 20-50 accounts in your space
- Consistently engage with their content
- Share their content with credit
- Eventually collaborate (podcasts, co-created content)

---

## Analytics & Optimization

### Metrics That Matter

**Awareness:** Impressions, Reach, Follower growth rate

**Engagement:** Engagement rate, Comments (higher value than likes), Shares/reposts, Saves

**Conversion:** Link clicks, Profile visits, DMs received, Leads attributed

### Weekly Review

- Top 3 performing posts (why did they work?)
- Bottom 3 posts (what can you learn?)
- Follower growth trend
- Engagement rate trend
- Best posting times (from data)

### Optimization Actions

**If engagement is low:**
- Test new hooks
- Post at different times
- Try different formats
- Increase engagement with others

**If reach is declining:**
- Avoid external links in post body
- Increase posting frequency
- Engage more in comments
- Test video/visual content

---

## Content Ideas by Situation

### When You're Starting Out
- Document your journey
- Share what you're learning
- Curate and comment on industry content
- Engage heavily with established accounts

### When You're Stuck
- Repurpose old high-performing content
- Ask your audience what they want
- Comment on industry news
- Share a failure or lesson learned

---

## Scheduling Best Practices

### When to Schedule vs. Post Live

**Schedule:** Core content posts, Threads, Carousels, Evergreen content

**Post live:** Real-time commentary, Responses to news/trends, Engagement with others

### Queue Management

- Maintain 1-2 weeks of scheduled content
- Review queue weekly for relevance
- Leave gaps for spontaneous posts
- Adjust timing based on performance data

---

## Reverse Engineering Viral Content

Instead of guessing, analyze what's working for top creators in your niche:

1. **Find creators** — 10-20 accounts with high engagement
2. **Collect data** — 500+ posts for analysis
3. **Analyze patterns** — Hooks, formats, CTAs that work
4. **Codify playbook** — Document repeatable patterns
5. **Layer your voice** — Apply patterns with authenticity
6. **Convert** — Bridge attention to business results

**For the complete framework**: See [references/reverse-engineering.md](references/reverse-engineering.md)

---

## Short-Form Video (TikTok, Reels, Shorts)

Short-form video is the highest-reach format on every major platform. These frameworks apply whether you're creating for TikTok, Instagram Reels, or YouTube Shorts.

### Platform Specs

| Platform | Optimal Length | Aspect Ratio | Key Difference |
|----------|---------------|--------------|----------------|
| TikTok | 15-60 sec | 9:16 | Trending sounds, raw/authentic feel |
| Reels | 15-30 sec | 9:16 | Polished content, rewards saves/shares |
| Shorts | 30-60 sec | 9:16 | YouTube SEO applies, searchable titles |

### The 3-Second Rule

You have 3 seconds to stop the scroll. Every video needs three simultaneous hooks:

```
[VISUAL HOOK] + [VERBAL HOOK] + [TEXT OVERLAY]
```

All three should hit in the first second.

### Video Structures

**Problem-Solution (15-30 sec):**
```
[0-3s]  Hook: State the problem
[3-10s] Agitate: Why it matters
[10-25s] Solution: Your method/product/tip
[25-30s] CTA: What to do next
```

**List Format (30-60 sec):**
```
[0-3s]  Hook: "X things that [outcome]"
[3-50s] Items: One every 5-8 seconds
[50-60s] CTA
```

**Tutorial (30-60 sec):**
```
[0-3s]  Hook: Show the end result first
[3-8s]  Overview: "Here's how..."
[8-50s] Steps: Quick, clear instructions
[50-60s] Result + CTA
```

### Caption & Subtitle Best Practices

Captions increase watch time by 25-40%. Most social video is watched without sound.

- **MAX 2 lines** on screen at once
- **3-5 words per line**
- Bold, sans-serif font with black outline
- **Highlight key words** in a different color
- Match timing to speech exactly

Tools: CapCut (free), Descript, Captions.ai, Premiere Pro

### Content Ideas by Type

| Business Type | Video Ideas |
|---------------|-------------|
| SaaS | Feature demos (show outcome first), before/after, "Watch me do X in Y seconds" |
| E-commerce | Unboxing, comparisons, how it's made, customer reviews |
| Services | Process reveals, client transformations, myth-busting |
| Personal brand | Lessons learned, controversial takes, day-in-the-life |

### Common Mistakes

1. **Slow hooks** — don't build up to the point
2. **No text overlay** — many watch without sound
3. **Poor audio** — bad audio kills retention instantly
4. **Too long** — if it can be shorter, make it shorter
5. **No CTA** — tell viewers what to do
6. **Ignoring comments** — engagement in first hour matters

**For video hook formulas and scripting templates**: See [references/short-form-video.md](references/short-form-video.md)

---

## Task-Specific Questions

1. What platform(s) are you focusing on?
2. What's your current posting frequency?
3. Do you have existing content to repurpose?
4. What content has performed well in the past?
5. How much time can you dedicate weekly?
6. Are you building personal brand, company brand, or both?

---

## Related Skills

- **copywriting**: For longer-form content that feeds social
- **launch**: For coordinating social with launches
- **emails**: For nurturing social audience via email
- **marketing-psychology**: For understanding what drives engagement

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/listening-sources-template.md

# Listening Sources — Template

Copy this file to `.agents/listening-sources.md` in your project (or `.claude/listening-sources.md`) and fill in the brackets. Claude reads it when running the [listening workflow](listening.md).

Delete sections you don't use. Keep this short and current — stale sources are worse than no sources.

---

## What We're Listening For

**Brand / product:** [Your product name]
**Category:** [e.g., "AI writing assistant", "Postgres GUI"]
**Goal:** [e.g., "find people switching from Notion", "engage with B2B SaaS founders 50-200 employees"]

## ICP (for scoring)

Used by the [scoring rubric](listening.md#scoring-rubric) to judge ICP fit.

- **Role:** [e.g., "founder, head of marketing, marketing ops lead"]
- **Company stage:** [e.g., "seed to Series B SaaS, 10-200 employees"]
- **Industry:** [e.g., "B2B SaaS, infra, devtools"]
- **Signals they're a fit:** [e.g., "writes about GTM, runs paid ads, recently raised"]

---

## Target Accounts

Engage with **every** post from these accounts when relevant. Keep this list to 20-50 max.

### LinkedIn (browser-driven — use dev-browser to view feed)
- [Name] — `linkedin.com/in/handle`
- [Name] — `linkedin.com/in/handle`

### X / Twitter (browser-driven)
- [@handle]
- [@handle]

### Reddit
- u/[username]
- u/[username]

### Bluesky
- [handle.bsky.social]

### Blogs / Newsletters (RSS)
- [Name] — `https://example.com/feed/`
- [Name] — `https://example.substack.com/feed`

### YouTube channels (RSS)
- [Name] — channel ID `UCxxxxxxxx`

---

## Keywords (intent signals)

Search across all platforms. Claude runs these through Reddit, HN, Bluesky on the [daily loop](listening.md#the-daily-triage-loop).

### High-intent (someone shopping or switching)
- `"alternative to [competitor]"`
- `"looking for a [category] tool"`
- `"recommend a [category]"`
- `"switching from [competitor]"`
- `"frustrated with [competitor]"`

### Problem signals (someone in pain)
- `"[category] is so [bad/hard/expensive]"`
- `"why is [category] [problem]"`
- `"hate [pain point]"`

### Brand mentions
- `"[your brand]"`
- `"[your brand misspelling]"`
- `"[your domain]"`

### Competitor mentions (monitor for switching language)
- `"[competitor 1]"`
- `"[competitor 2]"`

---

## Subreddits

Pulled via Reddit JSON API on the daily loop.

- r/SaaS
- r/Entrepreneur
- r/[your niche, e.g., "marketing", "devtools"]
- r/[adjacent community]

---

## Saved Searches (manual / browser-driven)

URLs Claude opens via dev-browser to scan.

### LinkedIn Sales Navigator
- [Search name] — `https://linkedin.com/sales/search/people?...`

### LinkedIn (regular)
- Posts hashtag — `https://linkedin.com/feed/hashtag/yourtopic/`

### X advanced search
- [Search name] — `https://x.com/search?q=...&f=live`

---

## Do Not Engage

Save yourself the regret.

- Accounts known for bad-faith dunking: [@handle], [@handle]
- Blocked brands / competitors who'll screenshot: [list]
- Topics to avoid: [politics, [your founder's hot takes], etc.]

---

## Notes for Claude

- When asked for "today's top 10," output in the format defined in [listening.md](listening.md#the-daily-triage-loop)
- For LinkedIn and X, use dev-browser with the persistent session (user is logged in)
- For everything else, use the curl recipes in [listening.md](listening.md#sources--light-tooling-curl-recipes)
- Default lookback: 24h. User can override.
- Always ask before posting — output drafts, user approves and posts manually

### references/listening.md

# Social Listening & Engagement Triage

How to surface the right posts to engage with each day — instead of randomly scrolling. The goal is a short, scorable list ("here are your top 10 posts to comment on") rather than an open feed.

## Contents
- When to use this
- The daily triage loop
- Scoring rubric
- Comment quality tiers
- Sources & light tooling (curl recipes)
- Per-platform notes
- Common workflows

---

## When to Use This

Use listening when the goal is **commenting and relationships**, not posting. Typical asks:
- "Give me the top 10 posts I should comment on today"
- "Who's complaining about [competitor] right now?"
- "Find people asking for a tool like mine"
- "Surface posts from my 20 target accounts in the last 24h"
- "What's the conversation around [topic] this week?"

If the user wants to **create** content, use the rest of the social skill. Listening feeds creation (it surfaces angles, language, objections), but the output is different.

---

## The Daily Triage Loop

A repeatable 20-minute loop the user (or you, on their behalf) can run each morning.

1. **Pull** — fetch new posts from defined sources (target accounts, keywords, subreddits, hashtags). See [tooling](#sources--light-tooling-curl-recipes).
2. **Filter** — drop anything older than 24h, low signal, or off-topic.
3. **Score** — apply the [rubric](#scoring-rubric). Keep top 10.
4. **Draft** — for each, draft a comment matched to the post's tier.
5. **Post** — user reviews, edits, posts. Mark which actually went live.
6. **Log** — track what you commented on and what got replies. This is your engagement loop dataset.

Output format Claude should produce:

```
TOP 10 POSTS — 2026-06-05

1. [Score 9/10] @author — LinkedIn — 2h ago
   "We just rolled out X and the team is loving it…"
   Why: ICP fit (B2B SaaS, 50–200 employees), buying-intent signal
   Suggested comment: [draft]
   Link: https://…
```

---

## Scoring Rubric

Score each post 1–10 across five dimensions, then sum and rank.

| Dimension | What it measures | Weight |
|-----------|------------------|--------|
| **ICP fit** | Is the author your target customer / influencer? | 2x |
| **Intent signal** | Are they expressing a problem, asking, or shopping? | 2x |
| **Reach potential** | Is the post getting traction (likes/comments rising)? | 1x |
| **Comment opportunity** | Can you say something genuinely useful, not generic? | 2x |
| **Recency** | Posted in last 1–4h (early comments win, especially on LinkedIn) | 1x |

**Intent signal examples (high-value):**
- "Looking for a tool that does X"
- "Why is [category] so painful?"
- "We just switched from [competitor] because…"
- "Anyone use [competitor] — is it worth it?"
- A complaint about a known competitor

**Drop if any of these are true:**
- Author isn't ICP and isn't an influencer
- Post is >24h old and already has 50+ comments (your comment buries)
- Generic motivational/AI-slop post
- Self-promotion thread where comments don't get reach
- You can't add anything beyond "Great post!"

---

## Comment Quality Tiers

Match the comment to the post. Don't waste a tier-1 draft on a tier-3 opportunity.

**Tier 1 — Relationship builder (target accounts, ICP, high intent)**
- Add a specific insight or counter-example
- Reference your own experience with specifics (numbers, names, outcomes)
- Ask a thoughtful follow-up that invites a reply
- Length: 2–4 sentences, no link

**Tier 2 — Visibility play (high-reach post, adjacent topic)**
- Add one sharp insight in one sentence
- Pattern: "Agreed — and the part most miss is [X]"
- Length: 1–2 sentences

**Tier 3 — Light touch (relationship maintenance)**
- Specific reaction, not "Love this"
- Quote a specific line and react to it
- Length: 1 sentence

**Never:** "Great post!", emoji-only, "+1", LinkedIn-isms like "This is gold 🔥"

---

## Sources & Light Tooling (curl recipes)

These are public JSON endpoints — no auth needed. Run them from bash, pipe to `jq`, and Claude can parse the output to score and draft comments.

**Requires:** `jq` (most recipes) and `xmllint` (RSS only). Install once:
```bash
# macOS
brew install jq
# xmllint ships with macOS; on Linux: apt install libxml2-utils
```

### Reddit (free, scriptable)

**New posts in a subreddit:**
```bash
curl -s -A "listening/1.0" \
  "https://www.reddit.com/r/SaaS/new.json?limit=25" \
  | jq '.data.children[].data | {title, author, url: ("https://reddit.com"+.permalink), score, num_comments, created_utc, selftext: (.selftext | .[0:300])}'
```

**Search across Reddit by keyword (last day, sorted new):**
```bash
curl -s -A "listening/1.0" \
  "https://www.reddit.com/search.json?q=KEYWORD&sort=new&t=day&limit=25" \
  | jq '.data.children[].data | {subreddit, title, url: ("https://reddit.com"+.permalink), author, score, created_utc}'
```

Swap `KEYWORD` for things like `"alternative to notion"`, `"recommend a crm"`, your competitor names, or your own brand for mentions. Use quotes around multi-word phrases.

### Hacker News (Algolia search)

**Recent stories mentioning a keyword (last 24h):**
```bash
SINCE=$(($(date +%s) - 86400))
curl -s "https://hn.algolia.com/api/v1/search_by_date?query=KEYWORD&tags=story&numericFilters=created_at_i>${SINCE}" \
  | jq '.hits[] | {title, url, author, points, num_comments, created_at, story_id: .objectID, hn_url: ("https://news.ycombinator.com/item?id="+.objectID)}'
```

**Recent comments mentioning a keyword:**
```bash
curl -s "https://hn.algolia.com/api/v1/search_by_date?query=KEYWORD&tags=comment&numericFilters=created_at_i>${SINCE}" \
  | jq '.hits[] | {author, comment_text, story_title, hn_url: ("https://news.ycombinator.com/item?id="+.objectID)}'
```

### Bluesky (free, public API)

**Search posts by keyword:**
```bash
curl -s "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=KEYWORD&limit=25&sort=latest" \
  | jq '.posts[] | {author: .author.handle, text: .record.text, likes: .likeCount, replies: .replyCount, url: ("https://bsky.app/profile/"+.author.handle+"/post/"+(.uri | split("/") | last))}'
```

### RSS for blogs, podcasts, YouTube channels

For target accounts that publish to RSS (most blogs, all YouTube channels):
```bash
# YouTube channel feed (replace CHANNEL_ID)
curl -s "https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID"

# Generic blog feed
curl -s "https://example.com/feed/" | xmllint --xpath "//item[position()<6]" - 2>/dev/null
```

### LinkedIn & X — use the browser

LinkedIn and X don't expose useful public APIs, but you can drive a real browser session. **dev-browser** (MCP, already in the global setup) and **Playwright** both maintain persistent state — log in once, the session stays alive, Claude can navigate the authenticated feed.

**dev-browser workflow (preferred — already wired up):**
1. User logs into LinkedIn / X once in the dev-browser session
2. Claude navigates to a target URL (feed, profile, saved search, hashtag)
3. Claude reads the accessibility tree / page text, extracts posts
4. Claude scores using the [rubric](#scoring-rubric) and drafts comments
5. User reviews and posts manually (don't auto-post — high-stakes, bot detection risk)

**Useful URLs to feed dev-browser:**

| URL pattern | What it shows |
|-------------|---------------|
| `linkedin.com/in/HANDLE/recent-activity/all/` | A target account's recent posts |
| `linkedin.com/feed/hashtag/TOPIC/` | Hashtag feed |
| `linkedin.com/feed/` | Your main feed (algorithmic — less useful for triage) |
| `x.com/HANDLE` | A target account's profile |
| `x.com/search?q=QUERY&f=live` | Real-time search (use `f=live` for chronological) |
| `x.com/i/lists/LIST_ID` | A curated list — best for target accounts |

**Tips:**
- On X, build a private list of target accounts and use the list URL. Far cleaner than the algorithmic feed.
- LinkedIn's `/recent-activity/all/` URL is the cleanest way to see one person's posts without the algorithm.
- For both platforms, scroll programmatically (dev-browser supports it) to load more posts before extracting.

**Paid alternatives if you don't want to drive a browser:**

| Platform | Tools |
|----------|-------|
| LinkedIn | Sales Navigator (saved searches), Taplio (engagement) |
| X | TweetDeck/X Pro (saved columns), Typefully, Taplio, Tweet Hunter |

**Still closed (no good path):**
- Instagram & TikTok — closed APIs, browser automation is detectable and risky. Use native saved searches / hashtag follows.

---

## Per-Platform Notes

### LinkedIn
- **Browser-driven** (dev-browser with persistent session) — see [LinkedIn & X — use the browser](#linkedin--x--use-the-browser)
- **First-hour comments matter most** — algorithm weights early engagement heavily. Prioritize posts <2h old from target accounts.
- Comments with 5+ words get more reach than reactions
- Replying to other commenters can put you in front of their network
- Tag the author in your reply only if it adds context

### Twitter/X
- **Browser-driven** (dev-browser) — build a private list of target accounts and point dev-browser at the list URL
- Reply within first 30 min for max reach on big accounts
- Quote-tweet > reply when adding substantial value
- Threading your reply (multi-tweet) signals effort
- Don't pile on dunks — relationships > clout

### Reddit
- Read the subreddit rules before commenting (some ban self-promotion outright)
- Earn karma in the sub before linking to anything you own
- Long, specific answers win. AMAs and "help me decide" threads are gold
- Never lead with your product — answer the question first

### Hacker News
- Comment quality bar is high; low-effort gets downvoted fast
- Founders commenting on threads about their product is welcomed if you're transparent
- Search for past discussions of your category — they're often dormant gold mines

### Bluesky
- Smaller volume but high engagement-to-follower ratio
- Tech and indie-hacker communities are active
- Custom feeds (like Bluesky's "Following" + topic feeds) replace algorithmic search

---

## Common Workflows

### "Give me my top 10 posts to comment on today"
1. Pull from: target account RSS/saved searches + Reddit (relevant subs) + HN (last 24h)
2. Score with the [rubric](#scoring-rubric)
3. Output top 10 with suggested comments

### "Find people complaining about [competitor]"
1. Reddit search: `"competitor name" -site:competitor.com` sorted by new
2. HN comment search for competitor name
3. Bluesky search for competitor handle/name
4. Score by intent signal (high if switching language: "moving from", "alternatives to", "frustrated with")

### "Surface brand mentions from the last week"
1. Reddit search for brand name
2. HN search (stories + comments) for brand name
3. Bluesky search for brand name + handle
4. Output as: reply needed (yes/no), tone (positive/negative/neutral), suggested response

### "Find target-account posts I missed"
1. Maintain a list of target accounts with their RSS / Reddit usernames / Bluesky handles
2. Fetch each source's recent posts
3. Filter to last 24h, output sorted by score

---

## Setting Up the Source List

The user should maintain a list of sources somewhere persistent at `.agents/listening-sources.md` (or `.claude/listening-sources.md`). Claude reads it when running the daily loop.

**A ready-to-fill template lives at [listening-sources-template.md](listening-sources-template.md).** Copy it into the project and edit. The source path depends on how the skill was installed:

```bash
# Plugin / marketplace install (most common):
cp .agents/skills/social/references/listening-sources-template.md .agents/listening-sources.md
# .claude/ install:
cp .claude/skills/social/references/listening-sources-template.md .agents/listening-sources.md
# Working inside the marketingskills repo:
cp skills/social/references/listening-sources-template.md .agents/listening-sources.md
```

The template covers: brand/category, ICP (for scoring), target accounts per platform, intent keywords, subreddits, saved-search URLs, and a do-not-engage list.

### references/platform-limits.md

# Platform Limits Reference

Quick reference for hashtag limits, character counts, and visible text thresholds on each major social platform.

---

## Instagram

| Element | Limit |
|---------|-------|
| Max hashtags | 5 (official limit) |
| Recommended hashtags | 3 – 5 |
| Max caption chars | 2,200 |
| Visible before "more" | ~125 chars |

---

## Facebook

| Element | Limit |
|---------|-------|
| Max hashtags | No official limit |
| Recommended hashtags | 1 – 2 |
| Max post chars | 63,206 |
| Ideal for engagement | 40 – 80 chars |

---

## TikTok

| Element | Limit |
|---------|-------|
| Max hashtags | 5 (since August 2025) |
| Recommended hashtags | 3 – 5 |
| Max caption chars | 4,000 |
| Visible before "more" | ~150 chars |

---

## LinkedIn

| Element | Limit |
|---------|-------|
| Max hashtags | No official limit |
| Recommended hashtags | 3 – 5 |
| Max post chars | 3,000 |
| Visible before "more" | ~210 chars |

---

## Twitter/X

| Element | Limit |
|---------|-------|
| Max hashtags | No official limit |
| Recommended hashtags | 1 – 2 |
| Max tweet chars | 280 (standard) / 25,000 (Premium+) |
| Visible before "more" | Full tweet (280 standard) |

---

## YouTube

| Element | Limit |
|---------|-------|
| Max hashtags | 15 (exceeding this causes YouTube to ignore ALL hashtags) |
| Recommended hashtags | 3 – 5 |
| Max title chars | 100 (visible before truncation: ~70) |
| Max description chars | 5,000 |
| Visible before "Show more" | ~100 chars |

> The first 3 hashtags in the description automatically appear above the title as clickable links. For Shorts, use 1 – 5 hashtags.

---

## Pinterest

| Element | Limit |
|---------|-------|
| Max hashtags | 20 per pin |
| Recommended hashtags | 2 – 5 |
| Max pin title chars | 100 |
| Max description chars | 500 |
| Visible before "More" | ~50 chars (desktop) |

> Pinterest has deprioritized hashtags. Focus on keywords as natural sentences within the description for better SEO instead of relying on hashtags.

---

## Threads (Meta)

| Element | Limit |
|---------|-------|
| Max hashtags | 1 per post (topic tag) |
| Recommended hashtags | 1 |
| Max post chars | 500 |
| Max with text attachment | 10,500 (500 + 10,000 expandable) |
| Visible without expanding | First ~1 – 2 lines |

> Threads limits topic tags to one per post. The platform is not hashtag-driven — the algorithm prioritizes content from followed accounts mixed with recommendations.

---

## Usage Tips

- **Hashtags count against character limits** on all platforms
- **Front-load your message** before the "more" truncation point
- On Instagram and TikTok, fewer hashtags now outperform hashtag-stuffing
- On LinkedIn, hashtags at the end of the post perform better than inline
- On Facebook, hashtags have minimal impact on reach — use sparingly

### references/platforms.md

# Platform-Specific Strategy Guide

Detailed strategies for each major social platform.

## Contents
- LinkedIn
- Twitter/X
- Instagram
- TikTok
- Facebook

## LinkedIn

**Best for:** B2B, thought leadership, professional networking, recruiting
**Audience:** Professionals, decision-makers, job seekers
**Posting frequency:** 3-5x per week
**Best times:** Tuesday-Thursday, 7-8am, 12pm, 5-6pm

**What works:**
- Personal stories with business lessons
- Contrarian takes on industry topics
- Behind-the-scenes of building a company
- Data and original insights
- Carousel posts (document format)
- Polls that spark discussion

**What doesn't:**
- Overly promotional content
- Generic motivational quotes
- Links in the main post (kills reach)
- Corporate speak without personality

**Format tips:**
- First line is everything (hook before "see more")
- Use line breaks for readability
- 1,200-1,500 characters performs well
- Put links in comments, not post body
- Tag people sparingly and genuinely

**Algorithm tips:**
- First hour engagement matters most
- Comments > reactions > clicks
- Dwell time (people reading) signals quality
- No external links in post body
- Document posts (carousels) get strong reach
- Polls drive engagement but don't build authority

---

## Twitter/X

**Best for:** Tech, media, real-time commentary, community building
**Audience:** Tech-savvy, news-oriented, niche communities
**Posting frequency:** 3-10x per day (including replies)
**Best times:** Varies by audience; test and measure

**What works:**
- Hot takes and opinions
- Threads that teach something
- Behind-the-scenes moments
- Engaging with others' content
- Memes and humor (if on-brand)
- Real-time commentary on events

**What doesn't:**
- Pure self-promotion
- Threads without a strong hook
- Ignoring replies and mentions
- Scheduling everything (no real-time presence)

**Format tips:**
- Tweets under 100 characters get more engagement
- Threads: Hook in tweet 1, promise value, deliver
- Quote tweets with added insight beat plain retweets
- Use visuals to stop the scroll

**Algorithm tips:**
- Replies and quote tweets build authority
- Threads keep people on platform (rewarded)
- Images and video get more reach
- Engagement in first 30 min matters
- Twitter Blue/Premium may boost reach

---

## Instagram

**Best for:** Visual brands, lifestyle, e-commerce, younger demographics
**Audience:** 18-44, visual-first consumers
**Posting frequency:** 1-2 feed posts per day, 3-10 Stories per day
**Best times:** 11am-1pm, 7-9pm

**What works:**
- High-quality visuals
- Behind-the-scenes Stories
- Reels (short-form video)
- Carousels with value
- User-generated content
- Interactive Stories (polls, questions)

**What doesn't:**
- Low-quality images
- Too much text in images
- Ignoring Stories and Reels
- Only promotional content

**Format tips:**
- Reels get 2x reach of static posts
- First frame of Reels must hook
- Carousels: 10 slides with educational content
- Use all Story features (polls, links, etc.)

**Algorithm tips:**
- Reels heavily prioritized over static posts
- Saves and shares > likes
- Stories keep you top of feed
- Consistency matters more than perfection
- Use all features (polls, questions, etc.)

---

## TikTok

**Best for:** Brand awareness, younger audiences, viral potential
**Audience:** 16-34, entertainment-focused
**Posting frequency:** 1-4x per day
**Best times:** 7-9am, 12-3pm, 7-11pm

**What works:**
- Native, unpolished content
- Trending sounds and formats
- Educational content in entertaining wrapper
- POV and day-in-the-life content
- Responding to comments with videos
- Duets and stitches

**What doesn't:**
- Overly produced content
- Ignoring trends
- Hard selling
- Repurposed horizontal video

**Format tips:**
- Hook in first 1-2 seconds
- Keep it under 30 seconds to start
- Vertical only (9:16)
- Use trending sounds
- Post consistently to train algorithm

---

## Facebook

**Best for:** Communities, local businesses, older demographics, groups
**Audience:** 25-55+, community-oriented
**Posting frequency:** 1-2x per day
**Best times:** 1-4pm weekdays

**What works:**
- Facebook Groups (community)
- Native video
- Live video
- Local content and events
- Discussion-prompting questions

**What doesn't:**
- Links to external sites (reach killer)
- Pure promotional content
- Ignoring comments
- Cross-posting from other platforms without adaptation

### references/post-templates.md

# Post Format Templates

Ready-to-use templates for different platforms and content types.

## Contents
- LinkedIn Post Templates (The Story Post, The Contrarian Take, The List Post, The How-To)
- Twitter/X Thread Templates (The Tutorial Thread, The Story Thread, The Breakdown Thread)
- Instagram Templates (The Carousel Hook, The Reel Script)
- Hook Formulas (Curiosity Hooks, Story Hooks, Value Hooks, Contrarian Hooks, Social Proof Hooks)

## LinkedIn Post Templates

### The Story Post
```
[Hook: Unexpected outcome or lesson]

[Set the scene: When/where this happened]

[The challenge you faced]

[What you tried / what happened]

[The turning point]

[The result]

[The lesson for readers]

[Question to prompt engagement]
```

### The Contrarian Take
```
[Unpopular opinion stated boldly]

Here's why:

[Reason 1]
[Reason 2]
[Reason 3]

[What you recommend instead]

[Invite discussion: "Am I wrong?"]
```

### The List Post
```
[X things I learned about [topic] after [credibility builder]:

1. [Point] — [Brief explanation]

2. [Point] — [Brief explanation]

3. [Point] — [Brief explanation]

[Wrap-up insight]

Which resonates most with you?
```

### The How-To
```
How to [achieve outcome] in [timeframe]:

Step 1: [Action]
↳ [Why this matters]

Step 2: [Action]
↳ [Key detail]

Step 3: [Action]
↳ [Common mistake to avoid]

[Result you can expect]

[CTA or question]
```

---

## Twitter/X Thread Templates

### The Tutorial Thread
```
Tweet 1: [Hook + promise of value]

"Here's exactly how to [outcome] (step-by-step):"

Tweet 2-7: [One step per tweet with details]

Final tweet: [Summary + CTA]

"If this was helpful, follow me for more on [topic]"
```

### The Story Thread
```
Tweet 1: [Intriguing hook]

"[Time] ago, [unexpected thing happened]. Here's the full story:"

Tweet 2-6: [Story beats, building tension]

Tweet 7: [Resolution and lesson]

Final tweet: [Takeaway + engagement ask]
```

### The Breakdown Thread
```
Tweet 1: [Company/person] just [did thing].

Here's why it's genius (and what you can learn):

Tweet 2-6: [Analysis points]

Tweet 7: [Your key takeaway]

"[Related insight + follow CTA]"
```

---

## Instagram Templates

### The Carousel Hook
```
[Slide 1: Bold statement or question]
[Slides 2-9: One point per slide, visual + text]
[Slide 10: Summary + CTA]

Caption: [Expand on the topic, add context, include CTA]
```

### The Reel Script
```
Hook (0-2 sec): [Pattern interrupt or bold claim]
Setup (2-5 sec): [Context for the tip]
Value (5-25 sec): [The actual advice/content]
CTA (25-30 sec): [Follow, comment, share, link]
```

---

## Hook Formulas

The first line determines whether anyone reads the rest.

### Curiosity Hooks
- "I was wrong about [common belief]."
- "The real reason [outcome] happens isn't what you think."
- "[Impressive result] — and it only took [surprisingly short time]."
- "Nobody talks about [insider knowledge]."

### Story Hooks
- "Last week, [unexpected thing] happened."
- "I almost [big mistake/failure]."
- "3 years ago, I [past state]. Today, [current state]."
- "[Person] told me something I'll never forget."

### Value Hooks
- "How to [desirable outcome] (without [common pain]):"
- "[Number] [things] that [outcome]:"
- "The simplest way to [outcome]:"
- "Stop [common mistake]. Do this instead:"

### Contrarian Hooks
- "Unpopular opinion: [bold statement]"
- "[Common advice] is wrong. Here's why:"
- "I stopped [common practice] and [positive result]."
- "Everyone says [X]. The truth is [Y]."

### Social Proof Hooks
- "We [achieved result] in [timeframe]. Here's the full story:"
- "[Number] people asked me about [topic]. Here's my answer:"
- "[Authority figure] taught me [lesson]."

### references/reverse-engineering.md

# Reverse Engineering Viral Content

Instead of guessing what works, systematically analyze top-performing content in your niche and extract proven patterns.

## Contents
- The 6-Step Framework (Niche ID, Scrape, Analyze, Playbook, Layer Voice, Convert)
- The Formula
- Reverse Engineering Checklist

## The 6-Step Framework

### 1. NICHE ID — Find Top Creators

Identify 10-20 creators in your space who consistently get high engagement:

**Selection criteria:**
- Posting consistently (3+ times/week)
- High engagement rate relative to follower count
- Audience overlap with your target market
- Mix of established and rising creators

**Where to find them:**
- LinkedIn: Search by industry keywords, check "People also viewed"
- Twitter/X: Check who your target audience follows and engages with
- Use tools like SparkToro, Followerwonk, or manual research
- Look at who gets featured in industry newsletters

### 2. SCRAPE — Collect Posts at Scale

Gather 500-1000+ posts from your identified creators for analysis:

**Tools:**
- **Apify** — LinkedIn scraper, Twitter scraper actors
- **Phantom Buster** — Multi-platform automation
- **Export tools** — Platform-specific export features
- **Manual collection** — For smaller datasets, copy/paste into spreadsheet

**Data to collect:**
- Post text/content
- Engagement metrics (likes, comments, shares, saves)
- Post format (text-only, carousel, video, image)
- Posting time/day
- Hook/first line
- CTA used
- Topic/theme

### 3. ANALYZE — Extract What Actually Works

Sort and analyze the data to find patterns:

**Quantitative analysis:**
- Rank posts by engagement rate
- Identify top 10% performers
- Look for format patterns (do carousels outperform?)
- Check timing patterns (best days/times)
- Compare topic performance

**Qualitative analysis:**
- What hooks do top posts use?
- How long are high-performing posts?
- What emotional triggers appear?
- What formats repeat?
- What topics consistently perform?

**Questions to answer:**
- What's the average length of top posts?
- Which hook types appear most in top 10%?
- What CTAs drive most comments?
- What topics get saved/shared most?

### 4. PLAYBOOK — Codify Patterns

Document repeatable patterns you can use:

**Hook patterns to codify:**
```
Pattern: "I [unexpected action] and [surprising result]"
Example: "I stopped posting daily and my engagement doubled"
Why it works: Curiosity gap + contrarian

Pattern: "[Specific number] [things] that [outcome]:"
Example: "7 pricing mistakes that cost me $50K:"
Why it works: Specificity + loss aversion

Pattern: "[Controversial take]"
Example: "Cold outreach is dead."
Why it works: Pattern interrupt + invites debate
```

**Format patterns:**
- Carousel: Hook slide → Problem → Solution steps → CTA
- Thread: Hook → Promise → Deliver → Recap → CTA
- Story post: Hook → Setup → Conflict → Resolution → Lesson

**CTA patterns:**
- Question: "What would you add?"
- Agreement: "Agree or disagree?"
- Share: "Tag someone who needs this"
- Save: "Save this for later"

### 5. LAYER VOICE — Apply Direct Response Principles

Take proven patterns and make them yours with these voice principles:

**"Smart friend who figured something out"**
- Write like you're texting advice to a friend
- Share discoveries, not lectures
- Use "I found that..." not "You should..."
- Be helpful, not preachy

**Specific > Vague**
```
❌ "I made good revenue"
✅ "I made $47,329"

❌ "It took a while"
✅ "It took 47 days"

❌ "A lot of people"
✅ "2,847 people"
```

**Short. Breathe. Land.**
- One idea per sentence
- Use line breaks liberally
- Let important points stand alone
- Create rhythm: short, short, longer explanation

```
❌ "I spent three years building my business the wrong way before I finally realized that the key to success was focusing on fewer things and doing them exceptionally well."

✅ "I built wrong for 3 years.

Then I figured it out.

Focus on less.
Do it exceptionally well.

Everything changed."
```

**Write from emotion**
- Start with how you felt, not what you did
- Use emotional words: frustrated, excited, terrified, obsessed
- Show vulnerability when authentic
- Connect the feeling to the lesson

```
❌ "Here's what I learned about pricing"

✅ "I was terrified to raise my prices.

My hands were shaking when I sent the email.

Here's what happened..."
```

### 6. CONVERT — Turn Attention into Action

Bridge from engagement to business results:

**Soft conversions:**
- Newsletter signups in bio/comments
- Free resource offers in follow-up comments
- DM triggers ("Comment X and I'll send you...")
- Profile visits → optimized profile with clear CTA

**Direct conversions:**
- Link in comments (not post body on LinkedIn)
- Contextual product mentions within valuable content
- Case study posts that naturally showcase your work
- "If you want help with this, DM me" (sparingly)

---

## The Formula

```
1. Find what's already working (don't guess)
2. Extract the patterns (hooks, formats, CTAs)
3. Layer your authentic voice on top
4. Test and iterate based on your own data
```

## Reverse Engineering Checklist

- [ ] Identified 10-20 top creators in niche
- [ ] Collected 500+ posts for analysis
- [ ] Ranked by engagement rate
- [ ] Documented top 10 hook patterns
- [ ] Documented top 5 format patterns
- [ ] Documented top 5 CTA patterns
- [ ] Created voice guidelines (specificity, brevity, emotion)
- [ ] Built template library from patterns
- [ ] Set up tracking for your own content performance

### references/short-form-video.md

# Short-Form Video: Hooks, Scripts & Strategy

Detailed reference for creating short-form video content on TikTok, Instagram Reels, and YouTube Shorts.

---

## Video Hook Library

### Curiosity Hooks (Best for engagement)

**The "Secret" Formula:**
- "The secret to [outcome] that nobody talks about"
- "I found the hidden feature in [product/platform] that changes everything"
- "I can't believe this actually works..."

**The Unexpected Discovery:**
- "I tried [thing] for 30 days and I was NOT expecting this"
- "This completely changed how I think about [topic]"
- "Nobody talks about this, but..."

**The Question:**
- "Why does nobody talk about this?"
- "Am I the only one who didn't know this?"
- "The reason [common thing] doesn't work is..."

### Value Hooks (Best for saves)

**The Promise:**
- "How to [achieve outcome] in [specific timeframe]"
- "[Number] [things] that will [benefit]"
- "Everything you need to know about [topic] in 60 seconds"

**The Hack/Shortcut:**
- "[Outcome] hack that actually works"
- "The [adjective] way to [outcome]"
- "If you're struggling with [problem], watch this"

**The Warning:**
- "Stop doing [common practice] — here's why"
- "[Number] mistakes that are killing your [results]"
- "Why [thing you think is good] is actually hurting you"

### Story Hooks (Best for watch time)

**The Transformation:**
- "3 months ago, I [bad state]. Today, I [good state]."
- "Here's how I went from [before] to [after]"
- "I used to think [old belief]. Then [event] changed everything."

**The Failure:**
- "I made a huge mistake with [topic]"
- "Here's why I stopped [common practice]"
- "I lost [something significant] because of this mistake"

**The Journey:**
- "So this just happened..."
- "This changed everything for me"
- "Let me tell you about the time I [interesting situation]"

### Controversial Hooks (Best for comments)

- "Unpopular opinion: [bold statement]"
- "[Common advice] is actually wrong"
- "I'm going to get hate for this, but..."
- "Most [audience] get this completely wrong"

---

## Scripting Template

```markdown
## Video: [Working Title]

**Platform:** TikTok / Reels / Shorts
**Length:** XX seconds
**Format:** [Talking head / Slideshow / Demo / Screen recording]

### Hook (0-3 sec)
- Visual: [What viewer sees]
- Audio: [What they hear]
- Text overlay: [On-screen text]

### Body (3-X sec)
- [Timestamp] - [What happens/what you say]
- [Timestamp] - [Next beat]
- [Continue...]

### CTA (final 3-5 sec)
- Verbal: [What you say]
- Text: [On-screen text]
- Action: [Follow, comment, link in bio, etc.]

### Production Notes
- Music/sound: [Trending sound or music choice]
- B-roll needed: [List any clips needed]
- Graphics: [Any text animations or overlays]
```

---

## Additional Video Structures

### The Story Arc (45-60 sec)

```
[0-3s]  Hook: Tease the outcome
[3-15s] Setup: Context and stakes
[15-45s] Journey: What happened
[45-55s] Resolution: The result
[55-60s] Lesson/CTA
```

Best for: Personal stories, case studies, testimonials

### The POV/Skit (15-30 sec)

```
[0-3s]  Setup: Text overlay sets the scene
[3-25s] Performance: Act out the relatable scenario
[25-30s] Punchline or twist
```

Best for: Relatable content, humor, niche communities

---

## Visual Patterns

### Talking Head
- Good lighting (ring light or window light)
- Eye contact with camera
- Hand gestures for emphasis
- Interesting background (bookshelf, plants, studio setup)

### Slideshow/Carousel Video
- Strong visual on each slide (2-4 seconds per slide)
- Text overlays with key points
- Consistent style/branding
- Voiceover or trending sound

### Screen Recording
- Zoom in on important areas
- Add cursor highlight or click animations
- Keep movements smooth and intentional
- Overlay your face in corner (optional but boosts engagement)

### B-Roll Heavy
- Show don't tell
- Quick cuts (1-3 seconds per shot)
- Match cuts to voiceover beats
- Mix wide, medium, and close-up shots

---

## Audio Strategy

### When to Use Trending Sounds
- Entertainment/lifestyle content where the sound fits your message
- When the trend is still rising (check platform trending pages)
- Don't use when it distracts from your message or is already declining

### When to Use Original Audio
- Educational content where you're speaking
- Storytimes and personal narratives
- Product demos and tutorials
- Building a recognizable brand voice

### Voiceover Tips
- Speak slightly faster than normal conversation
- Vary your tone — avoid monotone delivery
- Pause for emphasis on key points
- Record in a quiet space, use noise removal
- AI voices work for faceless content (ElevenLabs, etc.)

### Music Selection
- Match energy to content (upbeat for tips, emotional for stories)
- Avoid copyrighted music on Reels/Shorts
- Use platform music libraries for safety
- Lower music volume under voiceover (ducking)

---

## Posting Strategy

### Optimal Posting Times (test your audience)

| Platform | Best Times (local) |
|----------|-------------------|
| TikTok | 7-9 AM, 12-3 PM, 7-11 PM |
| Reels | 9 AM, 12 PM, 7-9 PM |
| Shorts | 12-3 PM, 7-9 PM |

### Frequency Recommendations

| Goal | Minimum | Optimal |
|------|---------|---------|
| Growing | 1/day | 2-4/day |
| Maintaining | 3/week | 1/day |
| Testing | 2/week | 5/week |

### Batch Creation Workflow

1. **Ideate** (30 min): Generate 10-20 concepts
2. **Script** (1 hour): Write scripts for 5-10 videos
3. **Batch film** (2 hours): Record all talking head content
4. **Edit** (2-3 hours): Edit and add captions
5. **Schedule** (30 min): Queue for optimal times

---

## Analytics & Iteration

### Metrics That Matter

| Metric | What It Tells You |
|--------|-------------------|
| Watch time % | Is content engaging throughout? |
| Completion rate | Did hook + content deliver? |
| Saves | Is content valuable enough to revisit? |
| Shares | Is content worth spreading? |
| Comments | Did content spark conversation? |
| Follows | Did viewer want more from you? |

### What to Test

1. **Hooks**: Same content, different opening
2. **Length**: 15 sec vs 30 sec vs 60 sec
3. **Format**: Talking head vs slideshow vs demo
4. **Time**: Morning vs afternoon vs evening
5. **CTA**: Different calls to action

### When to Pivot

- 5+ videos with <1% completion rate → change hooks
- High views but low follows → check CTA and content-audience fit
- High saves but low shares → content is valuable but not social
- Lots of comments but negative → lean into controversy or adjust tone

