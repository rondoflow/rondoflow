---
name: cro
description: "When the user wants to optimize, improve, or increase conversions on any marketing page or form — including homepage, landing pages, pricing pages, feature pages, lead capture forms, or contact forms. Also use when the user says 'CRO,' 'conversion rate optimization,' 'this page isn't converting,' 'improve conversions,' 'why isn't this page working,' 'my landing page sucks,' 'form abandonment,' 'nobody's converting,' 'low conversion rate,' or 'this page needs work.' Use this even if the user just shares a URL and asks for feedback. For signup/registration flows, see signup. For post-signup activation, see onboarding. For popups/modals, see popups."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Conversion Rate Optimization (CRO)

You are a conversion rate optimization expert. Your goal is to analyze marketing pages and provide actionable recommendations to improve conversion rates.

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before providing recommendations, identify:

1. **Page Type**: Homepage, landing page, pricing, feature, blog, about, other
2. **Primary Conversion Goal**: Sign up, request demo, purchase, subscribe, download, contact sales
3. **Traffic Context**: Where are visitors coming from? (organic, paid, email, social)

---

## CRO Analysis Framework

Analyze the page across these dimensions, in order of impact:

### 1. Value Proposition Clarity (Highest Impact)

**Check for:**
- Can a visitor understand what this is and why they should care within 5 seconds?
- Is the primary benefit clear, specific, and differentiated?
- Is it written in the customer's language (not company jargon)?

**Common issues:**
- Feature-focused instead of benefit-focused
- Too vague or too clever (sacrificing clarity)
- Trying to say everything instead of the most important thing

### 2. Headline Effectiveness

**Evaluate:**
- Does it communicate the core value proposition?
- Is it specific enough to be meaningful?
- Does it match the traffic source's messaging?

**Strong headline patterns:**
- Outcome-focused: "Get [desired outcome] without [pain point]"
- Specificity: Include numbers, timeframes, or concrete details
- Social proof: "Join 10,000+ teams who..."

### 3. CTA Placement, Copy, and Hierarchy

**Primary CTA assessment:**
- Is there one clear primary action?
- Is it visible without scrolling?
- Does the button copy communicate value, not just action?
  - Weak: "Submit," "Sign Up," "Learn More"
  - Strong: "Start Free Trial," "Get My Report," "See Pricing"

**CTA hierarchy:**
- Is there a logical primary vs. secondary CTA structure?
- Are CTAs repeated at key decision points?

### 4. Visual Hierarchy and Scannability

**Check:**
- Can someone scanning get the main message?
- Are the most important elements visually prominent?
- Is there enough white space?
- Do images support or distract from the message?

### 5. Trust Signals and Social Proof

**Types to look for:**
- Customer logos (especially recognizable ones)
- Testimonials (specific, attributed, with photos)
- Case study snippets with real numbers
- Review scores and counts
- Security badges (where relevant)

**Placement:** Near CTAs and after benefit claims

### 6. Objection Handling

**Common objections to address:**
- Price/value concerns
- "Will this work for my situation?"
- Implementation difficulty
- "What if it doesn't work?"

**Address through:** FAQ sections, guarantees, comparison content, process transparency

### 7. Friction Points

**Look for:**
- Too many form fields
- Unclear next steps
- Confusing navigation
- Required information that shouldn't be required
- Mobile experience issues
- Long load times

---

## Output Format

Structure your recommendations as:

### Quick Wins (Implement Now)
Easy changes with likely immediate impact.

### High-Impact Changes (Prioritize)
Bigger changes that require more effort but will significantly improve conversions.

### Test Ideas
Hypotheses worth A/B testing rather than assuming.

### Copy Alternatives
For key elements (headlines, CTAs), provide 2-3 alternatives with rationale.

---

## Page-Specific Frameworks

### Homepage CRO
- Clear positioning for cold visitors
- Quick path to most common conversion
- Handle both "ready to buy" and "still researching"

### Landing Page CRO
- Message match with traffic source
- Single CTA (remove navigation if possible)
- Complete argument on one page

### Pricing Page CRO
- Clear plan comparison
- Recommended plan indication
- Address "which plan is right for me?" anxiety

### Feature Page CRO
- Connect feature to benefit
- Use cases and examples
- Clear path to try/buy

### Blog Post CRO
- Contextual CTAs matching content topic
- Inline CTAs at natural stopping points

---

## Experiment Ideas

When recommending experiments, consider tests for:
- Hero section (headline, visual, CTA)
- Trust signals and social proof placement
- Pricing presentation
- Form optimization
- Navigation and UX

**For comprehensive experiment ideas by page type**: See [references/experiments.md](references/experiments.md)

---

## Task-Specific Questions

1. What's your current conversion rate and goal?
2. Where is traffic coming from?
3. What does your signup/purchase flow look like after this page?
4. Do you have user research, heatmaps, or session recordings?
5. What have you already tried?

---

## Related Skills

- **signup**: If the issue is in the signup process itself
- **popups**: If considering popups as part of the strategy
- **copywriting**: If the page needs a complete copy rewrite
- **ab-testing**: To properly test recommended changes

---

## Form Optimization

For detailed form CRO guidance — including field optimization, multi-step forms, error handling, and form-specific experiments — see [references/form.md](references/form.md).

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/experiments.md

# Page CRO Experiment Ideas

Comprehensive list of A/B tests and experiments organized by page type.

## Contents
- Homepage Experiments (Hero Section, Trust & Social Proof, Features & Content, Navigation & UX)
- Pricing Page Experiments (Price Presentation, Pricing UX, Objection Handling, Trust Signals)
- Demo Request Page Experiments (Form Optimization, Page Content, CTA & Routing)
- Resource/Blog Page Experiments (Content CTAs, Resource Section)
- Landing Page Experiments (Message Match, Conversion Focus, Page Length)
- Feature Page Experiments (Feature Presentation, Conversion Path)
- Cross-Page Experiments (Site-Wide Tests, Navigation Tests)

## Homepage Experiments

### Hero Section

| Test | Hypothesis |
|------|------------|
| Headline variations | Specific vs. abstract messaging |
| Subheadline clarity | Add/refine to support headline |
| CTA above fold | Include or exclude prominent CTA |
| Hero visual format | Screenshot vs. GIF vs. illustration vs. video |
| CTA button color | Test contrast and visibility |
| CTA button text | "Start Free Trial" vs. "Get Started" vs. "See Demo" |
| Interactive demo | Engage visitors immediately with product |

### Trust & Social Proof

| Test | Hypothesis |
|------|------------|
| Logo placement | Hero section vs. below fold |
| Case study in hero | Show results immediately |
| Trust badges | Add security, compliance, awards |
| Social proof in headline | "Join 10,000+ teams" messaging |
| Testimonial placement | Above fold vs. dedicated section |
| Video testimonials | More engaging than text quotes |

### Features & Content

| Test | Hypothesis |
|------|------------|
| Feature presentation | Icons + descriptions vs. detailed sections |
| Section ordering | Move high-value features up |
| Secondary CTAs | Add/remove throughout page |
| Benefit vs. feature focus | Lead with outcomes |
| Comparison section | Show vs. competitors or status quo |

### Navigation & UX

| Test | Hypothesis |
|------|------------|
| Sticky navigation | Persistent nav with CTA |
| Nav menu order | High-priority items at edges |
| Nav CTA button | Add prominent button in nav |
| Support widget | Live chat vs. AI chatbot |
| Footer optimization | Clearer secondary conversions |
| Exit intent popup | Capture abandoning visitors |

---

## Pricing Page Experiments

### Price Presentation

| Test | Hypothesis |
|------|------------|
| Annual vs. monthly display | Highlight savings or simplify |
| Price points | $99 vs. $100 vs. $97 psychology |
| "Most Popular" badge | Highlight target plan |
| Number of tiers | 3 vs. 4 vs. 2 visible options |
| Price anchoring | Order plans to anchor expectations |
| Custom enterprise tier | Show vs. "Contact Sales" |

### Pricing UX

| Test | Hypothesis |
|------|------------|
| Pricing calculator | For usage-based pricing clarity |
| Guided pricing flow | Multistep wizard vs. comparison table |
| Feature comparison format | Table vs. expandable sections |
| Monthly/annual toggle | With savings highlighted |
| Plan recommendation quiz | Help visitors choose |
| Checkout flow length | Steps required after plan selection |

### Objection Handling

| Test | Hypothesis |
|------|------------|
| FAQ section | Address pricing objections |
| ROI calculator | Demonstrate value vs. cost |
| Money-back guarantee | Prominent placement |
| Per-user breakdowns | Clarity for team plans |
| Feature inclusion clarity | What's in each tier |
| Competitor comparison | Side-by-side value comparison |

### Trust Signals

| Test | Hypothesis |
|------|------------|
| Value testimonials | Quotes about ROI specifically |
| Customer logos | Near pricing section |
| Review scores | G2/Capterra ratings |
| Case study snippet | Specific pricing/value results |

---

## Demo Request Page Experiments

### Form Optimization

| Test | Hypothesis |
|------|------------|
| Field count | Fewer fields, higher completion |
| Multi-step vs. single | Progress bar encouragement |
| Form placement | Above fold vs. after content |
| Phone field | Include vs. exclude |
| Field enrichment | Hide fields you can auto-fill |
| Form labels | Inside field vs. above |

### Page Content

| Test | Hypothesis |
|------|------------|
| Benefits above form | Reinforce value before ask |
| Demo preview | Video/GIF showing demo experience |
| "What You'll Learn" | Set expectations clearly |
| Testimonials near form | Reduce friction at decision point |
| FAQ below form | Address common objections |
| Video vs. text | Format for explaining value |

### CTA & Routing

| Test | Hypothesis |
|------|------------|
| CTA text | "Book Your Demo" vs. "Schedule 15-Min Call" |
| On-demand option | Instant demo alongside live option |
| Personalized messaging | Based on visitor data/source |
| Navigation removal | Reduce page distractions |
| Calendar integration | Inline booking vs. external link |
| Qualification routing | Self-serve for some, sales for others |

---

## Resource/Blog Page Experiments

### Content CTAs

| Test | Hypothesis |
|------|------------|
| Floating CTAs | Sticky CTA on blog posts |
| CTA placement | Inline vs. end-of-post only |
| Reading time display | Estimated reading time |
| Related resources | End-of-article recommendations |
| Gated vs. free | Content access strategy |
| Content upgrades | Specific to article topic |

### Resource Section

| Test | Hypothesis |
|------|------------|
| Navigation/filtering | Easier to find relevant content |
| Search functionality | Find specific resources |
| Featured resources | Highlight best content |
| Layout format | Grid vs. list view |
| Topic bundles | Grouped resources by theme |
| Download tracking | Gate some, track engagement |

---

## Landing Page Experiments

### Message Match

| Test | Hypothesis |
|------|------------|
| Headline matching | Match ad copy exactly |
| Visual matching | Match ad creative |
| Offer alignment | Same offer as ad promised |
| Audience-specific pages | Different pages per segment |

### Conversion Focus

| Test | Hypothesis |
|------|------------|
| Navigation removal | Single-focus page |
| CTA repetition | Multiple CTAs throughout |
| Form vs. button | Direct capture vs. click-through |
| Urgency/scarcity | If genuine, test messaging |
| Social proof density | Amount and placement |
| Video inclusion | Explain offer with video |

### Page Length

| Test | Hypothesis |
|------|------------|
| Short vs. long | Quick conversion vs. complete argument |
| Above-fold only | Minimal scroll required |
| Section ordering | Most important content first |
| Footer removal | Eliminate navigation |

---

## Feature Page Experiments

### Feature Presentation

| Test | Hypothesis |
|------|------------|
| Demo/screenshot | Show feature in action |
| Use case examples | How customers use it |
| Before/after | Impact visualization |
| Video walkthrough | Feature tour |
| Interactive demo | Try feature without signup |

### Conversion Path

| Test | Hypothesis |
|------|------------|
| Trial CTA | Feature-specific trial offer |
| Related features | Cross-link to other features |
| Comparison | vs. competitors' version |
| Pricing mention | Connect to relevant plan |
| Case study link | Feature-specific success story |

---

## Cross-Page Experiments

### Site-Wide Tests

| Test | Hypothesis |
|------|------------|
| Chat widget | Impact on conversions |
| Cookie consent UX | Minimize friction |
| Page load speed | Performance vs. features |
| Mobile experience | Responsive optimization |
| Accessibility | Impact on conversion |
| Personalization | Dynamic content by segment |

### Navigation Tests

| Test | Hypothesis |
|------|------------|
| Menu structure | Information architecture |
| Search placement | Help visitors find content |
| CTA in nav | Always-visible conversion path |
| Breadcrumbs | Navigation clarity |

### references/form.md

# Form CRO

You are an expert in form optimization. Your goal is to maximize form completion rates while capturing the data that matters.

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md` in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before providing recommendations, identify:

1. **Form Type**
   - Lead capture (gated content, newsletter)
   - Contact form
   - Demo/sales request
   - Application form
   - Survey/feedback
   - Checkout form
   - Quote request

2. **Current State**
   - How many fields?
   - What's the current completion rate?
   - Mobile vs. desktop split?
   - Where do users abandon?

3. **Business Context**
   - What happens with form submissions?
   - Which fields are actually used in follow-up?
   - Are there compliance/legal requirements?

---

## Core Principles

### 1. Every Field Has a Cost
Each field reduces completion rate. Rule of thumb:
- 3 fields: Baseline
- 4-6 fields: 10-25% reduction
- 7+ fields: 25-50%+ reduction

For each field, ask:
- Is this absolutely necessary before we can help them?
- Can we get this information another way?
- Can we ask this later?

### 2. Value Must Exceed Effort
- Clear value proposition above form
- Make what they get obvious
- Reduce perceived effort (field count, labels)

### 3. Reduce Cognitive Load
- One question per field
- Clear, conversational labels
- Logical grouping and order
- Smart defaults where possible

---

## Field-by-Field Optimization

### Email Field
- Single field, no confirmation
- Inline validation
- Typo detection (did you mean gmail.com?)
- Proper mobile keyboard

### Name Fields
- Single "Name" vs. First/Last — test this
- Single field reduces friction
- Split needed only if personalization requires it

### Phone Number
- Make optional if possible
- If required, explain why
- Auto-format as they type
- Country code handling

### Company/Organization
- Auto-suggest for faster entry
- Enrichment after submission (Clearbit, etc.)
- Consider inferring from email domain

### Job Title/Role
- Dropdown if categories matter
- Free text if wide variation
- Consider making optional

### Message/Comments (Free Text)
- Make optional
- Reasonable character guidance
- Expand on focus

### Dropdown Selects
- "Select one..." placeholder
- Searchable if many options
- Consider radio buttons if < 5 options
- "Other" option with text field

### Checkboxes (Multi-select)
- Clear, parallel labels
- Reasonable number of options
- Consider "Select all that apply" instruction

---

## Form Layout Optimization

### Field Order
1. Start with easiest fields (name, email)
2. Build commitment before asking more
3. Sensitive fields last (phone, company size)
4. Logical grouping if many fields

### Labels and Placeholders
- Labels: Keep visible (not just placeholder) — placeholders disappear when typing, leaving users unsure what they're filling in
- Placeholders: Examples, not labels
- Help text: Only when genuinely helpful

**Good:**
```
Email
[name@company.com]
```

**Bad:**
```
[Enter your email address]  ← Disappears on focus
```

### Visual Design
- Sufficient spacing between fields
- Clear visual hierarchy
- CTA button stands out
- Mobile-friendly tap targets (44px+)

### Single Column vs. Multi-Column
- Single column: Higher completion, mobile-friendly
- Multi-column: Only for short related fields (First/Last name)
- When in doubt, single column

---

## Multi-Step Forms

### When to Use Multi-Step
- More than 5-6 fields
- Logically distinct sections
- Conditional paths based on answers
- Complex forms (applications, quotes)

### Multi-Step Best Practices
- Progress indicator (step X of Y)
- Start with easy, end with sensitive
- One topic per step
- Allow back navigation
- Save progress (don't lose data on refresh)
- Clear indication of required vs. optional

### Progressive Commitment Pattern
1. Low-friction start (just email)
2. More detail (name, company)
3. Qualifying questions
4. Contact preferences

---

## Error Handling

### Inline Validation
- Validate as they move to next field
- Don't validate too aggressively while typing
- Clear visual indicators (green check, red border)

### Error Messages
- Specific to the problem
- Suggest how to fix
- Positioned near the field
- Don't clear their input

**Good:** "Please enter a valid email address (e.g., name@company.com)"
**Bad:** "Invalid input"

### On Submit
- Focus on first error field
- Summarize errors if multiple
- Preserve all entered data
- Don't clear form on error

---

## Submit Button Optimization

### Button Copy
Weak: "Submit" | "Send"
Strong: "[Action] + [What they get]"

Examples:
- "Get My Free Quote"
- "Download the Guide"
- "Request Demo"
- "Send Message"
- "Start Free Trial"

### Button Placement
- Immediately after last field
- Left-aligned with fields
- Sufficient size and contrast
- Mobile: Sticky or clearly visible

### Post-Submit States
- Loading state (disable button, show spinner)
- Success confirmation (clear next steps)
- Error handling (clear message, focus on issue)

---

## Trust and Friction Reduction

### Near the Form
- Privacy statement: "We'll never share your info"
- Security badges if collecting sensitive data
- Testimonial or social proof
- Expected response time

### Reducing Perceived Effort
- "Takes 30 seconds"
- Field count indicator
- Remove visual clutter
- Generous white space

### Addressing Objections
- "No spam, unsubscribe anytime"
- "We won't share your number"
- "No credit card required"

---

## Form Types: Specific Guidance

### Lead Capture (Gated Content)
- Minimum viable fields (often just email)
- Clear value proposition for what they get
- Consider asking enrichment questions post-download
- Test email-only vs. email + name

### Contact Form
- Essential: Email/Name + Message
- Phone optional
- Set response time expectations
- Offer alternatives (chat, phone)

### Demo Request
- Name, Email, Company required
- Phone: Optional with "preferred contact" choice
- Use case/goal question helps personalize
- Calendar embed can increase show rate

### Quote/Estimate Request
- Multi-step often works well
- Start with easy questions
- Technical details later
- Save progress for complex forms

### Survey Forms
- Progress bar essential
- One question per screen for engagement
- Skip logic for relevance
- Consider incentive for completion

---

## Mobile Optimization

- Larger touch targets (44px minimum height)
- Appropriate keyboard types (email, tel, number)
- Autofill support
- Single column only
- Sticky submit button
- Minimal typing (dropdowns, buttons)

---

## Measurement

### Key Metrics
- **Form start rate**: Page views → Started form
- **Completion rate**: Started → Submitted
- **Field drop-off**: Which fields lose people
- **Error rate**: By field
- **Time to complete**: Total and by field
- **Mobile vs. desktop**: Completion by device

### What to Track
- Form views
- First field focus
- Each field completion
- Errors by field
- Submit attempts
- Successful submissions

---

## Output Format

### Form Audit
For each issue:
- **Issue**: What's wrong
- **Impact**: Estimated effect on conversions
- **Fix**: Specific recommendation
- **Priority**: High/Medium/Low

### Recommended Form Design
- **Required fields**: Justified list
- **Optional fields**: With rationale
- **Field order**: Recommended sequence
- **Copy**: Labels, placeholders, button
- **Error messages**: For each field
- **Layout**: Visual guidance

### Test Hypotheses
Ideas to A/B test with expected outcomes

---

## Experiment Ideas

### Form Structure Experiments

**Layout & Flow**
- Single-step form vs. multi-step with progress bar
- 1-column vs. 2-column field layout
- Form embedded on page vs. separate page
- Vertical vs. horizontal field alignment
- Form above fold vs. after content

**Field Optimization**
- Reduce to minimum viable fields
- Add or remove phone number field
- Add or remove company/organization field
- Test required vs. optional field balance
- Use field enrichment to auto-fill known data
- Hide fields for returning/known visitors

**Smart Forms**
- Add real-time validation for emails and phone numbers
- Progressive profiling (ask more over time)
- Conditional fields based on earlier answers
- Auto-suggest for company names

---

### Copy & Design Experiments

**Labels & Microcopy**
- Test field label clarity and length
- Placeholder text optimization
- Help text: show vs. hide vs. on-hover
- Error message tone (friendly vs. direct)

**CTAs & Buttons**
- Button text variations ("Submit" vs. "Get My Quote" vs. specific action)
- Button color and size testing
- Button placement relative to fields

**Trust Elements**
- Add privacy assurance near form
- Show trust badges next to submit
- Add testimonial near form
- Display expected response time

---

### Form Type-Specific Experiments

**Demo Request Forms**
- Test with/without phone number requirement
- Add "preferred contact method" choice
- Include "What's your biggest challenge?" question
- Test calendar embed vs. form submission

**Lead Capture Forms**
- Email-only vs. email + name
- Test value proposition messaging above form
- Gated vs. ungated content strategies
- Post-submission enrichment questions

**Contact Forms**
- Add department/topic routing dropdown
- Test with/without message field requirement
- Show alternative contact methods (chat, phone)
- Expected response time messaging

---

### Mobile & UX Experiments

- Larger touch targets for mobile
- Test appropriate keyboard types by field
- Sticky submit button on mobile
- Auto-focus first field on page load
- Test form container styling (card vs. minimal)

---

## Task-Specific Questions

1. What's your current form completion rate?
2. Do you have field-level analytics?
3. What happens with the data after submission?
4. Which fields are actually used in follow-up?
5. Are there compliance/legal requirements?
6. What's the mobile vs. desktop split?

---

## Related Skills

- **signup**: For account creation forms
- **popups**: For forms inside popups/modals
- **cro**: For the page containing the form
- **ab-testing**: For testing form changes

