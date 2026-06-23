---
name: cold-email
description: "Write B2B cold emails and follow-up sequences that get replies. Use when the user wants to write cold outreach emails, prospecting emails, cold email campaigns, sales development emails, or SDR emails. Also use when the user mentions \"cold outreach,\" \"prospecting email,\" \"outbound email,\" \"email to leads,\" \"reach out to prospects,\" \"sales email,\" \"follow-up email sequence,\" \"nobody's replying to my emails,\" or \"how do I write a cold email.\" Covers subject lines, opening lines, body copy, CTAs, personalization, and multi-touch follow-up sequences. For warm/lifecycle email sequences, see emails. For sales collateral beyond emails, see sales-enablement."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Cold Email Writing

You are an expert cold email writer. Your goal is to write emails that sound like they came from a sharp, thoughtful human — not a sales machine following a template.

## Before Writing

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Understand the situation (ask if not provided):

1. **Who are you writing to?** — Role, company, why them specifically
2. **What do you want?** — The outcome (meeting, reply, intro, demo)
3. **What's the value?** — The specific problem you solve for people like them
4. **What's your proof?** — A result, case study, or credibility signal
5. **Any research signals?** — Funding, hiring, LinkedIn posts, company news, tech stack changes

Work with whatever the user gives you. If they have a strong signal and a clear value prop, that's enough to write. Don't block on missing inputs — use what you have and note what would make it stronger.

---

## Writing Principles

### Write like a peer, not a vendor

The email should read like it came from someone who understands their world — not someone trying to sell them something. Use contractions. Read it aloud. If it sounds like marketing copy, rewrite it.

### Every sentence must earn its place

Cold email is ruthlessly short. If a sentence doesn't move the reader toward replying, cut it. The best cold emails feel like they could have been shorter, not longer.

### Personalization must connect to the problem

If you remove the personalized opening and the email still makes sense, the personalization isn't working. The observation should naturally lead into why you're reaching out.

See [personalization.md](references/personalization.md) for the 4-level system and research signals.

### Lead with their world, not yours

The reader should see their own situation reflected back. "You/your" should dominate over "I/we." Don't open with who you are or what your company does.

### One ask, low friction

Interest-based CTAs ("Worth exploring?" / "Would this be useful?") beat meeting requests. One CTA per email. Make it easy to say yes with a one-line reply.

---

## Voice & Tone

**The target voice:** A smart colleague who noticed something relevant and is sharing it. Conversational but not sloppy. Confident but not pushy.

**Calibrate to the audience:**

- C-suite: ultra-brief, peer-level, understated
- Mid-level: more specific value, slightly more detail
- Technical: precise, no fluff, respect their intelligence

**What it should NOT sound like:**

- A template with fields swapped in
- A pitch deck compressed into paragraph form
- A LinkedIn DM from someone you've never met
- An AI-generated email (avoid the telltale patterns: "I hope this email finds you well," "I came across your profile," "leverage," "synergy," "best-in-class")

---

## Structure

There's no single right structure. Choose a framework that fits the situation, or write freeform if the email flows naturally without one.

**Common shapes that work:**

- **Observation → Problem → Proof → Ask** — You noticed X, which usually means Y challenge. We helped Z with that. Interested?
- **Question → Value → Ask** — Struggling with X? We do Y. Company Z saw [result]. Worth a look?
- **Trigger → Insight → Ask** — Congrats on X. That usually creates Y challenge. We've helped similar companies with that. Curious?
- **Story → Bridge → Ask** — [Similar company] had [problem]. They [solved it this way]. Relevant to you?

For the full catalog of frameworks with examples, see [frameworks.md](references/frameworks.md).

---

## Subject Lines

Short, boring, internal-looking. The subject line's only job is to get the email opened — not to sell.

- 2-4 words, lowercase, no punctuation tricks
- Should look like it came from a colleague ("reply rates," "hiring ops," "Q2 forecast")
- No product pitches, no urgency, no emojis, no prospect's first name

See [subject-lines.md](references/subject-lines.md) for the full data.

---

## Follow-Up Sequences

Each follow-up should add something new — a different angle, fresh proof, a useful resource. "Just checking in" gives the reader no reason to respond.

- 3-5 total emails, increasing gaps between them
- Each email should stand alone (they may not have read the previous ones)
- The breakup email is your last touch — honor it

See [follow-up-sequences.md](references/follow-up-sequences.md) for cadence, angle rotation, and breakup email templates.

---

## Quality Check

Before presenting, gut-check:

- Does it sound like a human wrote it? (Read it aloud)
- Would YOU reply to this if you received it?
- Does every sentence serve the reader, not the sender?
- Is the personalization connected to the problem?
- Is there one clear, low-friction ask?

---

## What to Avoid

- Opening with "I hope this email finds you well" or "My name is X and I work at Y"
- Jargon: "synergy," "leverage," "circle back," "best-in-class," "leading provider"
- Feature dumps — one proof point beats ten features
- HTML, images, or multiple links
- Fake "Re:" or "Fwd:" subject lines
- Identical templates with only {{FirstName}} swapped
- Asking for 30-minute calls in first touch
- "Just checking in" follow-ups

---

## Data & Benchmarks

The references contain performance data if you need to make informed choices:

- [benchmarks.md](references/benchmarks.md) — Reply rates, conversion funnels, expert methods, common mistakes
- [personalization.md](references/personalization.md) — 4-level personalization system, research signals
- [subject-lines.md](references/subject-lines.md) — Subject line data and optimization
- [follow-up-sequences.md](references/follow-up-sequences.md) — Cadence, angles, breakup emails
- [frameworks.md](references/frameworks.md) — All copywriting frameworks with examples

Use this data to inform your writing — not as a checklist to satisfy.

---

## Related Skills

- **prospecting**: For building and qualifying the prospect list that this skill writes outreach against — the natural upstream step before cold-email
- **copywriting**: For landing pages and web copy
- **emails**: For lifecycle/nurture email sequences (not cold outreach)
- **social**: For LinkedIn and social posts
- **product-marketing**: For establishing foundational positioning
- **revops**: For lead scoring, routing, and pipeline management

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/benchmarks.md

# Benchmarks, Data & Expert Methods

## Core Performance Metrics (2024–2025)

| Metric                     | Average | Good   | Excellent | Source                   |
| -------------------------- | ------- | ------ | --------- | ------------------------ |
| Open rate                  | 27.7%   | 40–45% | 50%+      | Belkins, Snov.io         |
| Reply rate                 | 4–5.8%  | 5–10%  | 10–15%    | Belkins, Reachoutly      |
| Reply rate (best-in-class) | —       | —      | 15–25%+   | Digital Bloom, Instantly |
| Positive reply %           | ~48%    | 55–60% | 62–65%    | Digital Bloom            |
| Meeting booking rate       | 0.5–1%  | 1–2%   | 2.3%+     | Reachoutly               |
| Bounce rate                | 7.5%    | <4%    | <2%       | Belkins                  |

## Realistic Funnel Model

500 emails → 100 opens (20%) → 25 replies (5%) → 8 positive replies (30%) → 4 meetings (50%) → 1 client (25% close). ~**0.2% end-to-end conversion** for average performers.

## Performance Levers (ranked by impact)

1. **Hook type** — Timeline hooks outperform problem hooks by 3.4x in meetings
2. **Personalization depth** — Up to 250% more replies
3. **Brevity** — 25–75 words optimal, 83% more replies under 75 words
4. **Targeting precision** — ≤50 contacts per campaign = 2.76x higher reply rates
5. **Follow-up strategy** — First follow-up adds 49% more replies
6. **Reading level** — 3rd–5th grade = 67% more replies
7. **Send timing** — Thursday peaks at 6.87% reply rate

## Declining Effectiveness Trend

Reply rates dropped from 7–8% (2020–2022) to 4–5.8% (2024–2025), ~15% YoY decline. Drivers: inbox saturation (10+ cold emails/week, 20% say none relevant), stricter anti-spam (Google's threshold: 0.1% complaints), AI email flood (more volume, less quality signal). Writing craft matters more, not less — gap between average and excellent is widening.

## Response Rates by Seniority

- **Entry-level:** Highest engagement at 8% reply, 50% open
- **C-level:** 23% more likely to respond than non-C-suite when they engage (6.4% vs 5.2%)
- **CTOs/VP Tech:** 7.68% reply
- **CEOs/Founders:** 7.63% reply
- **Heads of Sales:** 6.60% (most targeted role, highest saturation)

## Industry Variation

**Highest responding:** Nonprofits (16.5%+), legal (10%), EdTech (7.8%), chemical (7.3%), manufacturing (6.1%).
**Lowest responding:** SaaS (3.5%), financial services (3.4%), IT services (3.5%).

## Top 15 Mistakes (ranked by impact)

1. **Too long** — 70% of emails above 10th-grade level. Under 75 words = 83% more replies
2. **Too self-focused** — "We are a leading..." signals sales pitch. Count I/We sentences
3. **No clear value prop** — 71% of decision-makers ignore irrelevant emails
4. **Generic templates** — {{FirstName}} isn't personalization. Recipients detect instantly
5. **Feature dumping** — "Great reps lead with problems" (Lavender). One proof point beats ten features
6. **False personalization** — "Loved your post!" without specifics is transparent
7. **Asking too much too soon** — 30-min call in first email = "proposing on first date"
8. **Pushy language** — "Act Now" stacking increases spam flagging by 67%
9. **No CTA** — Without a clear next step, momentum dies
10. **"Just checking in" follow-ups** — "I never heard back" = 12% drop in bookings
11. **Wrong tone for audience** — Founder ≠ RevOps lead ≠ sales leader
12. **Jargon/buzzwords** — "Leverage synergistic platform" → "We help you book more meetings"
13. **Unsubstantiated claims** — "300% more leads" without proof triggers skepticism
14. **Too many contacts per company** — 1–2 people = 7.8% reply; 10+ = 3.8%
15. **Fake urgency** — Fake "Re:" / "Fwd:" / countdown timers destroy trust

## Cultural Calibration

| Factor       | US              | UK                       | Germany/DACH         | Scandinavia             |
| ------------ | --------------- | ------------------------ | -------------------- | ----------------------- |
| Tone         | Direct, casual  | Polite, professional     | Precise, data-driven | Fact-based, egalitarian |
| Length       | Shorter, blunt  | Longer, insight-led      | Detail-oriented      | Concise but substantive |
| Social proof | Outcome numbers | Research-led credibility | Technical precision  | Shared values           |

North America: 4.1% response. Europe: 3.1%. Asia-Pacific: 2.8%. Shorter, more direct sequences work better in US. UK needs more insight/personality. GDPR affects European tone.

## Expert Quick Reference

| Expert         | Core Method                                                     | Best For                                        |
| -------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| Alex Berman    | 3C's: Compliment → Case Study → CTA                             | High-ticket B2B services, agencies              |
| Josh Braun     | "Poke the Bear" — neutral questions exposing invisible problems | Empathy-driven consultative selling             |
| Kyle Coleman   | Systematic research + AI personalization at scale               | Bridging mass outreach and deep personalization |
| Becc Holland   | Psychographic personalization, Premise Buckets                  | Combining personalization with relevance        |
| Will Allred    | Data-driven coaching, Mouse Trap, Vanilla Ice Cream             | Any context; universal frameworks               |
| Justin Michael | 1–3 sentence hyper-brevity, quote their own words               | High-velocity SDR teams at scale                |
| Sam Nelson     | Agoge Sequence — Triple on Day 1 (email + LinkedIn + call)      | Multi-channel, tiered personalization           |

### references/follow-up-sequences.md

# Follow-Up Sequences

55% of replies come from follow-ups, not the initial email. Yet 48% of salespeople never follow up even once.

## How Many: 3–5 Total Emails

- Highest single-email reply rate: **8.4%** (Belkins).
- 4–7 email campaigns achieve **27% reply rates** vs 9% for 1–3 emails (Woodpecker, 20M emails).
- By 4th follow-up, response rates drop **55%** and spam complaints **triple**.
- Resolution: longer sequences catch different timing windows. Cap at 4 follow-ups (5 total emails). Each must add genuinely new value.

## Optimal Cadence

Increase the gap between each touch:

| Touch         | Day   | Notes                                          |
| ------------- | ----- | ---------------------------------------------- |
| Initial email | 0     | Maximum personalization investment             |
| Follow-up 1   | 3     | Waiting 3 days increases response by up to 31% |
| Follow-up 2   | 7–8   | Different angle                                |
| Follow-up 3   | 14    | New value piece                                |
| Follow-up 4   | 21–28 | Breakup email                                  |

**Best days:** Tuesday–Thursday (Thursday peaks at 6.87% reply rate).
**Best times:** 9–11 AM or 1–3 PM in prospect's local time.
**Avoid:** Monday mornings (inbox overload), Friday afternoons (checked out).

## Angle Rotation

Each follow-up must stand alone while building toward the goal. Never just "bump this up."

| Email       | Angle                                                      | Purpose                    |
| ----------- | ---------------------------------------------------------- | -------------------------- |
| Initial     | Personalized hook + core value prop + soft CTA             | Introduce problem/solution |
| Follow-up 1 | Different angle, new value piece (stat, insight, resource) | Show additional benefit    |
| Follow-up 2 | Social proof / case study from similar company             | Build credibility          |
| Follow-up 3 | New insight, industry trend, or relevant resource          | Demonstrate expertise      |
| Follow-up 4 | Breakup — acknowledge silence, leave door open             | Trigger loss aversion      |

Add only **one new value proposition per email** (SalesBread). This naturally forces different angles.

## The Breakup Email

Leverages loss aversion — removing pressure while creating scarcity through withdrawal. Close.com reports **10–15% response rates** from breakup emails with cold prospects.

**Structure:**

1. Acknowledge you've reached out multiple times
2. Validate their potential lack of interest
3. State this is your final email for now
4. Leave the door open

**Example:**

> I haven't heard back, so I'll assume now isn't the right time. Before I close the loop: [1-sentence insight or resource]. If that changes things, feel free to reply. Otherwise, no hard feelings — good luck with [their goal].

**1-2-3 Format** (reduces friction to near zero):

> Since I haven't heard back, I'll keep it simple. Reply with a number:
>
> 1 — Interested, let's talk
> 2 — Not now, check back in 3 months
> 3 — Not interested, please stop

**Critical rule:** If you send a breakup email, honor it. Do not contact the prospect again.

## Phrases That Kill Response Rates

- "I never heard back" → **12% drop** in meeting booking rate (Gong)
- "Just checking in" → Zero value, signals laziness
- "Bumping this to the top of your inbox" → Presumptuous
- "Did you see my last email?" → Guilt-tripping
- "Following up on my previous message" → Generic, adds nothing

## CTA Adjustment by Seniority

**Executives/founders:** Ultra-low-effort, curiosity-driven. "Curious?" or "Worth 2 min?"

**Mid-level managers:** More specific value. "Want me to walk through how [Company] saved 15 hours/week?"

Higher in the org chart = less friction you can ask for.

### references/frameworks.md

# Cold Email Copywriting Frameworks

Frameworks beat templates — they teach thinking patterns, not copy-paste shortcuts.

## PAS — Problem, Agitate, Solution (default)

**Structure:** Identify pain → Amplify consequences → Present solution + soft CTA.
**Best for:** Problem-aware but not solution-aware prospects. The workhorse framework.

> Most VP Sales at companies your size spend 5+ hours/week on manual CRM reporting. That's 250+ hours/year not spent coaching reps — and often means inaccurate forecasts reaching leadership. We built a tool that auto-generates CRM reports in real time. Teams like Datadog reduced reporting time by 80%. Would it make sense to see how?

## BAB — Before, After, Bridge

**Structure:** Current painful situation → Ideal future → Your product as the bridge.
**Best for:** Transformation-driven offers with clear before/after. Emotional decision-makers.

> Right now, your team is likely spending hours manually sourcing leads — feast or famine each quarter. Imagine qualified leads arriving daily on autopilot, reps spending 100% of their time selling. That's what our platform does. Companies like HubSpot saw a 40% pipeline increase within 90 days. Can I show you how?

## QVC — Question, Value, CTA

**Structure:** Targeted pain question → Brief value → Direct next step.
**Best for:** C-suite prospects who prefer brevity. Qualify interest immediately.

> Are your SDRs spending more time researching than selling? We help sales teams automate prospect research so reps focus on conversations. Clients see 3x more meetings per rep per week. Worth a 10-minute demo?

## AIDA — Attention, Interest, Desire, Action

**Structure:** Hook/stat → Address specific challenge → Social proof/outcome → Clear CTA.
**Best for:** Data-driven prospects, high-ticket pitches with strong stats.

> Companies in pharma lose 30% of leads due to manual outreach. Given {{Company}}'s growth this quarter, pipeline velocity is likely top of mind. Customers like Pfizer use our platform to automate lead qualification — cutting time-to-contact by 60%. Worth a 15-minute call?

## PPP — Praise, Picture, Push

**Structure:** Genuine compliment → How things could be better → Gentle push to action.
**Best for:** Senior prospects who respond to relationship-building. Requires genuine trigger.

> Your keynote on scaling SDR teams was spot-on — especially on ramp time as the hidden cost. What if you could cut that in half? Our in-inbox coach helps new reps write effective emails from day one with real-time scoring. Open to a quick chat about how this could support your growth?

## Star-Story-Solution

**Structure:** Introduce character (customer) → Tell challenge narrative → Reveal results.
**Best for:** Strong customer success stories. Humanizes the pitch.

> Last year, Sarah — VP Sales at a Series B startup — had 5 SDRs competing against a rival with 20. Her team was getting crushed on volume. They adopted our AI prospecting tool and sent hyper-personalized emails at 3x pace without losing quality. Within 90 days, they booked more meetings than their competitor's entire team. Happy to share how this could work for {{Company}}.

## SCQ — Situation, Complication, Question

**Structure:** Current reality → Complicating challenge → Question that speaks to need → Optional answer.
**Best for:** Consultative selling. Mirrors how professionals present to leadership.

> Your team doubled this year. That usually means onboarding is eating into selling time. How are you handling ramp for new hires?

## ACCA — Awareness, Comprehension, Conviction, Action

**Structure:** Contrarian hook → Explain benefit simply → Provide proof → Strong CTA.
**Best for:** Analytical buyers who need evidence (engineers, CFOs, ops leaders).

> Most sales teams measure rep activity. The top 5% measure rep efficiency instead. When Acme switched, they booked 40% more meetings with fewer emails. Worth seeing how?

## 3C's (Alex Berman)

**Structure:** Compliment → Case Study → CTA.
**Best for:** Agency/services cold outreach. Case study does the heavy lifting.

> Big fan of [Company]. We just built an app for [Competitor] that does XYZ. I have a few more ideas. Interested?

## Mouse Trap (Lavender/Will Allred)

**Structure:** Observation + Binary value-prop question. 1–2 sentences total.
**Best for:** Maximum brevity. Impulsive reply based on curiosity.

> Looks like you're hiring reps. Would it be helpful to get a more granular look at how they're ramping on email?

## Justin Michael Method

**Structure:** Trigger/Pain → Solution hint → Binary CTA. 1–3 sentences, no intro.
**Best for:** High-velocity SDR teams. Mobile-optimized. Deliberately polarizing.

Spend max 1 minute on personalization. Use industry/persona-level signals. For top-tier prospects, quote their own words from interviews — they almost always respond.

## Vanilla Ice Cream (Lavender)

**Structure:** Observation → Problem/Insight → Credibility → Solution → Call-to-Conversation.
**Best for:** Universal "base" framework that works everywhere. Five parts.

## PASTOR (Ray Edwards)

**Structure:** Problem → Amplify → Story → Testimony → Offer → Response.
**Best for:** Longer-form or multi-email sequences. Consulting, education, complex B2B services. Each element can be developed across separate touches.

### references/personalization.md

# Personalization at Scale

Personalization drives **50–250% more replies** (Lavender). The key insight: **if your personalization has nothing to do with the problem you solve, it's just an attention hack** (Clay).

## Four Levels of Personalization

### Level 1 — Basic (merge tags)

First name, company name, job title. Table stakes, no longer differentiating. ~5% lift.

### Level 2 — Industry/segment

Industry-specific pain points, trends, regulatory challenges. Scalable via micro-segmentation.

> Most {{industry}} teams struggle with {{lead gen problem}}, which often leads to wasted effort.

### Level 3 — Role-level

Challenges specific to their role and seniority.

> As Head of Sales, keeping pipeline steady is probably your biggest headache. Your RevOps team is small, so you're likely wearing multiple hats during scaling.

### Level 4 — Individual (gold standard)

Specific, timely observations about that person connected to the problem you solve.

> Noticed you're hiring 3 SDRs — sounds like you're scaling outbound fast. Most teams hit follow-up fatigue during onboarding.

## Research Signal Stack

| Signal            | Where to find it                   | How to use it                                                                |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| Recent funding    | Crunchbase, LinkedIn, press        | "Congrats on Series B — scaling teams fast usually creates X challenge"      |
| Job postings      | LinkedIn Jobs, careers page        | "Noticed you're hiring 3 SDRs — sounds like you're scaling outbound"         |
| Tech stack        | BuiltWith, Wappalyzer, HG Insights | "I see you're using HubSpot — most teams at your stage hit a ceiling with X" |
| LinkedIn activity | Posts, comments, job changes       | "Really enjoyed your post about X"                                           |
| Company news      | Google News, press releases        | "Congrats on acquiring X — integrating teams usually creates Y challenge"    |
| Podcast/talks     | Google, YouTube, podcasts          | "Caught your talk at SaaStr on X — really insightful"                        |
| Website changes   | Manual review                      | "Your new pricing page caught my eye — curious how it's converting"          |

## The 3-Minute Personalization System

From "30 Minutes to President's Club":

**Step 1:** Build a research stack of top 10 buying signals — 5 company triggers, 5 person triggers. Stack-rank by relevance.

**Step 2:** Build a 3x3 template: (1) personalization attached to a problem, (2) problem you solve, (3) one-sentence solution + low-friction CTA.

**Step 3:** Create 5 "trigger templates" — pre-written personalization paragraphs for each trigger, with a smooth segue into the problem.

The personalization must logically connect to the problem. This creates 5 reusable triggers with the rest of the email constant. A top SDR writes a personalized email in **under 3 minutes**.

## The Four -Graphic Principles (Becc Holland)

- **Demographic** — Age, profession, background
- **Technographic** — Tech stack, tools used
- **Firmographic** — Company size, funding, industry, growth stage
- **Psychographic** — Values, passions, beliefs (highest-impact dimension)

Tapping into what prospects are passionate about drives significantly higher response rates.

## Observation-Based Openers (highest performing)

**Trigger-event:** "Congrats on the recent funding round — scaling the team from here is exciting, and I imagine [challenge] is top of mind."

**Observation:** "Your recent post about [topic] resonated — especially the part about [detail]. Got me thinking about how that applies to [challenge]."

**Industry insight:** "Most [role titles] I talk to spend [X hours/week] on [problem] — curious if that matches your experience at [Company]."

## What Feels Fake (avoid)

- AI-generated emails with similar phrasing ("I hope this email finds you well")
- Generic attention hacks disconnected from problem ("Cool that you went to UCLA!" → pitch)
- Over-personalizing to creepiness
- "I saw your LinkedIn profile and wanted to reach out" — signals mass automation

## The "So What?" Test

After writing any opening line, read from prospect's perspective: "So what? Why would I care?" If the answer is nothing, rewrite.

### references/subject-lines.md

# Subject Line Optimization

The subject line determines whether the email gets read. The data is counterintuitive: **short, boring, internal-looking subject lines win decisively.**

## Length: 2–4 words

- 2-word subject lines get **60% more opens** than 5-word (Lavender).
- Going from 2 to 4 words reduces replies by **17.5%**.
- 2–4 words yield **46% open rates** vs 34% for 10 words (Belkins, 5.5M emails).
- Mobile truncates at 30–35 characters — brevity is practical necessity.

## Internal Camouflage Principle

Subject lines that look like they came from a colleague, not a vendor, double open rates (Gong). Buyers mentally categorize before opening — if it looks like sales, it's filtered.

**High-performing examples:** "reply rates" · "trial delays" · "hiring ops" · "employee turnover" · "Q2 forecast" · "new patients" · "personalization issue" · "second page"

## Capitalization: lowercase wins

All-lowercase has highest open rates (Gong, 85M+ emails). Lowercase looks more personal/internal. For cold outreach specifically, lowercase beats title case.

## Personalization: context over name

Personalized subject lines boost opens **26–50%**, but type matters:

- **First name in subject line → 12% fewer replies.** Signals automation.
- **Contextual personalization works:** pain points, competitors, trigger events, industry challenges.
- Use {{painPoint}}, {{competitor}}, {{commonGround}} — not {{firstName}}.

## Questions: only when highly specific

Data conflicts: Belkins says questions perform well (46% open rate). Lavender says questions lower opens by **56%**. Resolution: **specific pain questions work** ("Need help with {{challenge}}?"), **generic questions fail** ("Quick question?" / "Have 15 minutes?"). Default to statements.

## What to Avoid

| Anti-pattern                                   | Impact                      |
| ---------------------------------------------- | --------------------------- |
| Salesy language ("increase," "boost," "ROI")   | -17.9% opens                |
| Urgency words ("ASAP," "urgent")               | Below 36% opens             |
| Excessive punctuation ("!!!" or "??")          | -36% opens                  |
| Numbers and percentages                        | -46% opens                  |
| Emojis                                         | Hurt B2B professionalism    |
| Pitching product in subject                    | -57% replies                |
| Empty/no subject line                          | +30% opens but -12% replies |
| Spam triggers ("free," "guarantee," "act now") | Deliverability risk         |

## C-Suite Subject Lines

Executives receive 300–400 emails daily, decide in seconds. They respond **23% more often** than non-C-suite when emails pass their filter (6.4% reply rate).

What works: ultra-concise, human, understated. "{{companyInitiative}}" · "thank you" · "an update" · "a question" · reference to a specific project or trigger event.

Anything "salesy" is immediately rejected.

