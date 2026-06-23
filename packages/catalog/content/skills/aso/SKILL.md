---
name: aso
description: "When the user wants to audit or optimize an App Store or Google Play listing. Also use when the user mentions 'ASO audit,' 'app store optimization,' 'optimize my app listing,' 'improve app visibility,' 'app store ranking,' 'audit my listing,' 'why aren't people downloading my app,' 'improve my app conversion,' 'keyword optimization for app,' or 'compare my app to competitors.' Use when the user shares an App Store or Google Play URL and wants to improve it."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# ASO Audit

Analyze App Store and Google Play listings against ASO best practices. Fetches
live listing data, scores metadata, visuals, and ratings, then produces a
prioritized action plan.

## When to Use

- User shares an App Store or Google Play URL
- User asks to audit or optimize an app listing
- User wants to compare their app against competitors
- User asks about app store ranking, visibility, or download conversion

## Before Auditing

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

## Phase 1 — Identify Store & Fetch

### Detect store type from URL

```
Apple:  apps.apple.com/{country}/app/{name}/id{digits}
Google: play.google.com/store/apps/details?id={package}
```

If the user gives an app name instead of a URL, search the web for:
`site:apps.apple.com "{app name}"` or `site:play.google.com "{app name}"`

### Fetch the listing

Use WebFetch to retrieve the listing page. Extract every available field:

**Apple App Store fields:**

- App name (title) — 30 char limit
- Subtitle — 30 char limit
- Description (long) — not indexed for search, but matters for conversion
- Promotional text — 170 chars, updatable without new release
- Category (primary + secondary)
- Screenshots (count, order, caption text)
- Preview video (presence, duration)
- Rating (average + count)
- Recent reviews (visible ones)
- Price / in-app purchases
- Developer name
- Last updated date
- Version history notes
- Age rating
- Size
- Languages / localizations listed
- In-app events (if any visible)

**Google Play fields:**

- App name (title) — 30 char limit
- Short description — 80 char limit
- Full description — 4,000 char limit, IS indexed for search
- Category + tags
- Feature graphic (presence)
- Screenshots (count, order)
- Preview video (presence)
- Rating (average + count)
- Recent reviews (visible ones)
- Price / in-app purchases
- Developer name
- Last updated date
- What's new text
- Downloads range
- Content rating
- Data safety section
- Languages listed

If WebFetch returns incomplete data (stores render client-side), note gaps and
work with what's available. Ask the user to paste missing fields if critical.

### Visual asset assessment

WebFetch cannot extract screenshot images or caption text. **Take a screenshot
of the listing page** to get visual data:

1. Navigate to the listing URL and capture a full-page screenshot
2. Assess the screenshot for: icon quality, screenshot count, caption text,
   messaging quality, preview video presence, feature graphic (Google Play)
3. If browser tools are unavailable, ask the user to share a screenshot of the
   listing page

**Promotional text (Apple):** This 170-char field appears above the description
but is often indistinguishable from it in scraped HTML. If you cannot confirm
its presence, note this and recommend the user check App Store Connect.

---

## Phase 1.5 — Assess Brand Maturity

Before scoring, classify the app into one of three tiers. This determines how
you interpret "textbook ASO" deviations — a deliberate brand choice by a
household name is not the same as a missed opportunity by an unknown app.

### Tier definitions

| Tier            | Signals                                                                                                                              | Examples                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| **Dominant**    | Household name, 1M+ ratings, top-10 in category, near-universal brand recognition. Users search by brand name, not generic keywords. | Instagram, Uber, Spotify, WhatsApp, Netflix |
| **Established** | Well-known in their category, 100K+ ratings, strong organic installs, recognized brand but not universally known.                    | Strava, Notion, Duolingo, Cash App, Calm    |
| **Challenger**  | Building awareness, <100K ratings, needs discovery through keywords and ASO tactics. Most apps fall here.                            | Your app, most indie/startup apps           |

### How tier affects scoring

**Dominant apps** get adjusted scoring in these areas:

- **Title:** Brand-only or brand-first titles are valid (score 8+ if brand is the keyword). These apps don't need generic keyword discovery.
- **Description:** Score purely on conversion quality, not keyword presence. If the app is a household name, a well-crafted brand description beats a keyword-stuffed one.
- **Visual Assets:** Lifestyle/brand photography instead of UI demos is a legitimate conversion strategy. No video is acceptable if the product is hard to demo in 30s or brand awareness is near-universal.
- **What's New:** Generic release notes at weekly+ cadence are acceptable (score 8+). At scale, detailed changelogs have minimal ROI and risk backlash.
- **In-app events:** Missing events for utility apps with massive install bases (Uber, WhatsApp) is not a penalty. These apps don't need discovery help.
- **Localization:** Score relative to actual market, not absolute count. A US-only fintech with 2 languages (English + Spanish) is appropriately localized.

**Established apps** get partial adjustment:

- Brand-first titles are fine but should still include 1-2 keywords
- Strategic description choices get benefit of the doubt
- Other dimensions scored normally

**Challenger apps** are scored strictly against textbook ASO best practices — every character, screenshot, and keyword matters.

**Key principle:** Before docking points, ask: "Is this a mistake or a deliberate
choice by a team that has data I don't?" If the app has 1M+ ratings and a
dedicated ASO team, assume their choices are data-informed unless clearly wrong.

---

## Phase 2 — Score Each Dimension

Score each dimension 0-10 using the criteria in `references/scoring-criteria.md`.
Apply the brand maturity tier adjustments from Phase 1.5.

Reference files for platform specs and benchmarks:

- `references/apple-specs.md` — Official Apple character limits, screenshot/video specs, CPP/PPO rules, rejection triggers
- `references/google-play-specs.md` — Official Google Play limits, screenshot specs, Android Vitals thresholds, policies
- `references/benchmarks.md` — Conversion data, rating impact, video lift, screenshot behavior, CPP/event benchmarks

### Dimensions and Weights

| #   | Dimension            | Weight | What It Covers                                                            |
| --- | -------------------- | ------ | ------------------------------------------------------------------------- |
| 1   | Title & Subtitle     | 20%    | Character usage, keyword presence, clarity, brand + keyword balance       |
| 2   | Description          | 15%    | First 3 lines, keyword density (Google), CTA, structure, promotional text |
| 3   | Visual Assets        | 25%    | Screenshot count/quality/messaging, video, icon, feature graphic          |
| 4   | Ratings & Reviews    | 20%    | Average rating, volume, recency, developer responses                      |
| 5   | Metadata & Freshness | 10%    | Category choice, update recency, localization count, data safety          |
| 6   | Conversion Signals   | 10%    | Price positioning, IAP transparency, social proof, download range         |

**Final score** = weighted sum, out of 100.

### Score interpretation

| Score  | Grade | Meaning                                                   |
| ------ | ----- | --------------------------------------------------------- |
| 85-100 | A     | Well-optimized; focus on A/B testing and iteration        |
| 70-84  | B     | Good foundation; clear opportunities to improve           |
| 50-69  | C     | Significant gaps; prioritized fixes will have high impact |
| 30-49  | D     | Major optimization needed across multiple dimensions      |
| 0-29   | F     | Listing needs a complete overhaul                         |

---

## Phase 3 — Competitor Comparison (Optional)

If the user provides competitor URLs or asks for comparison:

1. Fetch 2-3 top competitors in the same category
2. Run the same scoring on each
3. Build a comparison table highlighting where the user's app is weaker/stronger
4. Identify keyword gaps — terms competitors rank for that the user's app doesn't target

If no competitors are specified, suggest the user provide 2-3 or offer to search
for top apps in their category.

---

## Phase 4 — Generate Report

Use the template in `references/report-template.md` to structure the output.

The report must include:

1. **Score card** — table with all 6 dimensions, scores, and grade
2. **Top 3 quick wins** — changes that take <1 hour and have highest impact
3. **Detailed findings** — per-dimension breakdown with specific issues and fixes
4. **Keyword suggestions** — based on title/description analysis and competitor gaps
5. **Visual asset recommendations** — specific screenshot/video improvements
6. **Priority action plan** — ordered list of changes by impact vs effort

### Report rules

- Every recommendation must be **specific and actionable** ("Change subtitle from X to Y" not "Improve subtitle")
- Include character counts for all text recommendations
- Flag platform-specific differences (Apple vs Google) when relevant
- Note what CANNOT be assessed without paid tools (search volume, exact rankings)
- When suggesting keyword changes, explain WHY each keyword matters

---

## Platform-Specific Rules

### Apple App Store — Key Facts

- Title (30 chars) + Subtitle (30 chars) + Keyword field (100 **bytes**, hidden) = indexed text
- Keywords field is bytes not chars — Arabic/CJK use 2-3 bytes per char
- Long description is NOT indexed for search — optimize for conversion only
- Promotional text (170 chars) does NOT affect search (Apple confirmed)
- Never repeat words across title/subtitle/keyword field (Apple indexes each word once)
- Keyword field: commas, no spaces ("photo,editor,filter" not "photo, editor, filter")
- Screenshots: up to 10 per device. First 3 visible in search — 90% never scroll past 3rd
- Screenshot captions indexed since June 2025 (AI extraction)
- In-app events: max 10 published at once, max 31 days each. Indexed and appear in search
- Custom Product Pages (up to 70) in organic search since July 2025. +5.9% avg conversion lift
- App preview video: up to 3, 15-30s each. Autoplays muted — +20-40% conversion lift
- SKStoreReviewController: max 3 prompts per 365 days
- Apple has human editorial curation — quality and design matter more
- See `references/apple-specs.md` for full specs, dimensions, and rejection triggers

### Google Play — Key Facts

- Title (30 chars) + Short description (80 chars) + Full description (4,000 chars) = indexed text
- Full description IS indexed — target 2-3% keyword density naturally
- No hidden keyword field — all keywords must be in visible text
- Google NLP/semantic understanding — keyword stuffing detected and penalized
- Prohibited in title: emojis, ALL CAPS, "best"/"#1"/"free", CTAs (enforced since 2021)
- Screenshots: min 2, **max 8** per device (not 10 like Apple)
- Feature graphic (1024x500, exact) required for featured placements
- Video does NOT autoplay — only ~6% of users tap play (low ROI vs iOS)
- Android Vitals directly affect ranking: crash >1.09% or ANR >0.47% = reduced visibility
- Promotional Content: submit 14 days early for featuring. Apps see 2x explore acquisitions
- Custom Store Listings: up to 50 (can target churned users, specific countries, ad campaigns)
- Store Listing Experiments: test up to 3 variants, run 7+ days, 1 experiment at a time
- See `references/google-play-specs.md` for full specs and policy details

### What Apple Indexes vs What Google Indexes

| Field                 | Apple Indexed?   | Google Indexed?        |
| --------------------- | ---------------- | ---------------------- |
| Title                 | Yes              | Yes (strongest signal) |
| Subtitle / Short desc | Yes              | Yes                    |
| Keyword field         | Yes (hidden)     | Does not exist         |
| Long description      | No               | Yes (heavily)          |
| Screenshot captions   | Yes (since 2025) | No                     |
| In-app events         | Yes              | N/A (LiveOps instead)  |
| Developer name        | No               | Partial                |
| IAP names             | Yes              | Yes                    |

---

## Common Issues Checklist

Flag these if found. Items marked _(tier-dependent)_ should be evaluated against
the app's brand maturity tier — they may be deliberate choices for Dominant apps.

**Always flag (all tiers):**

- [ ] Rating below 4.0
- [ ] Last update > 3 months ago
- [ ] Google Play description has no keyword strategy (under 1% density)
- [ ] Google Play missing feature graphic
- [ ] Apple keyword field likely has repeated words (inferred from title+subtitle)
- [ ] Category mismatch — app would face less competition in a different category
- [ ] Fewer than 5 screenshots

**Flag for Challenger/Established only** _(not mistakes for Dominant apps):_

- [ ] Title wastes characters on brand name only (no keywords) _(Dominant: brand IS the keyword)_
- [ ] Subtitle/short description duplicates title keywords
- [ ] Description first 3 lines are generic _(Dominant: may be brand-voice choice)_
- [ ] No preview video _(Dominant: may be rational if product is hard to demo)_
- [ ] Screenshots are just UI dumps with no messaging/captions _(Dominant: lifestyle/brand shots may convert better)_
- [ ] Only 1-2 localizations _(score relative to actual market, not absolute count)_
- [ ] No in-app events or promotional content _(Dominant utility apps may not need discovery help)_

**Flag for all tiers but note context:**

- [ ] No developer responses to negative reviews _(note volume — responding at 10M+ reviews is a different challenge than at 1K)_
- [ ] Generic "What's New" text _(acceptable at weekly+ release cadence for Established/Dominant)_

---

## Task-Specific Questions

1. What is the App Store or Google Play URL?
2. Is this your app or a competitor's?
3. What category does the app compete in?
4. Do you have competitor URLs to compare against?
5. Are you focused on search visibility, conversion rate, or both?
6. Do you have access to App Store Connect or Google Play Console data?

---

## Related Skills

- **cro**: For optimizing the conversion of web-based landing pages that drive app installs
- **ad-creative**: For creating App Store and Google Play ad creatives
- **analytics**: For setting up install attribution and in-app event tracking
- **customer-research**: For understanding user needs and language to inform listing copy

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/apple-specs.md

# Apple App Store — Official Specs & Guidelines

All data from developer.apple.com as of March 2026.

## Character Limits

| Field                   | Limit            | Indexed for Search?      | Notes                                                    |
| ----------------------- | ---------------- | ------------------------ | -------------------------------------------------------- |
| App Name                | 30 chars (min 2) | Yes                      | Must be unique; no trademarks, competitor names, pricing |
| Subtitle                | 30 chars         | Yes                      | No unverifiable claims                                   |
| Keywords                | 100 bytes        | Yes (hidden)             | Commas, no spaces between terms                          |
| Description             | 4,000 chars      | **No**                   | Plain text only, no HTML                                 |
| Promotional Text        | 170 chars        | **No** (Apple confirmed) | Updatable without new version                            |
| What's New              | 4,000 chars      | No                       | Required for all versions after first                    |
| IAP Name                | 35 chars         | Yes                      | Appears in search                                        |
| IAP Description         | 55 chars         | No                       |                                                          |
| In-App Event Name       | 30 chars         | Yes                      | Title case required                                      |
| In-App Event Short Desc | 50 chars         | Yes                      | Sentence case                                            |
| In-App Event Long Desc  | 120 chars        | No                       | Sentence case                                            |

**Keywords field is 100 bytes, not 100 characters.** Non-Latin scripts (Arabic,
Chinese, Japanese, Korean) use 2-3 bytes per character, reducing effective
keyword count significantly.

## Screenshot Specs

| Device           | Required?     | Count | Dimensions (portrait)      |
| ---------------- | ------------- | ----- | -------------------------- |
| 6.9" iPhone      | **Required**  | 1-10  | 1260 x 2736                |
| 13" iPad         | **Required**  | 1-10  | 2064 x 2752                |
| Mac              | If applicable | 1-10  | Up to 2880 x 1800 (16:10)  |
| Apple Watch      | If applicable | 1-10  | Varies by model            |
| Apple TV         | If applicable | 1-10  | 1920 x 1080 or 3840 x 2160 |
| Apple Vision Pro | If applicable | 1-10  | 3840 x 2160                |

- Formats: JPEG, PNG
- Apple auto-scales from required base sizes to smaller devices

## App Preview Video Specs

- **Count:** Up to 3 per app
- **Duration:** 15-30 seconds
- **Max file size:** 500 MB
- **Codecs:** H.264 (10-12 Mbps, up to 30fps) or ProRes 422 HQ
- **Audio:** Stereo, 256 kbps AAC or PCM, 44.1/48 kHz
- **Formats:** .mov, .m4v, .mp4
- **Behavior:** Autoplays muted on product page (iOS 11+)

## Custom Product Pages (CPPs)

- **Max:** 70 additional pages (plus 1 default)
- **Customizable:** Screenshots, promotional text, app previews, deep links (iOS 18+)
- **Keywords:** Each keyword combo must be unique to a single CPP
- **Review:** Submitted to App Review independently of app updates
- **Organic search:** CPPs appear in organic search results since July 2025
- **Performance:** +2.5 percentage points higher conversion on average vs default

## Product Page Optimization (A/B Testing)

- **Treatments:** Up to 3 vs original
- **Testable:** App icons, screenshots, app preview videos
- **NOT testable:** Title, subtitle, description, keywords
- **Concurrent tests:** 1 per app
- **Max duration:** 90 days
- **Icon constraint:** All icon variants must be in the published app binary
- **Confidence:** Apple recommends 90% threshold (Bayesian method)
- **Cannot modify** a test once started

## In-App Events

- **Max approved:** 15 in App Store Connect at once
- **Max published:** 10 on App Store simultaneously
- **Max duration:** 31 days per event
- **Pre-event promotion:** Up to 14 days before start
- **Badge types:** Challenge, Competition, Live Event, Major Update, New Season, Premiere, Special Event

**Event card image:** 16:9, min 1920x1080, max 3840x2160
**Event details image:** 9:16, min 1080x1920, max 2160x3840

**Not suitable:** Repetitive daily tasks, price promotions without new content, general awareness campaigns.

## Ratings & Reviews

- **SKStoreReviewController:** Max 3 prompts per 365-day period
- System controls display frequency (may show fewer than 3)
- Do not use custom buttons to request reviews
- Developers can respond to all reviews in App Store Connect
- Summary rating is territory-specific

## Metadata Rejection Triggers (App Review Guidelines)

| Guideline | Rejection Trigger                                                         |
| --------- | ------------------------------------------------------------------------- |
| 2.3.1     | Hidden features, misleading marketing, false pricing                      |
| 2.3.2     | Not disclosing IAPs in description/screenshots                            |
| 2.3.3     | Screenshots that don't show app in use (only splash/login)                |
| 2.3.4     | Preview videos using non-app content                                      |
| 2.3.5     | Wrong category selected                                                   |
| 2.3.7     | Keyword stuffing: trademarks, competitor names, pricing, irrelevant terms |
| 2.3.8     | Metadata not appropriate for all audiences (must be 4+ rated)             |
| 2.3.10    | Other platform names/imagery (Android, etc.) in metadata                  |
| 2.3.12    | Generic What's New for significant changes                                |
| 2.3.13    | Inaccurate in-app event metadata                                          |

Sources: developer.apple.com/app-store/product-page/,
developer.apple.com/app-store/search/,
developer.apple.com/app-store/review/guidelines/

### references/benchmarks.md

# ASO Benchmarks & Conversion Data

Industry data from AppTweak, SplitMetrics, Sensor Tower, and others. Updated March 2026.

## Conversion Rate Benchmarks by Category

**Average CVR (page view to install):**

- iOS overall: **25.0%**
- Google Play overall: **27.3%**

| Category          | iOS CVR        | Google Play CVR |
| ----------------- | -------------- | --------------- |
| Navigation        | 115%\*         | --              |
| Auto & Vehicles   | --             | 70.5%           |
| Business          | 66.7%          | --              |
| Music (Games)     | --             | 45.0%           |
| Utilities & Tools | --             | 36.8%           |
| Shopping          | --             | 27.7%           |
| Health & Fitness  | --             | 23.2%           |
| Finance           | --             | 19.7%           |
| Food & Drink      | --             | 13.1%           |
| Games (Board)     | 1.2%           | 7.3%            |
| Games (overall)   | 3-5% realistic | --              |

\*Above 100% = some users install from search without visiting product page.

Source: AppTweak 2025 Benchmarks Report (H1 2024 data, US market)

## Rating Impact on Conversion

| Rating Change              | Conversion Impact                       |
| -------------------------- | --------------------------------------- |
| 3.0 to 4.0 stars           | **+89%**                                |
| 4.0 to 4.5 stars           | **+20-30%**                             |
| 4.3 to 4.6 stars           | **+22-28%** (Finance, Health)           |
| 0.4-star gap vs competitor | **~25% lost installs** from same search |
| 3-star vs 5-star app       | **50% fewer conversions** for 3-star    |

**Critical thresholds:**

- **4.0 stars** = minimum for Apple featuring, user trust, conversion viability
- **4.5+ stars** = optimal zone. Sweet spot: 4.1-4.9
- **5.0 stars** can look suspicious to users
- **Below 3.5** = sharp visibility drop on both stores
- **79% of users** check ratings before downloading
- **50% reject** apps below 3 stars

Sources: AppFollow, MobileAction, Sensor Tower, Troof.ai

## Preview Video Impact

**iOS:** +20-40% conversion lift (video autoplays on product page)
**Google Play:** Minimal lift (only ~6% of visitors tap to play)

- Autoplay introduced in iOS 11 caused **+47% conversion jump**
- Users who watch video are **2x more likely to install**
- Average watch time: **4-6.5 seconds** (first 5 seconds are critical)
- 50%+ of viewers watch to the end

**Takeaway:** Video is high-ROI on iOS, low-ROI on Google Play.

Sources: StoreMaven, SplitMetrics, Leanplum

## Screenshot Impact

- **90% of users** do not scroll past the 3rd screenshot
- Average scroll rate: only **17%**
- Users spend **6-10 seconds** scanning before deciding
- **First screenshot decides everything**
- Well-designed screenshots lift conversion **20-35%**
- A/B test winners see **10-25% improvement**
- **Optimal count:** 4-5 for utility apps, 5-6 for complex apps
- More than 6: diminishing returns, can cause decision paralysis
- Top 200 apps update screenshots **2-4 times/year**
- Top Google Play games update visuals **up to 8x/year**
- **57% of top games** A/B tested screenshots at least 2x in 2024

Sources: AppTweak, ASOMobile, Sensor Tower

## Custom Product Pages (Apple CPPs)

- Average conversion lift: **+5.9% for apps**, **+3.5% for games**
- Best cases: up to **+8.6%**
- Organic referral: **+2.5 percentage points** (156% lift vs 1.6% baseline)
- Apple Ads CPP CVR: **55.8% in 2024** (up from 42.1% in 2023)
- **Only 31% of apps** and **26% of games** use CPPs (low adoption = opportunity)
- Screenshot reordering alone produced **+16.6% installs** in one case

Sources: AppTweak, SplitMetrics, MobileAction

## Custom Store Listings (Google Play CSLs)

- Up to **50 custom versions** per app
- Case study (Lockwood/Avakin Life): **+57% CVR** over 2 months
- Can target inactive/churned users (28+ days no activity)

Source: Phiture, MobileAction

## In-App Events (Apple)

- **55% of top 200 apps** use them regularly
- +**15-20% more impressions** from editorial/browse placements
- One case: **+124% surge** in total impressions
- One case: **+50% impressions AND first-time downloads**
- Search CVR uptick: **+10.3%**
- Re-downloads increase: **+15.5%**
- **Boost is short-lived** -- KPIs drop to baseline when event ends
- Optimal: **2-4 active events per month**

Sources: Phiture, AppTweak, Appalize

## Promotional Content (Google Play)

- Apps with featuring see **2x explore acquisitions** (official Google)
- +2% 28-day active users and +4% revenue on average

Source: Google Play Console documentation

## A/B Test Impact Thresholds

| Improvement | Classification                     |
| ----------- | ---------------------------------- |
| >10%        | Strong winner -- apply immediately |
| 5-10%       | Meaningful winner                  |
| 2-5%        | Marginal winner                    |
| <2%         | Noise -- not significant           |

Source: SplitMetrics, MobileAction

### references/google-play-specs.md

# Google Play Store — Official Specs & Guidelines

All data from support.google.com and developer.android.com as of March 2026.

## Character Limits

| Field             | Limit       | Indexed?               | Notes                                 |
| ----------------- | ----------- | ---------------------- | ------------------------------------- |
| App Title         | 30 chars    | Yes (strongest signal) | Reduced from 50 in Sept 2021          |
| Short Description | 80 chars    | Yes                    | Visible without expanding             |
| Full Description  | 4,000 chars | **Yes (heavily)**      | Google NLP indexes entire text        |
| Developer Name    | 64 chars    | Partial                | Same emoji/caps restrictions as title |

## Prohibited in Metadata (enforced since Sept 2021)

**Title, Icon, Developer Name:**

- Emojis, emoticons, repeated special characters
- ALL CAPS (unless registered brand)
- Performance claims: "top," "best," "#1," "free," "no ads"
- Misleading store performance or endorsement
- Calls-to-action: "update now," "download now"

**Short Description:**

- Same performance claims as title
- Calls-to-action
- Unattributed testimonials

**Screenshots, Feature Graphic, Video:**

- Time-sensitive taglines
- Calls-to-action ("Download now," "Play now")
- Must authentically showcase app functionality

## Screenshot Specs

| Device     | Min   | Max   | Aspect Ratio | Min Resolution | Max Long Edge |
| ---------- | ----- | ----- | ------------ | -------------- | ------------- |
| Phone      | **2** | **8** | 9:16 or 16:9 | 320px any side | 3,840px       |
| 7" Tablet  | 4     | 8     | 9:16 or 16:9 | 1,080px short  | 7,680px       |
| 10" Tablet | 4     | 8     | 9:16 or 16:9 | 1,080px short  | 7,680px       |
| Chromebook | 4     | 8     | 9:16 or 16:9 | 1,080px short  | 7,680px       |
| Wear OS    | 1     | 8     | **1:1**      | 384x384        | 3,840px       |
| Android TV | 1     | 8     | **16:9**     | 1,920x1,080    | 3,840px       |

- **Recommended phone size:** 1080x1920 (portrait)
- **Format:** JPEG or 24-bit PNG (no alpha)
- **Max file size:** 8 MB each

**Note:** Google Play max is 8 screenshots per device, not 10 like Apple.

## Feature Graphic

- **Dimensions:** 1024 x 500 px (exact, required)
- **Format:** JPEG or 24-bit PNG (no alpha)
- Displayed at top of listing and in featured placements

## App Icon

- **Dimensions:** 512 x 512 px
- **Format:** 32-bit PNG (with alpha)
- **Max file size:** 1,024 KB
- **Shape:** Full square (Google applies 30% corner radius automatically)
- **Prohibited:** Ranking claims, download counts, deal text, emoji

## Preview Video

- **Format:** YouTube URL (public or unlisted)
- **Duration:** 30 seconds to 2 minutes recommended
- No ads, no monetization, must be embeddable, not age-restricted
- **Does NOT autoplay** (only ~6% of visitors tap to play)

## Store Listing Experiments (A/B Testing)

- **Variants:** Up to 3 per experiment (plus control)
- **Testable:** Icon, feature graphic, screenshots, video, short description, full description
- **Concurrent:** Cannot run more than 1 default graphics experiment simultaneously
- **Audience:** Signed-in Google Play users only
- **Metrics:** First-time installers + retained first-time installers (1-day retention)
- **Duration:** Run at least 7 days (weekday/weekend variance)
- **Localized:** Test across up to 5 languages simultaneously

## Custom Store Listings

- **Max:** 50 per app (100 for Play partners)
- **Customizable:** Title, short/full description, icon, screenshots, feature graphic, video
- **Targeting:** Country/region, pre-registration, install state, Google Ads campaigns, inactive/churned users (28+ days)
- **2025 addition:** Gemini AI auto-generates text for CSLs in Play Console

## Promotional Content (LiveOps)

| Type              | Description                    | Duration             |
| ----------------- | ------------------------------ | -------------------- |
| Offers            | Discounts, free items, bundles | Up to 28 days        |
| Events            | Time-limited in-app events     | Must have time limit |
| Major Update      | Significant new features       | Max 1 week           |
| Crossover (games) | Cross-game/IP collaboration    | Varies               |

- Submit **4+ days** before start (standard review)
- Submit **14+ days** before for featuring requests
- **Impact:** "Over twice as many explore acquisitions during featuring" (official Google)

## Android Vitals — Ranking Thresholds

Apps exceeding these thresholds get **reduced visibility** in search and recommendations.

| Metric                       | Overall Threshold | Per-Device Threshold |
| ---------------------------- | ----------------- | -------------------- |
| User-Perceived Crash Rate    | **1.09%**         | 8%                   |
| User-Perceived ANR Rate      | **0.47%**         | 8%                   |
| Excessive Partial Wake Locks | 5%                | N/A                  |

**Consequences:** Reduced search visibility, warning labels on listing, quality alerts to users before install.
**Recovery:** Google checks daily using 28-day rolling average.

## Search Ranking — Official Factors

Google confirms these affect ranking:

1. **Metadata relevance** — Title carries most weight. NLP scans title + short desc + full desc.
2. **App quality** — Android Vitals (crash/ANR rates)
3. **Ratings and reviews** — Star rating + review text. 85% of featured apps have 4.0+
4. **Install volume and velocity** — Total installs + daily/weekly frequency
5. **Engagement and retention** — Session frequency, duration, retention rates
6. **Update frequency** — Regular updates signal active maintenance
7. **Localization** — Regional keyword/visual adaptation. 59% of US apps localize titles.

Sources: support.google.com/googleplay/android-developer/answer/4448378,
support.google.com/googleplay/android-developer/answer/9898842,
developer.android.com/topic/performance/vitals

### references/report-template.md

# ASO Audit Report Template

Use this structure for all ASO audit reports.

---

## Header

```
# ASO Audit: {App Name}
**Store:** {Apple App Store / Google Play}
**URL:** {listing URL}
**Audit date:** {date}
**Brand tier:** {Dominant / Established / Challenger} — {one-line justification}
**Overall Score:** {score}/100 (Grade: {A/B/C/D/F})
```

---

## Score Card

```
| Dimension | Score | Grade | Key Issue |
|-----------|-------|-------|-----------|
| Title & Subtitle | X/10 | {grade} | {one-line summary} |
| Description | X/10 | {grade} | {one-line summary} |
| Visual Assets | X/10 | {grade} | {one-line summary} |
| Ratings & Reviews | X/10 | {grade} | {one-line summary} |
| Metadata & Freshness | X/10 | {grade} | {one-line summary} |
| Conversion Signals | X/10 | {grade} | {one-line summary} |
| **OVERALL** | **{weighted}/100** | **{grade}** | |
```

Grade scale per dimension: 9-10 = A, 7-8 = B, 5-6 = C, 3-4 = D, 1-2 = F

---

## Top 3 Quick Wins

Highest-impact changes that take under 1 hour:

```
### 1. {Action verb} — {specific change}
**Impact:** {High/Medium} | **Effort:** {<15 min / <30 min / <1 hour}
**Current:** {what it is now}
**Recommended:** {exact replacement, with character count}
**Why:** {one sentence explaining the impact}

### 2. ...
### 3. ...
```

---

## Detailed Findings

### Title & Subtitle Analysis

```
**Current title:** "{title}" ({X}/30 chars used)
**Current subtitle/short desc:** "{subtitle}" ({X}/30 or /80 chars used)

**Issues found:**
- {issue 1}
- {issue 2}

**Recommended title:** "{new title}" ({X}/30 chars) — {rationale}
**Recommended subtitle:** "{new subtitle}" ({X}/30 or /80 chars) — {rationale}
```

### Description Analysis

```
**First 3 lines (above fold):**
> {quoted text}

**Issues found:**
- {issue 1}
- {issue 2}

**Keyword density (Google Play only):** {X}% — target: 2-3%
**Top keywords found:** {keyword1} (Xn), {keyword2} (Xn), ...
**Missing high-value keywords:** {keyword1}, {keyword2}, ...

**Recommended first 3 lines:**
> {rewritten text}
```

### Visual Assets Analysis

```
**Screenshots:** {count} ({store} shows first {3/all} in search)
**Preview video:** {Yes/No}
**Icon assessment:** {description}
**Feature graphic (Google Play):** {Yes/No}

**Screenshot audit:**
1. {screenshot 1 description} — {pass/issue}
2. {screenshot 2 description} — {pass/issue}
...

**Recommendations:**
- {specific visual change 1}
- {specific visual change 2}
```

### Ratings & Reviews Analysis

```
**Average rating:** {X.X} stars ({count} ratings)
**Recent review sentiment:** {Positive/Mixed/Negative}
**Common complaints:** {theme1}, {theme2}
**Developer responses:** {Yes, active / Sporadic / None}

**Recommendations:**
- {specific action 1}
- {specific action 2}
```

### Metadata & Freshness

```
**Last updated:** {date} ({X days/months ago})
**Localizations:** {count} languages
**Category:** {current category}
**In-app events/LiveOps:** {Yes/No}

**Recommendations:**
- {specific action 1}
- {specific action 2}
```

### Conversion Signals

```
**Price model:** {Free / Freemium / Paid}
**IAP count:** {count}
**Downloads (Google Play):** {range}
**Social proof visible:** {awards, press, badges — or "none"}

**Recommendations:**
- {specific action 1}
- {specific action 2}
```

---

## Keyword Suggestions

```
| Keyword | Rationale | Where to Place | Priority |
|---------|-----------|----------------|----------|
| {keyword} | {why this keyword} | {title/subtitle/description/keyword field} | {High/Med/Low} |
| ... | ... | ... | ... |
```

Note: Without paid ASO tools, exact search volume is unavailable. These
suggestions are based on category analysis, competitor metadata, and semantic
relevance. Validate with AppTweak, Sensor Tower, or MobileAction for volume data.

---

## Competitor Comparison (if applicable)

```
| Metric | {Your App} | {Competitor 1} | {Competitor 2} |
|--------|-----------|----------------|----------------|
| Title keywords | ... | ... | ... |
| Rating | ... | ... | ... |
| Screenshots | ... | ... | ... |
| Video | ... | ... | ... |
| Description keywords | ... | ... | ... |
| Last updated | ... | ... | ... |
| Overall ASO score | ... | ... | ... |
```

---

## Priority Action Plan

Ordered by impact (high to low), grouped by effort:

```
### Do This Week (Quick Wins)
1. {action} — {expected impact}
2. {action} — {expected impact}

### Do This Month (Medium Effort)
3. {action} — {expected impact}
4. {action} — {expected impact}

### Plan for Next Quarter (High Effort)
5. {action} — {expected impact}
6. {action} — {expected impact}
```

---

## Limitations

Always include this section:

> **What this audit cannot measure without paid ASO tools:**
>
> - Exact keyword search volume and difficulty scores
> - Historical keyword ranking positions
> - Download and revenue estimates
> - Apple keyword field contents (hidden from public view)
> - Install conversion rate data (only available to app owner in console)
> - A/B test results from previous experiments
>
> For these data points, consider using AppTweak ($69/mo), Sensor Tower, or
> MobileAction ($69/mo).

### references/scoring-criteria.md

# ASO Scoring Criteria

Score each dimension 0-10 using the rubrics below.
**Apply brand maturity tier adjustments** from Phase 1.5 of the main skill.

---

## Brand Maturity Adjustments (apply to all dimensions)

Before scoring, determine the app's tier: **Dominant**, **Established**, or **Challenger**.

**Dominant apps (Instagram, Uber, Spotify, WhatsApp, Netflix):**

- Brand-only titles score 8+ (the brand IS the keyword)
- Lifestyle/brand screenshots score same as captioned UI screenshots
- Generic What's New at weekly+ cadence scores 8+
- Missing in-app events for utility apps is not a penalty
- Description scored on conversion quality only, not keyword presence
- Localization scored relative to actual market footprint
- Missing preview video is acceptable if brand awareness is near-universal

**Established apps (Duolingo, Strava, Notion, Calm, Cash App):**

- Brand-first titles with 1-2 keywords score normally
- Strategic description/visual choices get benefit of the doubt
- All other dimensions scored normally

**Challenger apps (most apps):**

- Scored strictly against textbook ASO — every character and feature matters

**Key principle:** Before docking points, ask: "Is this a mistake or a data-informed
choice by a team with more information than I have?"

---

## 1. Title & Subtitle (Weight: 20%)

**Challenger rubric:**

| Score | Criteria                                                                                                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9-10  | Brand + high-value keyword in title, complementary keywords in subtitle, no word repetition across fields, near max character usage, instantly communicates app purpose |
| 7-8   | Good keyword presence, minor character waste (5+ unused chars), clear purpose                                                                                           |
| 5-6   | Has keywords but poor placement, some repetition between fields, purpose somewhat clear                                                                                 |
| 3-4   | Title is brand-only or generic, subtitle missing or weak, poor character usage                                                                                          |
| 1-2   | No keyword strategy, title doesn't communicate purpose, major character waste                                                                                           |
| 0     | Cannot assess (data unavailable)                                                                                                                                        |

**Dominant/Established adjustment:** Brand-only titles (e.g., "Instagram") are
valid if the brand has high search volume. Score 8+ for Dominant apps where
brand recognition eliminates the need for generic keywords. Evaluate whether
unused characters represent waste or intentional simplicity.

**Check for:**

- Characters used vs limit (title: 30, subtitle/short desc: 30/80). "Near max" = within 3 chars of the limit (27+/30, 77+/80)
- Primary keyword in title
- Keyword duplication between title and subtitle
- Whether app purpose is immediately clear
- Unnecessary words (articles, prepositions) consuming space
- Special characters or claims ("#1", "best") that risk rejection (Apple)

---

## 2. Description (Weight: 15%)

### Apple App Store

| Score | Criteria                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 9-10  | First 3 lines hook with clear value prop, structured with features/benefits/social proof/CTA, promotional text actively used, compelling and scannable |
| 7-8   | Good opening, decent structure, could improve scannability or CTA                                                                                      |
| 5-6   | Generic opening ("Welcome to..."), some structure, missing CTA or social proof                                                                         |
| 3-4   | Wall of text, no clear value prop above fold, no promotional text                                                                                      |
| 1-2   | Minimal or boilerplate description, no effort                                                                                                          |
| 0     | Cannot assess                                                                                                                                          |

### Google Play

| Score | Criteria                                                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 9-10  | Keywords in first 3 sentences, 2-3% natural density throughout, HTML formatting used, structured sections, strong CTA, keywords feel natural |
| 7-8   | Good keyword presence, some structure, density slightly off (1-2% or 3-4%)                                                                   |
| 5-6   | Keywords present but sparse (<1%) or stuffed (>5%), weak structure                                                                           |
| 3-4   | No keyword strategy visible, poor formatting, wall of text                                                                                   |
| 1-2   | Minimal description, no keywords, no structure                                                                                               |
| 0     | Cannot assess                                                                                                                                |

**Check for:**

- First 3 lines quality (visible before "Read More")
- Feature-benefit framing (not just feature lists)
- Social proof (downloads, awards, press mentions)
- Call to action
- Keyword density (Google Play only - count target keywords / total words)
- HTML formatting usage (Google Play)
- Promotional text presence and quality (Apple)

---

## 3. Visual Assets (Weight: 25%)

| Score | Criteria                                                                                                                                                                      |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9-10  | 8-10 screenshots with clear messaging/captions, preview video present, screenshots tell a story in sequence, each communicates one benefit, icon is distinctive and memorable |
| 7-8   | 6-7 screenshots with captions, good icon, no video OR good video but some screenshot messaging unclear                                                                        |
| 5-6   | 5+ screenshots but weak/no captions, basic icon, no video, screenshots are UI dumps                                                                                           |
| 3-4   | 3-4 screenshots, no captions, generic icon, no storytelling                                                                                                                   |
| 1-2   | Fewer than 3 screenshots, or screenshots are raw unedited UI, poor icon                                                                                                       |
| 0     | Cannot assess                                                                                                                                                                 |

**Check for:**

- Screenshot count (minimum 5, ideal 8-10)
- Caption/overlay text on screenshots (one message per screen, 5-7 words max)
- First 3 screenshots (highest conversion impact on Apple)
- Preview video presence and quality
- Icon distinctiveness (no text in icon, bold shapes, stands out)
- Feature graphic presence (Google Play - mandatory for featured placements)
- Screenshot storytelling flow (do they tell a coherent story?)
- Localized visual assets (for non-English markets)
- Caption keywords (Apple - indexed since June 2025)

---

## 4. Ratings & Reviews (Weight: 20%)

| Score | Criteria                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------ |
| 9-10  | 4.5+ stars, 10K+ ratings, recent reviews positive, developer responds to negatives, steady review flow |
| 7-8   | 4.0-4.4 stars, 1K+ ratings, mostly positive recent reviews, some developer responses                   |
| 5-6   | 3.5-3.9 stars, 500+ ratings, mixed recent reviews, no developer responses                              |
| 3-4   | 3.0-3.4 stars, <500 ratings, negative themes in recent reviews                                         |
| 1-2   | Below 3.0 stars, few ratings, no developer engagement, visible complaints                              |
| 0     | No ratings yet or cannot assess                                                                        |

**Check for:**

- Average rating (target: 4.0+ minimum, 4.5+ ideal)
- Total rating count
- Recent review sentiment (last 5-10 visible reviews)
- Common complaint themes (bugs, crashes, pricing, UX)
- Developer response presence and quality
- Rating trend (improving or declining, if visible)
- Review recency (fresh reviews signal active user base)

---

## 5. Metadata & Freshness (Weight: 10%)

| Score | Criteria                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| 9-10  | Updated within last month, 10+ localizations, optimal category choice, in-app events/LiveOps active, data safety complete |
| 7-8   | Updated within 2 months, 5+ localizations, good category, data safety present                                             |
| 5-6   | Updated within 3 months, 2-4 localizations, acceptable category                                                           |
| 3-4   | Updated 3-6 months ago, 1-2 localizations, possibly wrong category                                                        |
| 1-2   | Not updated in 6+ months, single language, poor category choice                                                           |
| 0     | Cannot assess                                                                                                             |

**Check for:**

- Last update date and recency
- Number of supported languages/localizations
- Category selection (is it the best fit? less competitive alternative?)
- In-app events (Apple) or promotional content (Google) presence
- Data safety / privacy nutrition label completeness
- Age rating appropriateness
- Version history quality (do release notes communicate value?)
- What's New text quality

---

## 6. Conversion Signals (Weight: 10%)

| Score | Criteria                                                                                                                                                          |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9-10  | Clear value before download, transparent pricing/IAP, social proof visible (press, awards), download range suggests strong traction, developer credibility strong |
| 7-8   | Good value communication, pricing clear, some social proof                                                                                                        |
| 5-6   | Value prop exists but weak, pricing unclear or IAP heavy, limited social proof                                                                                    |
| 3-4   | Unclear what user gets, confusing pricing, no social proof, low downloads visible                                                                                 |
| 1-2   | No value communication, suspicious pricing, app looks abandoned                                                                                                   |
| 0     | Cannot assess                                                                                                                                                     |

**Check for:**

- Price transparency (free, freemium, paid - is it clear?)
- In-app purchase list quality (do IAP names communicate value?)
- Download range (Google Play - 10K+, 100K+, 1M+ signals trust)
- Developer name/brand recognition
- "Editors' Choice" or featured badges
- Press mentions or awards in description
- Related apps from same developer (portfolio trust signal)
- Privacy practices transparency

---

## Calculating Final Score

```
Final Score = (Title * 0.20) + (Description * 0.15) + (Visuals * 0.25)
            + (Ratings * 0.20) + (Metadata * 0.10) + (Conversion * 0.10)

Scale to 100: Final Score * 10
```

**Example:** Title: 7, Description: 6, Visuals: 8, Ratings: 9, Metadata: 5, Conversion: 7

```
(7 * 0.20) + (6 * 0.15) + (8 * 0.25) + (9 * 0.20) + (5 * 0.10) + (7 * 0.10)
= 1.4 + 0.9 + 2.0 + 1.8 + 0.5 + 0.7
= 7.3 → 73/100 → Grade: B
```

