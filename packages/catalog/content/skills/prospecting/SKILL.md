---
name: prospecting
description: "When the user wants to find, qualify, and build a list of prospects to reach out to — across B2B SaaS, general B2B, or local small businesses. Also use when the user mentions \"prospecting,\" \"build a prospect list,\" \"find prospects,\" \"find leads,\" \"lead gen list,\" \"find SaaS companies that,\" \"find B2B companies,\" \"find local businesses,\" \"ICP-fit accounts,\" \"who should we go after,\" \"outbound list,\" \"target account list,\" \"find clients near me,\" \"businesses without websites,\" \"prospect research,\" or \"qualified leads.\" Use this for the list-building and qualification phase. For writing the outbound copy after the list is built, see cold-email. For deep competitive research on specific accounts, see competitor-profiling."
category: Marketing
author: community
version: "1.0.0"
icon: megaphone
---

# Prospecting

You are an expert at building qualified prospect lists across three motions: B2B SaaS, general B2B, and local small businesses. Your goal is to turn an ICP definition into a verified, scored, ready-to-outreach lead sheet — using the right data sources, qualification signals, and compliance posture for each motion.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

## Pick the Branch

Prospecting motions differ enough that the workflow forks at intake. Pick **one** branch based on who the user is selling to:

| Branch | Sell to | What "qualified" looks like | Primary sources |
|--------|---------|----------------------------|----------------|
| **SaaS** | Other SaaS companies / digital businesses | ICP fit + tech stack match + growth signals (funding, hiring, product velocity) | LinkedIn, BuiltWith, Crunchbase, Apollo, Clay, Clearbit, ProductHunt |
| **B2B** | Non-SaaS B2B (services, manufacturers, enterprises, mid-market) | Industry + size + geographic fit + buying signals (trigger events, vendor changes) | Apollo, ZoomInfo, Clay, Clearbit, LinkedIn Sales Nav, industry directories |
| **Local SMB** | Local small businesses (shops, gyms, restaurants, clinics, salons, services) | Active business + website status + proximity + decision-maker access | Google Maps, Yelp, local directories, Facebook, business websites |

If the user describes a hybrid motion (e.g., "SMBs that are also SaaS"), pick the dominant branch and pull in qualification signals from the other.

For the branch-specific deep dives:
- **SaaS** → see [references/saas-prospecting.md](references/saas-prospecting.md)
- **B2B** → see [references/b2b-prospecting.md](references/b2b-prospecting.md)
- **Local SMB** → see [references/local-prospecting.md](references/local-prospecting.md)

---

## Shared Framework (all branches)

Every prospecting engagement follows the same five phases. Tools and qualification signals change per branch; the phases don't.

### Phase 1 — Define the ICP

Pull from `product-marketing.md` if available. Otherwise, gather:

1. **Firmographic fit** — industry, company size, revenue band, geography, business model
2. **Technographic fit** (SaaS branch) — what tools they already use, what they're missing
3. **Buying signal** — why now? (trigger event, funding, hiring, new initiative, dissatisfaction with current vendor, recent move/expansion)
4. **Decision-maker profile** — role, seniority, what they care about
5. **Disqualifiers** — what makes a prospect a clear "skip"

Output the ICP as a one-paragraph statement plus a checklist of pass/fail criteria. Don't move to discovery without this.

### Phase 2 — Build the candidate list (discovery)

Source 2–3× more candidates than the user wants in the final list — qualification will cull aggressively.

- **SaaS / B2B**: combine 2–3 sources for cross-verification. Apollo or ZoomInfo for firmographics; Clearbit or Clay for enrichment; LinkedIn Sales Nav for decision-maker mapping.
- **Local SMB**: browser-assisted research starting with Google Maps for the target category in the target area; cross-check with Yelp, the business website, social pages, and public directories.

If the user's list quality bar is high, smaller is better. 25 verified leads beats 250 mostly-junk ones.

### Phase 3 — Qualify each candidate

Score every candidate against the ICP checklist. Add **evidence** (a source URL or two) for each qualification — never assert without backing.

**Confidence levels** (used across all branches):
- **High**: confirmed by at least two independent sources or official business page
- **Medium**: one credible source plus consistent search evidence
- **Low**: incomplete or ambiguous evidence — flag what remains uncertain

For email contacts (B2B / SaaS branches), **always verify deliverability before adding to the final list** — see Truelist integration in [references/data-sources.md](references/data-sources.md). Don't ship leads with invalid or risky emails.

### Phase 4 — Score and prioritize

Apply this rubric across all branches:

| Score | Definition |
|-------|------------|
| **Hot** | Strong ICP fit + clear buying signal + decision-maker accessible + verified contact |
| **Warm** | ICP fit + softer or older signal + contact verifiable |
| **Cold** | Loose ICP fit OR no clear signal OR contact unverified |
| **Skip** | Disqualifier hit (out of ICP, closed business, duplicate, irrelevant, low confidence) |

Branch-specific signals refine the scoring — see each reference file. Default ratio target: ~20% Hot, ~30% Warm, rest Cold/Skip.

### Phase 5 — Output the lead sheet

Default to a markdown table in chat. Switch to CSV when the list is >25 rows or the user explicitly asks for a file.

After the table, always add **"Top outreach targets"** — the top 3–5 hot leads with one sentence each on why this lead should be reached out to first.

Columns vary by branch (see reference files), but every lead sheet includes:
- score, business/company name, contact (where applicable), why-it's-a-prospect, source(s), confidence, last verified date

---

## Compliance Guardrails

These apply to every branch. **Read first, every engagement.**

1. **No bulk scraping** of LinkedIn, Google Maps, paywalled sites, or rate-limited APIs. Browser is an assisted research tool, not a scraper.
2. **No CAPTCHA, login wall, or bot protection bypass.** If a site requires it, work with what's publicly visible.
3. **Public business contact channels only.** Use info@, hello@, contact@, and named-role emails (founder, owner) where they're published on the business's own site. Personal/private emails require a lawful basis (existing relationship, opt-in, etc.).
4. **GDPR / CAN-SPAM / CASL aware.** Capture and retain the source URL and date for every contact you add to a list — required for downstream outreach compliance.
5. **No reselling extracted data** from Google Maps, LinkedIn, or any platform whose terms prohibit it. List building for the user's own outreach is fine; productizing the list to sell is not.
6. **Rate limit yourself.** Even on public sources, space requests. Don't fingerprint as a bot.

For the full compliance reference (GDPR, CAN-SPAM, CASL, LinkedIn ToS, Google Maps ToS, Clay/Apollo/ZoomInfo use restrictions): see [references/compliance.md](references/compliance.md).

---

## Inputs to Collect

If missing, ask once, then infer reasonable defaults and continue:

- **Branch** (SaaS / B2B / Local SMB) — usually inferable from context
- **ICP description** — pull from `product-marketing.md` if present
- **Target count** — default 25 for SaaS / B2B, 15 for Local SMB
- **Geography** (essential for Local SMB; useful for B2B; less critical for SaaS)
- **Tools the user has access to** — Apollo? Clay? ZoomInfo? Hunter? Truelist? Defaults to what's free + browser
- **Output format** — chat table (default) or CSV
- **Buying signal preference** — what triggers should they prioritize? (funding rounds, hiring, recent move, etc.)

---

## Tool Selection Quick Picks

Full breakdown in [references/data-sources.md](references/data-sources.md). Quick picks:

| If the user has access to... | Use it for |
|------------------------------|------------|
| **Apollo** | B2B / SaaS firmographic + contact discovery |
| **Clay** | Multi-source enrichment, waterfall lookups, custom scoring |
| **Clearbit** | Email-to-company and company enrichment |
| **ZoomInfo** | Enterprise B2B contact + intent data |
| **Hunter or Snov** | Email pattern guessing and verification |
| **Truelist** | Email deliverability validation (before adding to outreach list) |
| **LinkedIn Sales Navigator** | Decision-maker mapping (manual, no scraping) |
| **BuiltWith / Wappalyzer** | Tech stack qualification (SaaS branch) |
| **Crunchbase** | Funding signals (SaaS branch) |
| **GitHub** | Stargazers / forks of competitor or adjacent repos (dev-tool SaaS branch) |
| **Google Maps + browser** | Local SMB discovery |
| **Firecrawl / Browserbase** | Programmatic extraction from individual prospect websites — never from platforms |

**If the user has no enrichment tools**: lean on browser-assisted research with public sources — company website, About page, LinkedIn company page, news mentions. Slower but works.

---

## Output Formats

### Default — chat table

For SaaS / B2B (≤25 rows):

```
| Score | Company | Industry | Size | Signal | Contact | Email status | Source | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

For Local SMB (≤15 rows) — port from the local-prospector reference:

```
| Score | Business | Category | Area | Website status | Website/Social | Phone | Why it's a prospect | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

### CSV — when >25 rows or user requests a file

SaaS / B2B columns:

```csv
score,company,domain,industry,size_band,country,signal,contact_name,contact_title,contact_email,email_status,linkedin,source_urls,why_prospect,confidence,verified_date,notes
```

Local SMB columns:

```csv
score,business,category,area,distance_km,website_status,website_url,social_urls,phone,email,source_urls,why_prospect,confidence,verified_date,notes
```

### Always include after the table

- **Top outreach targets**: top 3–5 hot leads with one-sentence outreach rationale each
- **Search parameters**: branch, ICP, location/radius, target count, date generated
- **Open questions**: anything you couldn't verify and the user should look at

---

## Quality Checks (before finalizing)

- [ ] Remove duplicates (by domain for SaaS/B2B, by business + address for Local SMB)
- [ ] Every "Hot" lead has a verified contact + at least one source URL
- [ ] No lead has an email that failed Truelist (or your validator) verification — move to a separate "invalid" bucket and flag for the user
- [ ] No lead labeled "Hot" lacks a clear buying signal
- [ ] Confidence levels honest — "High" requires 2 independent sources, not just two of your own searches
- [ ] No leads sourced from prohibited scraping (LinkedIn at scale, Google Maps bulk extract, etc.)
- [ ] Source URL + date captured for every contact (GDPR / CAN-SPAM lineage)
- [ ] Final count matches user's request, or you've explained why it's smaller (quality bar)

---

## Common Mistakes

1. **Starting discovery without an ICP**. Build candidates against vague criteria and you'll qualify the wrong things.
2. **Treating data sources as authoritative without cross-checks**. Apollo and ZoomInfo are out of date often; verify before scoring as "Hot."
3. **Adding contacts without email verification**. Cold email reputation tanks fast with bounces — always validate.
4. **Bulk scraping LinkedIn or Google Maps**. Real risk: account suspension + ToS violation. Browser as an assisted tool only.
5. **Mixing branches**. Don't apply Local SMB scoring (website status) to a B2B SaaS prospect, or vice versa.
6. **"Hot" labels without buying signals**. ICP fit alone is not enough — the signal is what makes the timing right.
7. **No source URLs**. Every claim should be traceable to a public source. Future outreach depends on this lineage.
8. **Ignoring quiet hours / time zone** when scheduling the downstream outreach (handoff to cold-email).
9. **Forgetting to retain consent / lineage records**. Required for GDPR DSARs and CAN-SPAM audits.

---

## Task-Specific Questions

1. Which branch — SaaS, B2B, or Local SMB?
2. What's your ICP? (Or: should I pull from your product-marketing context?)
3. How many qualified leads do you want?
4. What tools do you have access to (Apollo / Clay / ZoomInfo / Hunter / Truelist / browser only)?
5. What's the triggering buying signal you care most about?
6. Geography or radius (Local SMB / B2B)?
7. Chat table or CSV?

---

## Tool Integrations

For implementation, see the [tools registry](../../tools/REGISTRY.md). Key prospecting tools:

| Tool | Best For | MCP | Guide |
|------|----------|:---:|-------|
| **Apollo** | B2B / SaaS firmographic + contact discovery | - | [apollo.md](../../tools/integrations/apollo.md) |
| **Clay** | Multi-source enrichment + waterfall | ✓ | [clay.md](../../tools/integrations/clay.md) |
| **Clearbit** | Email-to-company enrichment | - | [clearbit.md](../../tools/integrations/clearbit.md) |
| **ZoomInfo** | Enterprise B2B contact + intent | ✓ | [zoominfo.md](../../tools/integrations/zoominfo.md) |
| **Hunter** | Email pattern + verification | - | [hunter.md](../../tools/integrations/hunter.md) |
| **Snov** | Email finder + verifier | - | [snov.md](../../tools/integrations/snov.md) |
| **Truelist** | Email deliverability validation | - | [truelist.md](../../tools/integrations/truelist.md) |
| **Outreach** | Sales engagement (post-list) | ✓ | [outreach.md](../../tools/integrations/outreach.md) |
| **RB2B** | Visitor identification (warm intent) | - | [rb2b.md](../../tools/integrations/rb2b.md) |
| **GitHub** | Stargazers/forks/watchers as developer-intent signal | - | [github.md](../../tools/integrations/github.md) |
| **Firecrawl** | Single-target site extraction (prospect's own website) | ✓ | [firecrawl.md](../../tools/integrations/firecrawl.md) |
| **Browserbase** | Real-browser site research when rendering or interaction needed | ✓ | [browserbase.md](../../tools/integrations/browserbase.md) |

---

## Related Skills

- **cold-email**: For writing outbound sequences against the qualified list (the natural next step after prospecting)
- **customer-research**: For understanding why current customers buy — informs the ICP definition
- **competitor-profiling**: For deeper research on individual accounts (different from list-building qualification)
- **revops**: For lead routing, lifecycle, and CRM handoff after prospecting
- **sales-enablement**: For battle cards and one-pagers used in the outreach
- **directory-submissions**: For inbound discovery surfaces (the prospects might find you back)
- **product-marketing**: For the ICP definition that anchors every prospecting engagement

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/b2b-prospecting.md

# B2B Prospecting Reference

For when the user sells to non-SaaS B2B — services, agencies, manufacturers, mid-market and enterprise companies, professional services firms.

---

## ICP Signals That Matter (B2B branch)

### Firmographic signals

- **Industry / vertical** — NAICS or SIC codes if precision matters
- **Company size** — headcount band, revenue band, location count
- **Geography** — relevant for time zones, regulations, on-site requirements
- **Business model** — service vs product vs distribution; B2B vs B2B2C
- **Ownership** — independent, PE-backed, public, family-owned — affects buying motion

### Buying signals

- **Trigger events**: new C-level hire, recent acquisition or divestiture, IPO/funding, opening a new location, recent rebrand, expansion announcement
- **Vendor signals**: posting RFPs publicly, switching costs in last quarterly report, contract renewal windows
- **Operational signals**: recent layoffs (cost pressure) or rapid hiring (capacity pressure)
- **News mentions**: launching new initiative, entering new market, regulatory change forcing action
- **PR / press**: anything that signals "this company is changing right now"

### Decay signals

- Multiple bankruptcies or PE-stripped operations
- Negative growth + cost-cutting headlines
- Ownership stagnation (small family-owned, no growth incentive)
- Buyer turnover (3+ Marketing Directors in 2 years)

---

## Discovery Sources (B2B branch)

### Tier 1 — primary discovery

- **Apollo**: best general B2B firmographic + contact discovery
- **ZoomInfo**: enterprise B2B + intent signals (mid-market+)
- **LinkedIn Sales Navigator**: industry + role + signal search; the gold standard for decision-maker mapping (manual)
- **Clay**: when you need custom waterfall lookups (e.g., enrich Apollo records with Hunter + Clearbit)

### Tier 2 — industry-specific directories

- **Crunchbase / Pitchbook**: funded businesses
- **D&B Hoovers**: large traditional B2B firmographics
- **State / national business registries**: for verified incorporation data
- **Industry association membership rosters**: trade groups often publish member lists
- **Trade show exhibitor lists**: signals active participation in a vertical
- **Procurement databases** (Procore for construction, e.g.): vertical-specific signals

### Tier 3 — trigger event monitoring

- **Google Alerts / Feedly**: trigger keywords ("acquired," "hires," "expansion," "raises," "announces")
- **PR Newswire / Business Wire**: company-controlled announcements
- **SEC filings** (public companies): material change disclosures
- **State filings**: new entity formation, dissolution

---

## Qualification Checklist (B2B branch)

- [ ] Industry / vertical matches ICP (use a recognized classification if possible)
- [ ] Company size within range (employees or revenue)
- [ ] Geography fits
- [ ] At least one trigger event in last 90–180 days
- [ ] Decision-maker role exists (CEO, COO, VP Operations, Director of X — match buyer profile)
- [ ] Email contact verifiable (named role > info@ catchall)
- [ ] Source URLs captured for firmographic claims
- [ ] No disqualifiers (closed, acquired-paused, multi-bankrupt, off-ICP)

---

## Output Columns (B2B branch)

Recommended CSV columns:

```csv
score,company,domain,industry,naics_code,size_band,revenue_band,country,city,trigger_event,trigger_date,contact_name,contact_title,contact_email,email_status,linkedin_url,source_urls,why_prospect,confidence,verified_date,notes
```

For chat table, condense to: Score | Company | Industry | Size | Trigger | Contact | Email status | Confidence.

---

## Top Outreach Targets Selection (B2B)

Prioritize for the top 3–5 hot leads:

1. **Trigger event recency** — 30 days beats 6 months
2. **Trigger event specificity** — new CMO hire in your buyer's role beats "company in the news"
3. **Decision-maker access** — named contact with verified email + LinkedIn beats role-only
4. **Vertical fit precision** — exact NAICS match beats "adjacent industry"

Each top target rationale names the trigger and decision-maker: "Hired new VP of Marketing 14 days ago; verified email; mid-market manufacturer matching ICP."

---

## Common Mistakes (B2B)

1. **Treating B2B like SaaS** — funding rounds matter less; PE ownership and acquisition activity matter more.
2. **Trying to verify private company revenue precisely** — most public databases approximate. Use size bands, not point estimates.
3. **Ignoring procurement complexity** at enterprise scale — your prospect contact list may not include the actual approver.
4. **Cold-emailing executive assistants** — they're not the buyer and they will flag your outreach as spam.
5. **Source URL hygiene** — without source lineage, you can't defend a contact under GDPR DSAR or CAN-SPAM challenge.
6. **Stopping at one source** — Apollo can be 60% accurate on small businesses. Cross-verify with LinkedIn or the business website.

### references/compliance.md

# Prospecting Compliance Reference

The legal and platform-ToS constraints that apply to prospect list building. Read first, every engagement.

> Operational guidance, not legal advice. For high-volume programs or programs touching EU/UK residents, run your setup past a privacy attorney.

---

## United States — CAN-SPAM (downstream)

CAN-SPAM regulates the cold email **send**, not the list build. But the list build matters because:

- You must be able to identify the source of every email address you contact (required if challenged)
- The "from" line and email content rules apply at send time — but you can't lie about how you got the contact
- Opt-out requests must be honored within 10 business days and tracked

**For prospecting specifically**: capture and retain the source URL + date for every contact you add to a list. CAN-SPAM doesn't require it explicitly, but defending your sender practices does.

---

## EU / UK — GDPR

The strictest applicable framework. Triggers when:

- Your prospect resides in EU/UK
- You're processing personal data (any identifiable info, including business emails tied to a named person)

### Lawful bases for cold B2B outreach

You have three credible options:

1. **Legitimate interest** (most common for B2B). Requires:
   - The contact is in a business role likely to be interested in your offer
   - The data was collected from a public, business-context source
   - You provide a clear opt-out
   - You can articulate the legitimate interest test in writing

2. **Consent** — typically not feasible for cold outreach (you don't have consent before first contact)

3. **Existing customer relationship** — only applies to current customers, not prospects

### What you must do

- Capture **source + date + lawful basis** for every contact
- Honor data subject access requests (DSARs) — you must be able to disclose, correct, or delete on request
- Include a privacy notice / opt-out in the first outreach
- Don't store personal data longer than necessary for the legitimate interest

### What disqualifies a list

- Bulk-scraped LinkedIn data — explicit ToS violation + GDPR risk
- Email addresses purchased from a list broker without source provenance
- "Anyone @ this domain" guessed emails sent without verification (multiplies risk + bounces)

---

## Canada — CASL

Stricter than CAN-SPAM. Cold B2B outreach requires:

- **Express consent** (explicit opt-in) — typically not present for cold prospecting
- **OR implied consent** — existing business relationship within 24 months, OR business address publicly published on the company's own site for the purpose of receiving such communications

**Practical implication for Canadian prospects**: relying on the publicly-published-address exception is the most defensible cold prospecting basis in Canada. You must include sender identification, mailing address, and an unsubscribe mechanism in every message.

---

## Platform Terms of Service

### LinkedIn

- **Sales Navigator** as a research tool: fine
- **Scraping LinkedIn at any scale**: explicit ToS violation. Banned accounts are permanent. Don't.
- **Apollo, Clay, and ZoomInfo** claim LinkedIn-overlap data through various legitimate channels — verify their data sources before assuming compliance
- **InMail and Connection Requests**: governed by LinkedIn's own messaging rules, not by CAN-SPAM/GDPR (because LinkedIn-internal)

### Google Maps

- ToS prohibits bulk extraction or productizing Maps data
- Browser-assisted research as a discovery aid: acceptable
- Storing Place IDs or large structured Maps data in your CRM: explicit ToS prohibition
- Use Maps to **find** local businesses, then cross-source from the business's own site for the data you retain

### Apollo / ZoomInfo / Clearbit

- All have their own ToS limiting reselling, downstream sharing, and use cases
- Read your contract — typically you can use the data for your own outreach but not productize it
- Don't share extracts publicly (e.g., on a leaderboard, in a public report)

### Crunchbase

- Free tier is read-only for personal use
- Paid tier permits broader use within contractual scope
- API access requires paid Pro+ tier

---

## Anti-Patterns (Don't Do These)

1. **Bulk-scraping LinkedIn / Google Maps / Yelp**. Browser-assisted research is OK; automated scrapers pointed at these platforms are not. **Firecrawl and Browserbase are fine for an individual prospect's own website** (the URL you found through manual discovery) — not for the platforms hosting prospects.
2. **Buying lists from random vendors** without source provenance. You inherit their legal exposure.
3. **Guessing emails and sending unverified**. Bounce rates over 2% destroy sender reputation; legally, you can't claim a "legitimate interest" basis for an email you fabricated.
4. **Harvesting personal email addresses** (Gmail, personal Outlook, etc.) from public profiles. Personal addresses raise GDPR risk significantly.
5. **Storing data you don't need**. Minimize retention. Don't keep prospect lists forever — GDPR right to deletion applies.
6. **Skipping the lawful basis documentation**. If challenged, you need to show your work. Capture source URL + collection date for every contact.
7. **Reselling prospect lists**. You may not have the right to share them downstream. Read your data provider contracts.
8. **CAPTCHA bypass / login wall bypass**. Even if technically possible, this signals bot behavior and violates virtually every ToS.

---

## Quick Audit Checklist

Before shipping a list to the user (or downstream to cold-email):

- [ ] Every contact has a source URL + collection date
- [ ] No contacts sourced from scraped LinkedIn data
- [ ] No Google Maps Place IDs or large Maps-structured data retained
- [ ] Lawful basis documented (legitimate interest test for B2B, or relevant alternative)
- [ ] Email addresses validated (deliverability check before outreach)
- [ ] Personal addresses (Gmail, etc.) flagged or excluded
- [ ] Source provider contracts permit the intended use case
- [ ] Retention plan documented (when to delete)
- [ ] First outreach will include unsubscribe + privacy notice (downstream concern for cold-email skill, but mention it now)

### references/data-sources.md

# Prospecting Data Sources

Tool selection guide for prospecting across all three branches.

---

## Tool selection by goal

| Goal | Primary tools | Notes |
|------|--------------|-------|
| **Build initial firmographic list (B2B / SaaS)** | Apollo, ZoomInfo, Clay | Apollo for breadth, ZoomInfo for enterprise + intent, Clay for custom workflows |
| **Decision-maker mapping** | LinkedIn Sales Navigator (manual), Apollo, ZoomInfo | Sales Nav is the gold standard. Never bulk scrape it. |
| **Tech stack qualification (SaaS)** | BuiltWith, Wappalyzer | BuiltWith has wider coverage + paid plans for bulk; Wappalyzer is lighter + free for small use |
| **Funding signals (SaaS)** | Crunchbase, Pitchbook | Crunchbase free tier sufficient for early signals; Pitchbook for deeper investor data |
| **Email pattern discovery** | Hunter, Snov, Apollo | Pattern guessing — followed by verification |
| **Email deliverability verification** | Truelist, Hunter, NeverBounce, ZeroBounce | Always verify before adding to outreach lists |
| **Visitor identification (warm intent)** | RB2B, Clearbit Reveal | Anonymous traffic → company identification |
| **Intent data** | ZoomInfo Intent, 6sense, Bombora | Pre-warmed signals; mid-market+ pricing |
| **Trigger event monitoring** | Google Alerts, Feedly, LinkedIn Sales Nav alerts | Free options are sufficient for most |
| **Local business discovery** | Google Maps (manual), Yelp, Facebook Pages | Browser-assisted, not bulk-extracted |

---

## Apollo

**Use for**: General B2B / SaaS firmographic + contact data. Best starting point if you don't already have a list.

**Strengths**:
- Large database (>200M contacts, >60M companies)
- Strong filtering UI (industry, size, technologies, signals)
- Integrated email + LinkedIn finder
- Pay-as-you-go and tiered plans

**Watch out for**:
- Data freshness varies — re-verify before scoring as "Hot"
- Email accuracy ~60–80% — always validate
- Bulk export limits apply

**Integration**: see [apollo.md](../../../tools/integrations/apollo.md)

---

## Clay

**Use for**: Multi-source enrichment, waterfall lookups, custom scoring logic. When list quality matters more than list size.

**Strengths**:
- Waterfall logic: try Apollo first → fallback to ZoomInfo → fallback to Clearbit
- 100+ data provider integrations
- AI-powered enrichment (LLM-driven extraction from URLs)
- Custom columns + scoring formulas
- Native MCP server

**Watch out for**:
- Per-credit pricing can spike on large lists
- Complexity overhead — easy to over-engineer workflows

**Integration**: see [clay.md](../../../tools/integrations/clay.md)

---

## ZoomInfo

**Use for**: Enterprise B2B + intent data. Mid-market+ buyer profiles.

**Strengths**:
- Enterprise-grade firmographic depth
- Intent signals (companies searching topics relevant to your offer)
- Best-in-class for >$50K ACV B2B sales
- Native MCP server

**Watch out for**:
- Expensive ($15K+/yr starter)
- Overkill for SMB prospecting
- Locked into multi-year contracts typically

**Integration**: see [zoominfo.md](../../../tools/integrations/zoominfo.md)

---

## Clearbit

**Use for**: Email → company enrichment, anonymous visitor identification (Clearbit Reveal).

**Strengths**:
- Strong company enrichment (industry, size, funding, tech stack)
- Email lookup by domain
- Reveal: identify anonymous site visitors at company level
- API-first

**Watch out for**:
- HubSpot acquisition (2023) — bundled into HubSpot Breeze Intelligence now
- Standalone API still available but pricing/access depends on tier

**Integration**: see [clearbit.md](../../../tools/integrations/clearbit.md)

---

## Hunter / Snov

**Use for**: Email pattern discovery + lightweight verification on small lists.

**Hunter strengths**:
- Domain-based email discovery
- Built-in deliverability verification
- Free tier reasonable for occasional use

**Snov strengths**:
- Email finder + drip campaigns (overlap with outreach tooling)
- Bulk verification
- Cheaper than Hunter at scale

**Watch out for**:
- Both are pattern-guessing tools — accuracy depends on the target company's email pattern being inferable
- Always run results through a dedicated validator (Truelist or similar) before outreach

**Integrations**: see [hunter.md](../../../tools/integrations/hunter.md), [snov.md](../../../tools/integrations/snov.md)

---

## Truelist

**Use for**: Email deliverability validation before adding contacts to outreach lists. Critical safety step.

**Strengths**:
- Single-email sync verification (`/api/v1/verify_inline`) + bulk async (`/api/v1/verify`)
- Returns `email_state` (ok / email_invalid / risky / unknown / accept_all) + `email_sub_state` (email_ok / is_disposable / is_role / unknown_error / failed_smtp_check) + did-you-mean typo suggestions
- Catches catch-all domains, role accounts, spam traps, disposable providers
- Official MCP server for agent-driven workflows (Claude, Cursor, VS Code)
- Official SDKs in 7 languages + framework integrations (Django, Laravel, Next.js, Rails, React, Svelte, Vue, WordPress)
- Native integrations with Mailchimp, Klaviyo, HubSpot, Zapier, Make, n8n, Clay, Salesforce, more
- Pay-per-email pricing

**Why this matters**: Cold email reputation craters when bounce rates exceed 2%. Validating before sending is non-negotiable. Apollo/ZoomInfo/Hunter data is often 60–80% accurate — Truelist catches the rest.

**Integration**: see [truelist.md](../../../tools/integrations/truelist.md)

---

## LinkedIn Sales Navigator

**Use for**: Manual decision-maker discovery. The gold standard for B2B / SaaS prospecting but only when used as a research tool.

**Strengths**:
- Most accurate decision-maker data in the industry
- Real-time job changes, posts, signals
- Lead lists, alerts, saved searches
- Inmail credits (separate channel from cold email)

**Hard rules**:
- **Never bulk scrape**. LinkedIn aggressively bans scrapers. Account ban risk is real and permanent.
- Use Sales Nav as a research interface — open profiles, read, take notes, capture key data manually.
- Apollo and other tools claim LinkedIn data via partnerships / public mirroring — verify the source legitimacy before assuming compliance.

**Integration**: no MCP or API access at consumer level. Manual research only.

---

## BuiltWith / Wappalyzer

**Use for**: Tech stack qualification (SaaS branch).

**BuiltWith**:
- ~50K+ technologies tracked
- API + bulk lookups (paid)
- Historical data (when stack changed)

**Wappalyzer**:
- Free browser extension; paid API
- Lighter coverage than BuiltWith
- Faster for one-off lookups

Cross-reference both for high-confidence tech stack signals.

---

## Crunchbase

**Use for**: Funding signals (SaaS branch).

**Strengths**:
- Free tier shows recent funding events
- Paid (Pro / Enterprise) unlocks alerts and deep history
- API access for paid users

**Watch out for**:
- Coverage is best for VC-backed companies; bootstrapped + small businesses underrepresented
- Self-reported data — verify funding amounts independently

---

## GitHub (stargazers / forks / watchers)

**Use for**: Developer-intent prospecting. Especially powerful for dev-tool SaaS — stargazers of competitor or category-defining repos are in-market signal.

**Strengths**:
- Public API, no scraping concerns
- High signal quality (a starred repo = explicit interest)
- Forks are an even stronger signal (intent to modify, not just bookmark)
- Bundled `github-prospects.js` CLI handles pagination + enrichment + CSV output
- Free with 5,000 req/hr authenticated rate limit

**Watch out for**:
- Only ~5–20% of users publish email — pair with Apollo/Clay/Hunter for enrichment
- Very-popular repos (100K+ stars) are mostly noise; smaller targeted repos (5K–25K) give better signal density
- Most prospects are individuals, not company contacts directly — need to figure out their company from `company` field or LinkedIn

**Integration**: see [github.md](../../../tools/integrations/github.md)

---

## Firecrawl / Browserbase (single-target site research)

**Use for**: Programmatically extracting content from a **prospect's own website** that you already found via discovery on platforms like Google Maps, Yelp, or LinkedIn. Not for scraping those platforms themselves.

### Firecrawl

- **Best for**: "Just give me the page as markdown" — Local SMB website status checks, B2B company about/team page extraction, structured field extraction
- **Strengths**: Low overhead, returns clean LLM-ready markdown, handles most JS-rendered sites, has an MCP server
- **API + MCP + SDKs**: Node, Python, Go, Rust

### Browserbase

- **Best for**: When you need real Chromium — JS-heavy pages, cookie consent dialogs, form submission to reach a contact page, session state
- **Strengths**: Full browser control via Playwright/Puppeteer; Stagehand provides AI-friendly natural-language extraction; session recordings for debugging
- **API + MCP (Stagehand) + SDKs**: Node, Python

### Critical compliance line

Both tools can technically point at any URL. The hard rule:

- ✓ **OK**: extracting content from a single business's own website (`joescoffeeshop.com`) that you found through manual discovery
- ✗ **NOT OK**: pointing them at `google.com/maps`, LinkedIn search results, Yelp listings, or any platform whose ToS prohibits bulk extraction

Discovery happens on platforms (manual browser-assisted research). Extraction happens on individual public business sites.

**Integrations**: see [firecrawl.md](../../../tools/integrations/firecrawl.md), [browserbase.md](../../../tools/integrations/browserbase.md)

---

## RB2B / Clearbit Reveal

**Use for**: Identifying anonymous site visitors as warm intent signals.

**Strengths**:
- Pixel-based visitor → company identification
- High-intent: they came to your site, they're already in research mode
- Slack / email alerts on key visits

**Watch out for**:
- Privacy/GDPR considerations — verify your privacy policy disclosures
- Person-level identification raises higher concerns than company-level

**Integration**: see [rb2b.md](../../../tools/integrations/rb2b.md)

---

## Free / browser-only fallbacks

When the user has no paid tools, lean on:

- **Google Search** — exact business name + city + role searches
- **LinkedIn** (manual, no scraping) — company pages, employee lookups
- **Crunchbase free tier** — funding events
- **Wappalyzer browser extension** — tech stack at a glance
- **Hunter.io free tier** — 25 lookups/month
- **Google Maps** — for Local SMB discovery
- **Business websites + About pages** — primary source for any claim
- **News sites + press releases** — trigger event monitoring via Google Alerts

Slower than tooled-up workflows, but produces high-quality smaller lists if the user is willing to do the work.

---

## Sequencing recommendations

A typical full-stack prospecting workflow:

1. **Define ICP** from product-marketing context (no tools needed)
2. **Initial list** from Apollo or ZoomInfo (firmographic filter)
3. **Enrich** with Clay (waterfall: tech stack, funding, trigger events)
4. **Decision-maker mapping** in LinkedIn Sales Nav (manual)
5. **Email pattern discovery** with Hunter or Apollo's built-in
6. **Email validation** with Truelist before final list
7. **Hand off** to cold-email skill for outreach copy

Adapt this sequence based on which tools the user actually has.

### references/local-prospecting.md

# Local SMB Prospecting Reference

For when the user sells to local small businesses — shops, gyms, restaurants, salons, clinics, professional services, contractors, real estate, fitness studios, dental practices.

Adapted from and generalized beyond the local-client-prospector pattern (browser-assisted discovery + website status classification + proximity scoring).

---

## ICP Signals That Matter (Local SMB branch)

### Operational signals

- **Active business** — Google Business Profile updated, recent reviews, recent hours updates
- **Recent activity** — open right now, regular hours posted, recent photos uploaded by owner
- **Customer engagement** — owner responding to reviews, posts on social, active calendar (for service businesses)

### Online presence signals (the core SMB qualification axis)

The reference local-client-prospector skill uses **website status** as the primary qualification — port this directly. Four classifications:

| Status | Definition | Typical outcome |
|--------|-----------|-----------------|
| **No site found** | No credible standalone website after cross-checked search | **Hot prospect** for web/marketing service |
| **Social only** | Facebook, Instagram, WhatsApp, Linktree, booking portal, marketplace page only — no standalone site | **Hot prospect** for web/marketing service |
| **Weak site** | Standalone site exists but outdated, broken, very thin, non-mobile-friendly, or missing clear contact/conversion flow | **Warm prospect** for refresh / rebuild service |
| **Has site** | Credible, modern standalone site exists | **Low prospect** unless other signals apply (e.g., poor SEO, weak conversion design) |

### Proximity signals

- **Distance** from the user's location or service area
- **Density** — clusters of similar businesses in one area = neighborhood targeting opportunity
- **Travel time** — useful when in-person discovery, install, or service delivery is required

### Decay signals

- Closed permanently (Google Maps banner)
- Reviews paused or business listing reported as closed
- Last activity (review, post) >12 months ago

---

## Discovery Sources (Local SMB branch)

### Primary

- **Google Maps** (browser, manual) — search "category near [location]" and walk the visible results. Cross-check details. Don't bulk-extract.
- **Yelp** — secondary verification; complementary categories
- **Bing Local / Apple Maps** — different coverage on smaller businesses
- **Facebook Pages search** — many SMBs are Facebook-only

### Cross-verification

- **Business's own website** (if any)
- **Industry directories** (e.g., Healthgrades for medical, OpenTable for restaurants, Avvo for legal)
- **Local Chamber of Commerce listings**
- **State business registries** for incorporation status
- **Search results for "[business name] [city]"** to discover non-Maps presence

---

## Browser Research Workflow

1. Open a browser and search Google Maps for the category near `base_location`
2. Build a candidate list from visible local results, search results, and public directories
3. For each candidate, inspect public sources to fill required fields
4. Search the exact business name plus city/town to check whether a standalone website exists
5. Classify website status per the table above
6. Mark confidence: High (2+ sources), Medium (1 source + consistent evidence), Low (incomplete/ambiguous)

When the user explicitly asks for subagents AND subagents are available, split candidates into non-overlapping batches and ask each subagent to verify only website/social/contact status. Don't use subagents for the primary search if it slows progress.

### Optional: programmatic verification with Firecrawl or Browserbase

Once you have a candidate's website URL (found via manual Maps/Yelp discovery), you can speed up website-status classification by hitting the URL programmatically:

- **Firecrawl** for simple "is this site live, modern, mobile-friendly, conversion-flow-equipped" reads — returns clean markdown you can inspect
- **Browserbase** when the candidate site requires JS rendering, has a cookie consent dialog, or you need session state

**Strict line**: use these on the individual business's URL. **Don't** point them at Google Maps, Yelp, or any platform whose ToS prohibits bulk extraction — discovery stays manual.

See [data-sources.md](data-sources.md) for setup details.

---

## Qualification Checklist (Local SMB branch)

- [ ] Business is active (recent reviews or activity in last 6 months)
- [ ] Category matches user's service offering
- [ ] Distance / proximity within target radius
- [ ] Website status classified
- [ ] Phone or contact channel verified
- [ ] At least one cross-source confirms business operates at the listed address
- [ ] Not a duplicate / chain location / out-of-scope category
- [ ] Not closed permanently

---

## Lead Scoring (Local SMB)

Use this simple rubric (matches local-client-prospector pattern):

| Score | Criteria |
|-------|----------|
| **Hot** | No site found OR social-only + phone present + active business + within target radius |
| **Warm** | Weak site, poor online presentation, or marketplace/booking-page only |
| **Cold** | Good website already present OR low confidence |
| **Skip** | Closed, duplicate, outside radius, irrelevant category, or not a business prospect |

---

## Output Columns (Local SMB branch)

Chat table (≤15 rows):

```
| Score | Business | Category | Area | Distance | Website status | Website/Social | Phone | Why it's a prospect | Confidence |
```

CSV:

```csv
score,business,category,area,distance_km,website_status,website_url,social_urls,phone,email,source_urls,why_prospect,confidence,verified_date,notes
```

Rules:
- Keep "Why it's a prospect" short and actionable
- Use `Not found` instead of leaving blank fields
- Include source links sparingly, not all of them
- After the table, add **Best first outreach targets** with the top 3 leads and one practical reason each
- If confidence is low, state exactly what remains uncertain

---

## Top Outreach Targets Selection (Local SMB)

Prioritize for the top 3 hot leads:

1. **No site / social only + phone present** = clearest service opportunity
2. **High review count** = active, established business with real customers
3. **Owner-responded reviews** = engaged owner = more likely to evaluate a vendor
4. **Industry alignment with your service specialty** beats generic category match

Each top target rationale should be one sentence naming the gap and the signal: "No standalone website (cross-checked); 80+ Google reviews with owner replies; 2 km from target area."

---

## Compliance Notes (Local SMB-specific)

The local branch is the most scraping-sensitive of the three motions. Specifically:

- **Google Maps Terms of Service** prohibit bulk extraction. Treat browser visits as research, not as data acquisition.
- **Don't store full Google Maps Place IDs in your CRM** — the ToS limits storage of Maps data.
- **Public business contact channels only**: published phone, contact form, info@ email. Don't reach individual employees through their personal channels.
- **Owner/operator name when published on the business's own site** is OK to use. If you only got it from LinkedIn, mark the source.

---

## Common Mistakes (Local SMB)

1. **Bulk-scraping Google Maps** — fastest way to violate ToS and lose the research channel.
2. **Treating Google Maps data as truth** — listings go stale. Cross-check hours, status, and reviews.
3. **Skipping the website status cross-check** — finding "no site" on Maps doesn't mean no site exists; do an exact-name web search before classifying.
4. **Targeting only the largest businesses** — they're already covered by other providers. The 2–5 employee SMBs are the under-served opportunity.
5. **Generic outreach to all hot leads** — local SMBs respond better to outreach that names their specific gap ("I noticed your menu isn't visible on mobile") than generic pitches.
6. **Ignoring chains and franchises** as Skip — sometimes the franchisee is the buyer and they have local marketing authority. Verify before skipping.

### references/saas-prospecting.md

# SaaS Prospecting Reference

For when the user sells SaaS or digital services to other SaaS companies / digital businesses.

---

## ICP Signals That Matter (SaaS branch)

Beyond standard firmographics (industry, size, geography), SaaS prospects are qualified by:

### Technographic signals

- **Tech stack** — do they use complementary tools (your integration target) or competing tools (a switch opportunity)?
- **Recent stack changes** — adding/removing tools signals active vendor evaluation
- **Custom-built vs off-the-shelf** — DIY tooling often means a buyer who'd benefit from your product
- **Free/freemium plan signals** — using a free competitor means they may be ready to upgrade

### Growth signals

- **Funding round** — Series A / B / C in last 6 months = budget + new hires + tool needs
- **Headcount growth** — 10%+ growth in last quarter signals scaling pressure
- **Hiring signals** — specific role openings (e.g., "Head of RevOps" → ICP for revops tooling)
- **Product velocity** — frequent shipping, new features, blog posts = healthy growth motion
- **Open positions for your buyer's role** — if you sell to Marketing Ops and they're hiring one, that's a signal

### Decay signals (downgrade scoring)

- Layoffs in target department
- Funding round >2 years ago with no follow-up
- Product hasn't shipped in 6+ months
- Team page shows founders only (very early — may not have budget)

---

## Discovery Sources (SaaS branch)

Combine 2+ sources for cross-verification.

### Tier 1 — primary discovery

- **Apollo**: firmographic + technographic + contact data. Good for building large initial lists.
- **Clay**: waterfall enrichment, custom scoring, multi-source merges. Best for high-quality smaller lists.
- **ZoomInfo**: enterprise-grade firmographic + intent signals. Expensive; mid-market+.
- **LinkedIn Sales Navigator**: decision-maker mapping. Use manually, never bulk scrape.

### Tier 2 — technographic / growth signals

- **BuiltWith**: tech stack lookups, find sites using specific tools
- **Wappalyzer**: free browser extension + API; lighter tech stack signal
- **Crunchbase**: funding rounds, headcount, founders
- **Pitchbook**: deeper investor data (enterprise/paid)
- **ProductHunt**: recent launches, builder audience
- **Hacker News / Show HN**: technical builders launching products

### Tier 3 — buying signals

- **Job boards** (LinkedIn Jobs, Indeed, AngelList): role openings as signals
- **RB2B / Clearbit Reveal**: visitor identification (warm anonymous traffic)
- **GitHub stars/forks of competitor or adjacent repos**: developer-level intent signal (see `tools/integrations/github.md` and the `github-prospects.js` CLI). Especially strong for dev-tool SaaS — a developer who starred `vercel/next.js` last week is in-market for adjacent Next.js infrastructure.
- **Recent blog posts / changelog**: product direction signals
- **G2 reviews mentioning competitor switches**: explicit dissatisfaction signal

#### GitHub prospecting pattern (when audience is developers)

For dev-tool SaaS, GitHub is one of the highest-quality discovery channels:

1. Identify 3–5 "anchor" repos: your direct competitors, your category leader, complementary tools your buyer uses
2. Pull stargazers (or forks for stronger intent) via `node tools/clis/github-prospects.js stargazers <owner/repo> --enrich --with-company --format csv`
3. Filter to users with `company` set — these are the easiest to enrich downstream
4. Pair with Apollo/Clay/Hunter to lookup email by name + company
5. Validate with Truelist before adding to outreach list

Tradeoffs: GitHub yields email for only ~5–20% of users directly. The strength is the signal quality — a stargazer of a niche dev tool is genuinely in-market in a way Apollo firmographics alone can't tell you.

---

## Qualification Checklist (SaaS branch)

For each candidate, verify:

- [ ] Industry vertical matches ICP
- [ ] Company size (headcount) within range
- [ ] Tech stack includes (or notably excludes) a target technology
- [ ] Funding stage matches buyer maturity
- [ ] At least one growth signal in last 90 days (funding, hiring, product velocity)
- [ ] Decision-maker role exists at the company (named or inferable from job listings)
- [ ] Email contact verifiable
- [ ] No disqualifiers (closed, acquired-and-paused, layoffs, ICP miss)

---

## Output Columns (SaaS branch)

Recommended CSV columns:

```csv
score,company,domain,industry,size_band,country,funding_stage,last_round_date,tech_stack_match,signal,signal_date,contact_name,contact_title,contact_email,email_status,linkedin_url,source_urls,why_prospect,confidence,verified_date,notes
```

For chat table, condense to: Score | Company | Industry | Size | Signal | Contact | Email status | Confidence.

---

## Top Outreach Targets Selection (SaaS)

Prioritize for the top 3–5 hot leads:

1. **Strongest signal recency** — funding 30 days ago beats funding 9 months ago
2. **Tech stack match strength** — known integration partner beats inferred fit
3. **Decision-maker named with verified email** — beats role-pattern-guessed email
4. **Multi-source confidence** — both Apollo + Crunchbase agree beats one source

Each top target gets a one-sentence outreach rationale that names the specific signal: "Raised Series B 30 days ago; hiring Head of RevOps; verified VP of Ops email."

---

## Common Mistakes (SaaS)

1. **Buying lists from Apollo wholesale** without re-verifying email and re-checking firmographics. Stale data is the norm.
2. **Treating tech stack data as 100% accurate**. BuiltWith and Wappalyzer miss things; Clay's waterfalls miss things. Cross-check.
3. **Targeting Series C+ for early-stage SaaS sellers**. The buyer profile is wrong — too many procurement hoops, too much red tape.
4. **Targeting Series Pre-Seed seed** for products requiring meaningful budget. They have neither budget nor evaluator bandwidth.
5. **Ignoring intent data when it exists** (ZoomInfo Intent, 6sense, etc.) — pre-warm signals beat cold every time.

