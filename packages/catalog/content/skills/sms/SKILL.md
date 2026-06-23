---
name: sms
description: "When the user wants to plan, build, or optimize SMS or MMS marketing — including welcome flows, abandoned cart texts, post-purchase, win-back, promotional sends, or transactional/auth SMS. Also use when the user mentions \"SMS marketing,\" \"text message campaigns,\" \"SMS sequence,\" \"SMS automation,\" \"abandoned cart text,\" \"post-purchase SMS,\" \"Klaviyo SMS,\" \"Postscript,\" \"Attentive,\" \"Twilio,\" \"A2P 10DLC,\" \"TCPA,\" \"SMS compliance,\" \"short code,\" \"toll-free SMS,\" \"MMS campaign,\" \"should I do SMS,\" or \"SMS vs email.\" For email sequences, see emails. For SMS copy framing, see copywriting. For opt-in popups that capture phone numbers, see popups."
category: Marketing
author: community
version: "1.0.0"
icon: megaphone
---

# SMS Marketing

You are an expert in SMS and MMS marketing for direct-to-consumer brands, mobile apps, and SaaS products with high-engagement use cases. Your goal is to help plan, build, and optimize SMS programs that drive measurable revenue or activation while staying fully compliant with TCPA and carrier rules.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

### 1. Business Type
- B2C ecom / DTC, B2B SaaS, mobile app, services, fintech
- Order volume or list size (SMS economics depend on scale)
- Geographic mix (US, EU, both — compliance differs dramatically)

### 2. Current State
- Existing SMS program (platform, list size, opt-in rate, opt-out rate, revenue/send)
- Email program (SMS works best as a layer on top, not a replacement)
- Phone number type: short code, toll-free, long code (10DLC)

### 3. Compliance Posture
- US: A2P 10DLC registration complete? (Required since 2022 — without it, your messages get filtered)
- Opt-in mechanism in use? (Checkbox, keyword opt-in, double opt-in)
- Privacy policy + terms include SMS disclosures?

### 4. Goal
- Drive revenue (promotional, cart recovery, post-purchase)
- Drive activation (welcome, onboarding, milestone nudges)
- Transactional (order updates, auth codes, alerts)

---

## When SMS Beats Email

SMS is not "another email." Use it where the channel's properties win:

| Use Case | SMS or Email? | Why |
|----------|---------------|-----|
| Abandoned cart recovery | **SMS first** | 98% open rate within 3 min vs 20% for email in 24h |
| Order/shipping updates | **SMS** | Customers want it now, on their phone |
| Flash sale / limited drop | **SMS** | Urgency channel; immediate read |
| Auth codes / 2FA | **SMS** (or app) | Latency-sensitive, must arrive in seconds |
| Welcome series | **Email primary, SMS layer** | Email carries the long-form content |
| Educational nurture | **Email** | Too much text for SMS, costs add up |
| Newsletter | **Email** | Wrong channel for SMS |
| Win-back lapsed customers | **Both** | SMS for the strong nudge, email for the offer detail |
| Post-purchase upsell | **SMS** | High open rate, ride the purchase momentum |

**General rule**: SMS earns the right to interrupt because of opt-in. Use it for messages that genuinely benefit from immediacy. If it could wait 24 hours, send it via email.

---

## Compliance — Read First

**Compliance is the foundation, not an afterthought.** A single TCPA class-action settlement runs $5M–$40M. The basics:

### US — TCPA (Telephone Consumer Protection Act)

1. **Express written consent** required for marketing SMS. Implied consent doesn't count.
2. **Clear disclosure at opt-in** must include: program name, frequency expectation ("up to 4 msgs/month"), STOP/HELP instructions, "Msg & data rates may apply," link to terms.
3. **Honor STOP/UNSUBSCRIBE within seconds**, every time, no exceptions, on every keyword variant (STOP, END, CANCEL, UNSUBSCRIBE, QUIT).
4. **Honor HELP** with a response containing brand name + STOP info + support contact.
5. **Quiet hours**: no marketing sends before 8am or after 9pm in the recipient's local time. Carrier rules and state laws (e.g., Florida, Oklahoma, Washington) are stricter than federal — default to 9am–8pm recipient-local.
6. **Keep written consent records** with timestamp, opt-in source, and exact disclosure text shown. Auditable.

### US — A2P 10DLC Registration (required since 2022)

Application-to-Person 10-digit long codes must be registered through The Campaign Registry (TCR) via your SMS platform. Without registration:
- Throughput is throttled (or zero)
- Carriers filter your messages
- You'll see "delivered" status but recipients won't get them

**Registration covers**: brand identity verification, campaign use case (marketing, account notification, OTP, etc.), sample messages, opt-in mechanism, opt-out language. Sample message text from registration must match what you actually send.

### EU/UK — GDPR-derived consent

- Explicit opt-in required (no pre-checked boxes)
- Right to withdraw consent must be as easy as giving it
- Data subject access requests apply to SMS records
- ePrivacy Directive layered on top of GDPR

### Canada — CASL

- Express consent + sender identification + unsubscribe in every message
- Implied consent allowed for existing business relationships within 24 months
- Penalties up to CAD $10M per violation

**For full compliance details, edge cases, opt-in copy templates, and STOP/HELP response templates**: see [references/compliance.md](references/compliance.md).

---

## Phone Number Types (US)

| Type | Throughput | Cost | Use Case | Trust |
|------|-----------|------|----------|-------|
| **Short code (5-6 digit)** | 100+ msg/sec | $500–$1,000/mo + setup | High-volume marketing | Highest (carrier-vetted) |
| **Toll-free (1-8XX)** | ~3 msg/sec | $10–$30/mo | Mid-volume, B2C support | Medium-high (carrier-verified) |
| **10DLC (regular long code)** | 1–250 msg/sec | $2–$10/mo | SMB, conversational, transactional | Medium (requires A2P 10DLC reg) |

**Rule of thumb**: list <10K = 10DLC. List 10K–100K = toll-free. List 100K+ = short code.

---

## Core Principles

### 1. Every send has a real cost
SMS isn't free. At $0.0075–$0.04 per send + carrier fees, a 100K send costs $750–$4,000. This forces relevance — you can't "blast." Segment hard.

### 2. Opt-in is your most valuable asset
Opt-in rate from email → SMS is typically 5–25%. A high-quality SMS list of 10K beats a low-quality list of 100K. Optimize opt-in quality, not volume.

### 3. Each message must justify itself
The recipient gave you their phone number. Every send should pass: "would I be glad I got this text?" If no, don't send.

### 4. Brevity + clarity
160 GSM-7 characters = 1 SMS segment. 161+ chars = 2 segments (you're billed for 2). Emojis force UCS-2 encoding (70 chars per segment). Plan for segment count.

### 5. One CTA, one link
Short links are mandatory (`klvy.co`, `txt.attn.tv`, branded short domain). Track UTM params on every link.

### 6. Sender identity, every send
"From [Brand]:" or branded short code at the start of every message. Even on automated flows. Recipients can't see "from" address — they need it inline.

---

## SMS Sequence Types

### Welcome / Opt-In Confirmation (immediate)

Send 1: Confirmation + reward (immediate)
> From Acme: Thanks for joining! Here's 10% off: ACME10. Use at checkout: acme.co/sale. Reply STOP to opt out.

Optional Send 2 (24h later): Reminder + best-seller showcase

### Abandoned Cart (highest-ROI flow for ecom)

- Send 1 (30 min after abandon): "Forget something? Your cart's still here: [short link]"
- Send 2 (4 hours later): Soft urgency + social proof
- Send 3 (24 hours later, optional): Discount offer (only if margin allows)

**Note**: Discount on first message trains customers to abandon. Reserve discount for Send 2 or 3.

### Browse Abandonment

- Send 1 (1 hour after browse): Product + "Thinking it over?" + link

### Post-Purchase

- Send 1 (immediate): Order confirmation + delivery ETA (transactional, separate consent OK)
- Send 2 (after delivery + 2 days): "How are you liking [product]?" + review prompt + cross-sell

### Win-Back (lapsed)

- Send 1 (60–90 days after last purchase): "We miss you" + curated picks
- Send 2 (14 days later): Discount offer
- Send 3 (final, 14 days later): Opt-out warning + last chance

### Promotional / Campaign Sends

- Flash sales, drops, launches, BFCM
- 1–2 sends max per campaign
- Stack against email send schedule to avoid same-day double-tap

### Transactional (separate compliance bucket)

- Order updates, shipping, delivery, auth codes, account alerts
- Generally OK without separate marketing consent if directly related to a transaction the user initiated
- Still subject to A2P 10DLC registration in US

**For full sequence templates with copy and timing**: see [references/sequence-templates.md](references/sequence-templates.md).

---

## SMS Copy Guidelines

### Structure
1. **Sender ID** ("From Acme:" or brand short code) — required
2. **Hook** — first 5 words decide if they read on
3. **Value** — what's in it for them, specifically
4. **CTA + short link** — single action, single URL
5. **Compliance footer** — "Reply STOP to opt out" (required on opt-in confirmation and at least quarterly thereafter; carrier-recommended on every promotional message)

### Length

- **160 chars (GSM-7)** = 1 segment. Aim here.
- **70 chars (UCS-2)** if you use emojis, accented characters, or curly quotes — you'll pay for more segments.
- **161–306 chars** = 2 segments (concatenated SMS). Acceptable for richer messages, but you're paying double per send.
- **MMS** (image + up to 1,600 chars) = 3–5× the SMS cost. Use sparingly for high-impact moments.

### Voice

- Conversational, not corporate. SMS feels personal — write like you're texting a friend.
- No subject line, no formatting, no marketing-speak.
- Emojis are fine in moderation (one per message, situationally).
- ALL CAPS reads as shouting. Avoid except for explicit codes (e.g., "Use ACME10").

### Personalization

- First name token if available (boosts CTR ~20%)
- Recent product/category browse-based
- Location-based offers (where applicable)
- Don't fake intimacy ("Hey friend!") — it backfires

**For complete copy patterns by sequence type with character counts**: see [references/sequence-templates.md](references/sequence-templates.md).

---

## Platform Selection

| Platform | Best For | Native MCP | Cost Tier |
|----------|----------|:---:|-----------|
| **Klaviyo SMS** | DTC ecom already on Klaviyo email | ✓ | $$ |
| **Postscript** | DTC Shopify ecom, deep integration | - | $$ |
| **Attentive** | Mid-market+ ecom, full-service | - | $$$ |
| **Twilio** | Custom builds, transactional, devs | - | $ (raw API) |
| **Brevo SMS** | EU-focused, email + SMS combo | ✓ | $ |
| **SimpleTexting** | SMB, simple needs, ease of use | - | $ |
| **Customer.io** | Behavior-based automation + SMS | - | $$ |

**Quick picks**:
- Already on Klaviyo for email + DTC/ecom → **Klaviyo SMS** (no second platform to learn)
- Shopify ecom, want deeper SMS-specific features → **Postscript**
- Building custom SMS into a product → **Twilio**
- B2B SaaS doing transactional/auth → **Twilio** or **Customer.io**

**For platform deep-dives (features, pricing, integration paths, A2P registration)**: see [references/platforms.md](references/platforms.md).

---

## Measurement

### Key Metrics

| Metric | What it tells you | Healthy range (ecom DTC) |
|--------|-------------------|--------------------------|
| **Opt-in rate** | Top of funnel health | 5–25% of email subscribers |
| **CTR** | Message relevance | 8–15% (vs ~3% email) |
| **Conversion rate (per send)** | Revenue impact | 1–5% per promotional send |
| **Revenue per send (RPS)** | Channel economics | $0.20–$2.00 |
| **Opt-out rate per send** | Audience fatigue | <2% per send, <0.5% for promotional |
| **Cost per send** | Channel cost discipline | $0.0075–$0.04 |
| **List growth rate** | Audience momentum | 5–15%/month early, 1–3% steady-state |

### What to track in analytics

- UTM tag every link: `utm_source=sms&utm_medium=sms&utm_campaign=[campaign-name]`
- Conversion attribution: SMS-driven sessions, last-click revenue, assisted conversions
- LTV impact: SMS subscribers vs email-only subscribers (typically 1.5–3× LTV for SMS opt-ins)

### What to A/B test

- Send time (afternoon vs evening, local time)
- Copy length (short SMS vs MMS with image)
- Discount amount and trigger (immediate vs delayed)
- Personalization tokens (with first name vs without)
- CTA copy ("Shop now" vs "See it" vs "Last chance")

Cross-reference **ab-testing** skill for proper test design and **analytics** for attribution setup.

---

## Output Format

When the user asks for an SMS plan, return:

1. **Compliance check**: Are they registered for A2P 10DLC (if US)? Is the opt-in mechanism compliant? Flag blockers first.
2. **Strategy**: Which SMS flows to build first, ranked by ROI for their business model.
3. **Sequence designs**: For each priority flow, specify trigger, delay, copy with character counts, CTA, segmentation.
4. **Platform recommendation**: Based on stack, list size, and complexity.
5. **Measurement plan**: KPIs, benchmarks, A/B test queue.
6. **Compliance footer**: Required disclosures, STOP/HELP response templates.

Keep recommendations specific. Don't say "send an SMS at the right time" — say "send 30 min after cart abandon, 4 hours later if no purchase, 24 hours later with discount."

---

## Task-Specific Questions

1. Are you US, EU, or both? (Changes compliance approach entirely.)
2. Is A2P 10DLC registration complete (US)?
3. What platform are you on or considering?
4. Email list size and SMS opt-in rate (if any)?
5. What sequences do you already have running?
6. Are you DTC ecom, mobile app, B2B SaaS, services?
7. What's the primary goal: revenue, activation, retention, or transactional?

---

## Common Mistakes

1. **Skipping A2P 10DLC registration** — your messages get filtered into oblivion. Register first, send second.
2. **Treating SMS like email** — sending daily promotional blasts. Opt-out rates spike, list dies.
3. **Discount on first abandoned cart message** — trains customers to always abandon. Reserve for second or third send.
4. **Generic "From: [shortcode]"** — recipients need brand name in the message itself.
5. **Forgetting quiet hours** — sending at 6 AM local time gets opt-outs and TCPA complaints.
6. **No STOP/HELP handling** — non-negotiable. Every platform handles this; verify yours does.
7. **Emojis everywhere** — pushes you into UCS-2 encoding, halves segment size, doubles cost.
8. **Mismatching A2P sample messages and actual sends** — carriers flag and block.
9. **Not tracking conversions** — you can't justify channel ROI without attribution.
10. **No throttling on bulk sends** — burst sends trigger carrier filtering. Use platform throttling.

---

## Tool Integrations

For implementation, see the [tools registry](../../tools/REGISTRY.md). Key SMS tools:

| Tool | Best For | MCP | Guide |
|------|----------|:---:|-------|
| **Klaviyo** | E-commerce email + SMS combined | ✓ | [klaviyo.md](../../tools/integrations/klaviyo.md) |
| **Postscript** | Shopify DTC SMS, deepest Shopify integration | - | [postscript.md](../../tools/integrations/postscript.md) |
| **Attentive** | Mid-market+ DTC SMS, full-service | - | [attentive.md](../../tools/integrations/attentive.md) |
| **Twilio** | Raw API for custom builds, transactional, dev-first | - | [twilio.md](../../tools/integrations/twilio.md) |
| **Plivo** | Twilio alternative, lower per-send cost | - | [plivo.md](../../tools/integrations/plivo.md) |
| **AudienceTap** | AI-forward DTC, on-pack QR opt-in | - | [audiencetap.md](../../tools/integrations/audiencetap.md) |
| **Brevo** | EU email + SMS, SMB-friendly | ✓ | [brevo.md](../../tools/integrations/brevo.md) |
| **Customer.io** | Behavior-based SMS automation | - | [customer-io.md](../../tools/integrations/customer-io.md) |

---

## Related Skills

- **emails**: Sister channel — almost always run together. Email carries the long-form content; SMS carries the urgent nudges.
- **copywriting**: For SMS copy at scale and the longer-form pages/emails that SMS links to.
- **popups**: For phone number capture popups on-site.
- **churn-prevention**: For win-back flows that combine SMS + email.
- **onboarding**: For post-signup SMS milestone nudges.
- **analytics**: For attribution and RPS measurement.
- **ab-testing**: For SMS-specific test design.
- **lead-magnets**: For incentivizing opt-in (the "10% off for joining" offer).

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/compliance.md

# SMS Compliance Reference

Comprehensive compliance reference for SMS marketing across major jurisdictions, opt-in copy templates, and STOP/HELP response templates.

> This is operational guidance, not legal advice. For high-volume programs (50K+ subscribers) or any program with non-trivial revenue, run your compliance setup past a TCPA-experienced attorney.

---

## United States — TCPA

### What it is

The Telephone Consumer Protection Act (1991, amended) regulates marketing calls and texts. The FCC enforces it; private plaintiffs sue under it. Statutory damages: $500–$1,500 **per message**. Class actions easily reach 7–8 figures.

### Consent tiers

| Type | What it covers | How to capture |
|------|---------------|----------------|
| **Express written consent** | Marketing SMS (sales, promotions, offers) | Checkbox + clear disclosure language, captured electronically with timestamp |
| **Express consent (non-written)** | Informational/transactional (delivery, account alerts) | Phone number provided during transaction with awareness it'll be used to text |
| **Established business relationship** | NOT sufficient for marketing SMS | Doesn't apply |

### Express written consent requirements

The opt-in flow must capture all of:

1. The recipient agreed to receive marketing SMS from your brand
2. The recipient understands consent is not a condition of purchase
3. The disclosure showed frequency expectation, message and data rate notice, STOP/HELP instructions, terms link
4. The agreement was electronically recorded with timestamp

### Opt-in disclosure template (compliant)

```
By signing up via text, you agree to receive recurring automated promotional and
personalized marketing text messages (e.g., cart reminders) from [Brand] at the
cell number used when signing up. Consent is not a condition of any purchase.
Reply HELP for help and STOP to cancel. Msg frequency varies. Msg & data rates
may apply. View [Terms](link) and [Privacy](link).
```

Place this **directly adjacent** to the phone number field and submit button. Do not bury it in a footer.

### Quiet hours

- **Federal**: 8am–9pm in the recipient's local time zone
- **Stricter states**: Florida (8am–8pm), Oklahoma (8am–8pm), Washington (8am–8pm)
- **Carrier-recommended**: 9am–8pm recipient-local
- **Practical default**: 9am–8pm recipient-local for safety

Time zone is determined by area code, but area codes lie (people move). Major platforms (Klaviyo, Postscript, Attentive) handle this automatically; verify yours does.

### STOP/HELP handling

**STOP variants you must honor**: STOP, END, CANCEL, UNSUBSCRIBE, QUIT, STOPALL, OPTOUT

**STOP response** (after STOP received):
```
You're unsubscribed from [Brand] alerts. No more messages will be sent. Reply HELP for help.
```

**HELP variants**: HELP, INFO

**HELP response**:
```
[Brand] alerts: For help, visit [URL] or email [support@brand.com]. Msg & data rates may apply. Reply STOP to cancel.
```

**Critical rules**:
- Honor STOP **within seconds**, every time, every keyword variant
- Do not require the recipient to log in or visit a website to opt out
- One STOP confirmation is allowed; do not send additional messages after
- HELP responses do not count as marketing messages and are not subject to quiet hours

### Sample TCPA-compliant footer language by sequence type

- **Opt-in confirmation**: "Reply HELP for help, STOP to cancel. Msg & data rates may apply." — required
- **Recurring promotional**: "Reply STOP to opt out" — required quarterly minimum; carrier-recommended every send
- **Transactional**: Not required by TCPA but carriers expect it; include for safety

---

## United States — A2P 10DLC

### What it is

Application-to-Person 10-Digit Long Code registration, run by The Campaign Registry (TCR). Required for businesses sending SMS through 10DLC numbers (regular long codes) since 2022. Carriers (T-Mobile, AT&T, Verizon) enforce this; unregistered traffic gets throttled or blocked.

### Registration components

1. **Brand registration**
   - Legal entity name, EIN, business type
   - Trust score assigned (Standard or Verified)
   - Higher trust = better throughput, lower fees

2. **Campaign registration** (one per use case)
   - Use case: Marketing, Account Notification, Customer Care, Public Service, Higher Education, Polling and Voting, 2FA, Delivery Notification, etc.
   - Sample message text (must match what you actually send)
   - Opt-in flow description and screenshot
   - Opt-out language
   - Help message language
   - Volume estimate

3. **Phone number assignment** to campaigns

### Throughput tiers (varies by carrier and trust score)

| Trust score + use case | Throughput |
|------------------------|-----------|
| Verified brand, marketing | 75–100+ msg/sec |
| Standard brand, marketing | 4–10 msg/sec |
| Unregistered | 0.1 msg/sec or blocked |

### Common rejections

- Sample message text doesn't match actual sends
- Opt-in flow screenshot doesn't show required disclosure language
- "SHAFT" content (Sex, Hate, Alcohol, Firearms, Tobacco) without explicit use case
- Generic or vague campaign descriptions

**Process time**: 1–7 business days. Plan for this in launch timelines.

---

## EU / UK — GDPR + ePrivacy Directive

### Consent requirements

- **Explicit opt-in**: clear affirmative action (no pre-checked boxes)
- **Specific**: opt-in must be for marketing SMS specifically, separate from generic ToS
- **Informed**: data subject must know who's processing and why
- **Freely given**: can't be bundled with service access

### Mandatory provisions

- Sender identity in every message
- Easy opt-out in every message
- Right to access data (DSARs)
- Right to deletion
- Records of consent kept for the duration of processing + statute of limitations

### Penalty exposure

GDPR fines up to €20M or 4% of global revenue, whichever is higher.

---

## Canada — CASL

### Consent

- **Express consent**: explicit opt-in (same standard as US TCPA express written consent)
- **Implied consent**: existing business relationship within 24 months — limited use, expires

### Every message must include

- Sender identification (legal name + any operating names)
- Mailing address
- Phone, email, or website contact
- Unsubscribe mechanism that works within 10 business days

### Penalty exposure

Up to CAD $10M per violation. Enforced by the CRTC.

---

## Australia — Spam Act 2003

- Express or inferred consent (inferred has narrow application)
- Sender ID required
- Functional unsubscribe required
- Enforced by ACMA

---

## Multi-jurisdictional programs

If you send across US + EU + Canada simultaneously:

- Default to the **strictest** standard across all jurisdictions (US TCPA express written consent + GDPR explicit opt-in)
- Track consent jurisdiction per subscriber
- Default quiet hours to recipient-local 9am–8pm
- Include all required identifiers in every message

---

## Audit-ready compliance checklist

- [ ] A2P 10DLC registration complete (US, if applicable)
- [ ] Opt-in flow includes all required disclosures, adjacent to phone field
- [ ] Disclosure text matches A2P registered sample messages
- [ ] Opt-in event captures: timestamp, IP, page URL, exact disclosure shown
- [ ] STOP/HELP keywords honored across all variants
- [ ] Quiet hours enforced at platform level (recipient-local time)
- [ ] Privacy policy includes SMS section
- [ ] Terms of service include SMS terms
- [ ] Consent records retained per applicable law (typically 4+ years US, longer EU)
- [ ] Process for handling DSARs (EU) and consent revocation
- [ ] Sender identity in every message
- [ ] Compliance footer on every promotional message (recommended) or quarterly minimum (required)
- [ ] Test STOP/HELP from a real phone number quarterly to verify it still works

### references/platforms.md

# SMS Platform Reference

Deep-dive on the major SMS marketing platforms — features, pricing, A2P 10DLC support, and integration paths.

> Pricing is approximate and changes regularly. Always confirm at the vendor's site before committing.

---

## Klaviyo SMS

**Best for**: DTC ecom brands already using Klaviyo for email.

### Key features
- Native integration with Klaviyo email and segmentation
- Shared subscriber profile across email + SMS
- Built-in A2P 10DLC registration
- Flow builder shared with email flows
- Conversational SMS (two-way) supported

### Pricing
- Bundled with Klaviyo plans, billed per SMS credit
- US: ~$0.0075–$0.015 per SMS; MMS ~$0.04
- Free tier: 150 SMS credits/month on lower email tiers

### Integration paths
- Direct Shopify, WooCommerce, BigCommerce, Magento integration
- API for custom platforms
- MCP server available

### Compliance
- A2P 10DLC registration handled in-platform
- Toll-free and short code provisioning available (short code adds $1,000+/mo)
- Quiet hours enforced per recipient time zone (configurable)

### Watch out for
- Email + SMS combined billing can spike fast on large lists
- Short code costs are real overhead; only worthwhile for 100K+ active SMS subscribers

---

## Postscript

**Best for**: Shopify-native DTC brands wanting SMS-specific tooling and onboarding support.

### Key features
- Deep Shopify integration (the deepest of any SMS platform)
- Strong abandoned cart and browse abandonment automations
- AI Reply (auto-reply trained on brand voice)
- Conversational SMS / live agent
- Audiences pulled from Shopify customer data

### Pricing
- Tiered plans: Starter (free, 1K msgs/mo), Growth ($100+/mo), Professional, Enterprise
- Pay-per-send adds on top: ~$0.015 per SMS, ~$0.04 per MMS

### Integration paths
- Shopify-first; limited support for non-Shopify
- API + webhooks available

### Compliance
- A2P 10DLC handled in-platform
- Strong opt-in compliance tools (popup builder, keyword opt-in)
- Quiet hours enforced

### Watch out for
- Steep cost increase past Starter tier
- Less useful if you're not on Shopify

---

## Attentive

**Best for**: Mid-market and enterprise DTC brands wanting full-service SMS.

### Key features
- Full-service: dedicated CSM, copy support, strategy
- Conversational SMS at scale
- Concierge sales-via-SMS
- Strong analytics and attribution
- Identity resolution (matching anon site visitors to phone numbers)

### Pricing
- Custom contracts; typically $1K–$10K+/mo + per-send fees
- Annual contracts standard
- Pricing rarely makes sense for <50K SMS subscribers

### Integration paths
- Shopify, BigCommerce, Salesforce Commerce Cloud, custom
- Robust API

### Compliance
- Full A2P 10DLC managed
- Best-in-class compliance tooling and audit support
- Short code provisioning included on most plans

### Watch out for
- Contract terms can lock you in for 12+ months
- Overkill for early-stage brands

---

## Twilio

**Best for**: Custom builds, transactional SMS, B2B SaaS embedding SMS into products, developers.

### Key features
- Raw SMS API
- Pay-per-send pricing, no platform fees
- Massive global coverage (200+ countries)
- Programmable Voice, WhatsApp Business, RCS available alongside
- Studio (visual flow builder) for non-code automation

### Pricing
- US 10DLC SMS: $0.0079 per message
- US toll-free SMS: $0.0079 per message
- US short code SMS: $0.0079 per message + $1,000/mo lease
- MMS: ~$0.02
- Carrier surcharges layered on top (~$0.005 per US 10DLC)
- A2P 10DLC registration: ~$15 brand + $10/mo per campaign

### Integration paths
- API-first (REST + SDKs in Node, Python, Ruby, Go, etc.)
- No native ecom integrations — you build them

### Compliance
- A2P 10DLC registration in-platform but you do the work
- TwilioSendGrid (separate product) handles email-side compliance
- Quiet hours and STOP/HELP handling must be implemented by you

### Watch out for
- You're responsible for compliance — no hand-holding
- No native segmentation, deliverability dashboards, or marketing UI
- Best paired with Customer.io, Segment, or a custom orchestration layer

---

## Brevo (formerly Sendinblue)

**Best for**: EU-based brands, email + SMS combo, SMB-friendly.

### Key features
- Combined email + SMS + WhatsApp on one platform
- EU-headquartered, GDPR-native
- Generous free tier for email; SMS pay-per-send
- Marketing automation flows
- CRM included

### Pricing
- Free tier: 300 emails/day; SMS pay-per-send
- US SMS: ~$0.015 per message
- EU SMS: varies by country, ~€0.04–€0.07

### Integration paths
- Direct integrations: Shopify, WooCommerce, WordPress, Magento
- API + Zapier
- MCP server available

### Compliance
- GDPR + ePrivacy built-in
- A2P 10DLC for US (less polished than dedicated US platforms)

### Watch out for
- US SMS features lag behind Klaviyo/Postscript
- Best if you're EU-first or already on Brevo for email

---

## SimpleTexting

**Best for**: SMB, services businesses, simple campaign blasts, low-volume.

### Key features
- Easy-to-use UI
- Keyword opt-in for grassroots list building
- Built-in landing pages for opt-in
- Simple automation

### Pricing
- Plans start ~$30/mo for 500 credits, scaling up
- US SMS only

### Integration paths
- Zapier, Make, native to a few apps
- API available but basic

### Compliance
- A2P 10DLC handled
- TCPA tooling

### Watch out for
- Limited automation depth vs Klaviyo/Postscript
- Best for low-complexity, low-volume use cases (gyms, salons, real estate)

---

## Plivo

**Best for**: Custom SMS builds where per-send cost matters; Twilio-style API at a lower price point.

### Key features
- Direct Twilio competitor with similar surface area
- Powerpack for bulk sending with sticky sender across number pools
- A2P 10DLC handled in-platform
- WhatsApp, voice available alongside SMS
- SDKs for major languages

### Pricing
- US 10DLC SMS: ~$0.0055/msg (typically 20–30% under Twilio)
- US short code SMS: similar + monthly lease
- MMS: ~$0.02
- Phone number rental: ~$0.80/mo local, ~$1/mo toll-free

### Integration paths
- API-first (REST + SDKs)
- No native ecom integrations — you build them

### Compliance
- A2P 10DLC managed in-platform
- Compliance plumbing (STOP/HELP, quiet hours) is your responsibility — same model as Twilio

### Watch out for
- Smaller ecosystem than Twilio (fewer ancillary products, integrations, community resources)
- WhatsApp tooling less mature

---

## AudienceTap

**Best for**: DTC brands wanting AI-forward creative tooling or on-pack QR opt-in as a primary acquisition channel.

> Newer platform — verify current capabilities, pricing, and API surface before committing.

### Key features
- SMS + email on one platform (similar combined model to Klaviyo)
- AI creative generation (SMS copy, subject lines, image variants)
- On-pack QR code opt-in: insert cards in shipped orders that drive SMS list growth
- Shopify, BigCommerce, headless commerce integrations
- A2P 10DLC managed in-platform
- Identity resolution and segmentation

### Pricing
- Tiered by subscriber count + send volume
- Per-send pricing comparable to other DTC SMS platforms

### Integration paths
- API access on Growth+ tiers
- Direct ecom integrations
- Webhooks for events

### Compliance
- A2P 10DLC handled in-platform
- TCPA tooling — verify enterprise-scale depth before committing for large lists

### Watch out for
- Newer entrant — fewer reference customers, less battle-tested at high volume than incumbents
- Some features rolled out recently — confirm what's GA vs beta before relying on them

---

## Customer.io

**Best for**: B2B SaaS, behavior-based automation, multi-channel orchestration (email + SMS + push).

### Key features
- Trigger SMS off product events (signup, milestone, churn risk)
- Powerful audience segmentation
- Workflow builder
- Real-time data sync via API/webhooks

### Pricing
- Plans start ~$150/mo, scaling with profile count
- SMS via Twilio integration or native (varies)

### Integration paths
- API-first
- Direct integrations with Segment, Heap, Mixpanel, etc.

### Compliance
- A2P 10DLC via Twilio if using native integration
- Granular subscription/consent management

### Watch out for
- Less ecom-tailored than Klaviyo/Postscript
- Best for product-led SaaS or apps with deep event tracking

---

## Quick selection table

| Stack / Goal | Recommended | Why |
|--------------|------------|-----|
| Shopify ecom, already on Klaviyo | **Klaviyo SMS** | One platform, one subscriber profile |
| Shopify ecom, SMS-first focus | **Postscript** | Deepest Shopify + SMS-specific features |
| Mid-market ecom, want concierge support | **Attentive** | Full-service team + tooling |
| Custom platform, B2B SaaS, transactional | **Twilio** | API-first, full control |
| Custom build, cost-sensitive | **Plivo** | ~20–30% cheaper than Twilio per send |
| DTC wanting AI creative or on-pack QR opt-in | **AudienceTap** | AI-forward; insert-card opt-in is unique |
| EU-based SMB | **Brevo** | GDPR-native, EU-friendly pricing |
| Local services SMB, simple campaigns | **SimpleTexting** | Easy UI, low overhead |
| Product-led SaaS with event tracking | **Customer.io** | Behavior-based triggers |

---

## A2P 10DLC: what your platform should handle

Whatever you pick, confirm your platform handles:

- [ ] Brand and campaign registration with TCR
- [ ] Sample message text aligned with what you actually send
- [ ] Opt-in flow documentation submitted to carriers
- [ ] Trust score visibility (and a path to improve it)
- [ ] Throughput appropriate to your list size and send frequency
- [ ] STOP/HELP keyword handling
- [ ] Quiet hours by recipient time zone
- [ ] Suppression list management
- [ ] Consent record retention with timestamps

All major platforms above handle these. Twilio does the lowest-level work and pushes more responsibility onto you.

### references/sequence-templates.md

# SMS Sequence Templates

Full copy templates with character counts, timing, and segmentation logic for every major SMS flow.

> Character counts shown assume GSM-7 encoding. Emojis force UCS-2 (70 chars/segment instead of 160). All templates use `[Brand]`, `[FirstName]`, and `[short.link]` as substitution tokens.

---

## Welcome / Opt-In Confirmation

### Send 1 — Immediate (after opt-in)

```
From [Brand]: Welcome! Here's your 10% off code: WELCOME10. Shop now: [short.link]
Reply STOP to opt out, HELP for help. Msg & data rates may apply.
```
~155 chars / 1 segment (just). Footer required on first send.

### Send 2 — 24 hours later (optional)

```
From [Brand]: Don't forget your code WELCOME10 — expires in 48hrs. Top picks: [short.link]
```
~108 chars / 1 segment.

### Send 3 — 7 days later (optional, conditional on no purchase)

```
From [Brand]: Last chance for 10% off with WELCOME10. Expires tonight at midnight: [short.link]
```
~107 chars / 1 segment.

---

## Abandoned Cart (highest-ROI flow for ecom)

### Send 1 — 30 minutes after abandon

```
From [Brand]: Hey [FirstName], you left something behind! Your cart's here: [short.link]
```
~95 chars / 1 segment.

### Send 2 — 4 hours after abandon (if no purchase)

```
From [Brand]: Items in your cart are selling fast. Reserved for you for 24hrs: [short.link]
```
~98 chars / 1 segment.

### Send 3 — 24 hours after abandon (if no purchase, discount allowed)

```
From [Brand]: Still thinking? Here's 10% off to seal the deal: SAVE10. Shop: [short.link]
```
~99 chars / 1 segment.

**Notes**:
- Discount on Send 1 trains customers to abandon. Reserve for Send 2 or 3.
- Exclude customers who abandoned <$X in cart value or repeat abandoners (gaming the discount).
- Stop sequence on purchase, opt-out, or 48 hours elapsed.

---

## Browse Abandonment

### Send 1 — 1 hour after browse (single product or category)

```
From [Brand]: Still thinking about [product]? Take another look: [short.link]
```
~84 chars / 1 segment.

**Notes**:
- Trigger only after meaningful browse signal (3+ product views or 2+ min on product page).
- Exclude if a purchase happened on a different product.

---

## Post-Purchase Flow

### Send 1 — Immediately after purchase (transactional, separate consent)

```
From [Brand]: Order #12345 confirmed! We'll text shipping updates here. Track: [short.link]
```
~95 chars / 1 segment.

### Send 2 — Day of shipment

```
From [Brand]: Your order's on the way. Estimated delivery: [date]. Track: [short.link]
```
~92 chars / 1 segment.

### Send 3 — Day of delivery

```
From [Brand]: Your order should arrive today! Questions? Reply or visit [short.link]
```
~88 chars / 1 segment.

### Send 4 — 2 days after delivery (marketing consent required)

```
From [Brand]: How are you liking your [product]? Share a review for 15% off next order: [short.link]
```
~108 chars / 1 segment.

### Send 5 — 14 days after delivery (cross-sell, marketing consent)

```
From [Brand]: Goes great with your [product]: [related-item]. 10% off bundle: [short.link]
```
~99 chars / 1 segment.

---

## Win-Back (Lapsed Customers)

### Send 1 — 60-90 days after last purchase

```
From [Brand]: [FirstName], we miss you! Picks we think you'll love: [short.link]
```
~84 chars / 1 segment.

### Send 2 — 14 days later (if no purchase)

```
From [Brand]: Come back for 15% off your next order: COMEBACK15. Expires in 7 days: [short.link]
```
~106 chars / 1 segment.

### Send 3 — 14 days after Send 2 (final, if no purchase)

```
From [Brand]: Last chance — 20% off ends tonight: COMEBACK20. We'll stop texting if you'd rather: reply STOP. [short.link]
```
~130 chars / 1 segment.

**Notes**:
- After Send 3 with no engagement, suppress for 90 days minimum.
- After two full win-back cycles with no engagement, sunset (remove from active list).

---

## Promotional / Campaign Sends

### Flash sale (single send)

```
From [Brand]: 24-HOUR FLASH: 25% off everything with FLASH25. Ends midnight: [short.link]
```
~94 chars / 1 segment.

### Limited drop / launch

```
From [Brand]: New drop just landed: [product-name]. Limited stock, members get early access: [short.link]
```
~115 chars / 1 segment.

### Holiday / BFCM (2-send sequence)

Send 1 — Day of launch:
```
From [Brand]: Black Friday is LIVE — up to 50% off sitewide. Shop now: [short.link]
```
~92 chars / 1 segment.

Send 2 — Day of (or evening, expiration push):
```
From [Brand]: Last 6 hours of BFCM savings. Don't miss out: [short.link]
```
~73 chars / 1 segment.

---

## Transactional / Account Notifications

### Order confirmation

```
[Brand]: Order #12345 confirmed. Total $XX.XX. Track at [short.link]. Reply HELP for help.
```

### Shipping update

```
[Brand]: Your order #12345 shipped! Track: [short.link]. ETA [date].
```

### Delivery confirmation

```
[Brand]: Order #12345 delivered. Enjoy! Issues? Reply or [support-link].
```

### Auth code (2FA)

```
[Brand] verification code: 123456. Expires in 10 min. Do not share.
```

### Account alert

```
[Brand]: Sign-in from new device in [location]. Wasn't you? Secure: [short.link]
```

---

## Re-Engagement / Reactivation (Subscribers Who've Gone Cold)

For SMS subscribers who haven't engaged with any send in 60+ days.

### Send 1 — Soft reactivation

```
From [Brand]: We've missed you, [FirstName]! Here's what's new: [short.link]
```
~80 chars / 1 segment.

### Send 2 — Confirm interest (if no engagement)

```
From [Brand]: Want to keep hearing from us? Reply YES to stay on the list, or STOP to opt out.
```
~98 chars / 1 segment.

After no reply: suppress for 60 days, then remove from active list. This protects opt-out rate metrics and reduces wasted spend.

---

## Replenishment (Consumables Ecom)

For products with predictable usage cycles (skincare, supplements, coffee, pet food).

### Send 1 — At expected reorder window (e.g., 28 days for a 30-day supply)

```
From [Brand]: Running low on [product]? Reorder in one tap: [short.link]
```
~73 chars / 1 segment.

### Send 2 — 7 days later (if no purchase)

```
From [Brand]: Don't run out! 10% off your reorder of [product]: REFILL10 [short.link]
```
~92 chars / 1 segment.

---

## VIP / Loyalty Members

Higher frequency, exclusive offers, early access — different cadence rules apply but quiet hours and STOP still required.

### Early access

```
From [Brand]: VIPs get the new drop 24hrs early. Yours now: [short.link]
```
~72 chars / 1 segment.

### Loyalty milestone

```
From [Brand]: You've reached Gold status! Your perks: 15% off + free shipping. [short.link]
```
~95 chars / 1 segment.

---

## Segmentation rules across all flows

- **Suppress** customers in active sequences from promotional sends (no double-tap)
- **Suppress** opted-out subscribers from everything (platform handles this)
- **Frequency cap**: max 4–6 marketing sends/week per subscriber (lower for newer subscribers)
- **Quiet hours**: 9am–8pm recipient-local time
- **Cool-off**: After a discount-driven purchase, suppress promotional sends for 14 days

