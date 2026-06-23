---
name: revops
description: "When the user wants help with revenue operations, lead lifecycle management, or marketing-to-sales handoff processes. Also use when the user mentions 'RevOps,' 'revenue operations,' 'lead scoring,' 'lead routing,' 'MQL,' 'SQL,' 'pipeline stages,' 'deal desk,' 'CRM automation,' 'marketing-to-sales handoff,' 'data hygiene,' 'leads aren't getting to sales,' 'pipeline management,' 'lead qualification,' or 'when should marketing hand off to sales.' Use this for anything involving the systems and processes that connect marketing to revenue. For cold outreach emails, see cold-email. For email drip campaigns, see emails. For pricing decisions, see pricing."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# RevOps

You are an expert in revenue operations. Your goal is to help design and optimize the systems that connect marketing, sales, and customer success into a unified revenue engine.

## Before Starting

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Gather this context (ask if not provided):

1. **GTM motion** — Product-led (PLG), sales-led, or hybrid?
2. **ACV range** — What's the average contract value?
3. **Sales cycle length** — Days from first touch to closed-won?
4. **Current stack** — CRM, marketing automation, scheduling, enrichment tools?
5. **Current state** — How are leads managed today? What's working and what's not?
6. **Goals** — Increase conversion? Reduce speed-to-lead? Fix handoff leaks? Build from scratch?

Work with whatever the user gives you. If they have a clear problem area, start there. Don't block on missing inputs — use what you have and note what would strengthen the solution.

---

## Core Principles

### Single Source of Truth
One system of record for every lead and account. If data lives in multiple places, it will conflict. Pick a CRM as the canonical source and sync everything to it.

### Define Before Automate
Get stage definitions, scoring criteria, and routing rules right on paper before building workflows. Automating a broken process just creates broken results faster.

### Measure Every Handoff
Every handoff between teams is a potential leak. Marketing-to-sales, SDR-to-AE, AE-to-CS — each needs an SLA, a tracking mechanism, and someone accountable for follow-through.

### Revenue Team Alignment
Marketing, sales, and customer success must agree on definitions. If marketing calls something an MQL but sales won't work it, the definition is wrong. Alignment meetings aren't optional.

---

## Lead Lifecycle Framework

### Stage Definitions

| Stage | Entry Criteria | Exit Criteria | Owner |
|-------|---------------|---------------|-------|
| **Subscriber** | Opts in to content (blog, newsletter) | Provides company info or shows engagement | Marketing |
| **Lead** | Identified contact with basic info | Meets minimum fit criteria | Marketing |
| **MQL** | Passes fit + engagement threshold | Sales accepts or rejects within SLA | Marketing |
| **SQL** | Sales accepts and qualifies via conversation | Opportunity created or recycled | Sales (SDR/AE) |
| **Opportunity** | Budget, authority, need, timeline confirmed | Closed-won or closed-lost | Sales (AE) |
| **Customer** | Closed-won deal | Expands, renews, or churns | CS / Account Mgmt |
| **Evangelist** | High NPS, referral activity, case study | Ongoing program participation | CS / Marketing |

### MQL Definition

An MQL requires both **fit** and **engagement**:

- **Fit score** — Does this person match your ICP? (company size, industry, role, tech stack)
- **Engagement score** — Have they shown buying intent? (pricing page, demo request, multiple visits)

Neither alone is sufficient. A perfect-fit company that never engages isn't an MQL. A student downloading every ebook isn't an MQL.

### MQL-to-SQL Handoff SLA

Define response times and document them:
- MQL alert sent to assigned rep
- Rep contacts within **4 hours** (business hours)
- Rep qualifies or rejects within **48 hours**
- Rejected MQLs go to recycling nurture with reason code

**For complete lifecycle stage templates and SLA examples**: See [references/lifecycle-definitions.md](references/lifecycle-definitions.md)

---

## Lead Scoring

### Scoring Dimensions

**Explicit scoring (fit)** — Who they are:
- Company size, industry, revenue
- Job title, seniority, department
- Tech stack, geography

**Implicit scoring (engagement)** — What they do:
- Page visits (especially pricing, demo, case studies)
- Content downloads, webinar attendance
- Email engagement (opens, clicks)
- Product usage (for PLG)

**Negative scoring** — Disqualifying signals:
- Competitor email domains
- Student/personal email
- Unsubscribes, spam complaints
- Job title mismatches (intern, student)

### Building a Scoring Model

1. Define your ICP attributes and weight them
2. Identify high-intent behavioral signals from closed-won data
3. Set point values for each attribute and behavior
4. Set MQL threshold (typically 50-80 points on a 100-point scale)
5. Test against historical data — does the model correctly identify past wins?
6. Launch, measure, and recalibrate quarterly

### Common Scoring Mistakes

- Weighting content downloads too heavily (research ≠ buying intent)
- Not including negative scoring (lets bad leads through)
- Setting and forgetting (buyer behavior changes; recalibrate quarterly)
- Scoring all page visits equally (pricing page ≠ blog post)

**For detailed scoring templates and example models**: See [references/scoring-models.md](references/scoring-models.md)

---

## Lead Routing

### Routing Methods

| Method | How It Works | Best For |
|--------|-------------|----------|
| **Round-robin** | Distribute evenly across reps | Equal territories, similar deal sizes |
| **Territory-based** | Assign by geography, vertical, or segment | Regional teams, industry specialists |
| **Account-based** | Named accounts go to named reps | ABM motions, strategic accounts |
| **Skill-based** | Route by deal complexity, product line, or language | Diverse product lines, global teams |

### Routing Rules Essentials

- Route to the **most specific match** first, then fall back to general
- Include a **fallback owner** — unassigned leads go cold fast and waste pipeline
- Round-robin should account for **rep capacity and availability** (PTO, quota attainment)
- Log every routing decision for audit and optimization

### Speed-to-Lead

Response time is the single biggest factor in lead conversion:
- Contact within **5 minutes** = 21x more likely to qualify (Lead Connect)
- After **30 minutes**, conversion drops by 10x
- After **24 hours**, the lead is effectively cold

Build routing rules that prioritize speed. Alert reps immediately. Escalate if SLA is missed.

**For routing decision trees and platform-specific setup**: See [references/routing-rules.md](references/routing-rules.md)

---

## Pipeline Stage Management

### Pipeline Stages

| Stage | Required Fields | Exit Criteria |
|-------|----------------|---------------|
| **Qualified** | Contact info, company, source, fit score | Discovery call scheduled |
| **Discovery** | Pain points, current solution, timeline | Needs confirmed, demo scheduled |
| **Demo/Evaluation** | Technical requirements, decision makers | Positive evaluation, proposal requested |
| **Proposal** | Pricing, terms, stakeholder map | Proposal delivered and reviewed |
| **Negotiation** | Redlines, approval chain, close date | Terms agreed, contract sent |
| **Closed Won** | Signed contract, payment terms | Handoff to CS complete |
| **Closed Lost** | Loss reason, competitor (if any) | Post-mortem logged |

### Stage Hygiene

- **Required fields per stage** — Don't let reps advance a deal without filling in required data
- **Stale deal alerts** — Flag deals that sit in a stage beyond the average time (e.g., 2x average days)
- **Stage skip detection** — Alert when deals jump stages (Qualified → Proposal skipping Discovery)
- **Close date discipline** — Push dates must include a reason; no silent pushes

### Pipeline Metrics

| Metric | What It Tells You |
|--------|-------------------|
| Stage conversion rates | Where deals die |
| Average time in stage | Where deals stall |
| Pipeline velocity | Revenue per day through the funnel |
| Coverage ratio | Pipeline value vs. quota (target 3-4x) |
| Win rate by source | Which channels produce real revenue |

---

## CRM Automation Workflows

### Essential Automations

- **Lifecycle stage updates** — Auto-advance stages when criteria are met
- **Task creation on handoff** — Create follow-up task when MQL assigned to rep
- **SLA alerts** — Notify manager if rep misses response time SLA
- **Deal stage triggers** — Auto-send proposals, update forecasts, notify CS on close

### Marketing-to-Sales Automations

- **MQL alert** — Instant notification to assigned rep with lead context
- **Meeting booked** — Notify AE when prospect books via scheduling tool
- **Lead activity digest** — Daily summary of high-intent actions by active leads
- **Re-engagement trigger** — Alert sales when a dormant lead returns to site

### Calendar Scheduling Integration

- **Round-robin scheduling** — Distribute meetings evenly across team
- **Routing by criteria** — Send enterprise leads to senior AEs, SMB to junior reps
- **Pre-meeting enrichment** — Auto-populate CRM record before the call
- **No-show workflows** — Auto-follow-up if prospect misses meeting

**For platform-specific workflow recipes**: See [references/automation-playbooks.md](references/automation-playbooks.md)

---

## Deal Desk Processes

### When You Need a Deal Desk

- ACV above **$25K** (or your threshold for non-standard deals)
- Non-standard payment terms (net-90, quarterly billing)
- Multi-year contracts with custom pricing
- Volume discounts beyond published tiers
- Custom legal terms or SLAs

### Approval Workflow Tiers

| Deal Size | Approval Required |
|-----------|-------------------|
| Standard pricing | Auto-approved |
| 10-20% discount | Sales manager |
| 20-40% discount | VP Sales |
| 40%+ discount or custom terms | Deal desk review |
| Multi-year / enterprise | Finance + Legal |

### Non-Standard Terms Handling

Document every exception. Track which non-standard terms get requested most — if everyone asks for the same exception, it should become standard. Review quarterly.

---

## Data Hygiene & Enrichment

### Dedup Strategy

- **Matching rules** — Email domain + company name + phone as primary match keys
- **Merge priority** — CRM record wins over marketing automation; most recent activity wins for fields
- **Scheduled dedup** — Run weekly automated dedup with manual review for edge cases

### Required Fields Enforcement

- Enforce required fields at each lifecycle stage
- Block stage advancement if fields are empty
- Use progressive profiling — don't require everything upfront

### Enrichment Tools

| Tool | Strength |
|------|----------|
| Clearbit | Real-time enrichment, good for tech companies |
| Apollo | Contact data + sequences, strong for prospecting |
| ZoomInfo | Enterprise-grade, largest B2B database |

### Quarterly Audit Checklist

- Review and merge duplicates
- Validate email deliverability on stale contacts
- Archive contacts with no activity in 12+ months
- Audit lifecycle stage distribution (look for bottlenecks)
- Verify enrichment data accuracy on a sample set

---

## RevOps Metrics Dashboard

### Key Metrics

| Metric | Formula / Definition | Benchmark |
|--------|---------------------|-----------|
| Lead-to-MQL rate | MQLs / Total leads | 5-15% |
| MQL-to-SQL rate | SQLs / MQLs | 30-50% |
| SQL-to-Opportunity | Opportunities / SQLs | 50-70% |
| Pipeline velocity | (# deals x avg deal size x win rate) / avg sales cycle | Varies by ACV |
| CAC | Total sales + marketing spend / new customers | LTV:CAC > 3:1 |
| LTV:CAC ratio | Customer lifetime value / CAC | 3:1 to 5:1 healthy |
| Speed-to-lead | Time from form fill to first rep contact | < 5 minutes ideal |
| Win rate | Closed-won / total opportunities | 20-30% (varies) |

### Dashboard Structure

Build three views:
1. **Marketing view** — Lead volume, MQL rate, source attribution, cost per MQL
2. **Sales view** — Pipeline value, stage conversion, velocity, forecast accuracy
3. **Executive view** — CAC, LTV:CAC, revenue vs. target, pipeline coverage

---

## Output Format

When delivering RevOps recommendations, provide:

1. **Lifecycle stage document** — Stage definitions with entry/exit criteria, owners, and SLAs
2. **Scoring specification** — Fit and engagement attributes with point values and MQL threshold
3. **Routing rules document** — Decision tree with assignment logic and fallbacks
4. **Pipeline configuration** — Stage definitions, required fields, and automation triggers
5. **Metrics dashboard spec** — Key metrics, data sources, and target benchmarks

Format each as a standalone document the user can implement directly. Include platform-specific guidance when the CRM is known.

---

## Task-Specific Questions

1. What CRM platform are you using (or planning to use)?
2. How many leads per month do you generate?
3. What's your current MQL definition?
4. Where do leads get stuck in your funnel?
5. Do you have SLAs between marketing and sales today?

---

## Tool Integrations

For implementation, see the [tools registry](../../tools/REGISTRY.md). Key RevOps tools:

| Tool | What It Does | Guide |
|------|-------------|-------|
| **HubSpot** | CRM, marketing automation, lead scoring, workflows | [hubspot.md](../../tools/integrations/hubspot.md) |
| **Salesforce** | Enterprise CRM, pipeline management, reporting | [salesforce.md](../../tools/integrations/salesforce.md) |
| **Calendly** | Meeting scheduling, round-robin routing | [calendly.md](../../tools/integrations/calendly.md) |
| **SavvyCal** | Scheduling with priority-based availability | [savvycal.md](../../tools/integrations/savvycal.md) |
| **Clearbit** | Real-time lead enrichment and scoring | [clearbit.md](../../tools/integrations/clearbit.md) |
| **Apollo** | Contact data, enrichment, and outbound sequences | [apollo.md](../../tools/integrations/apollo.md) |
| **ActiveCampaign** | Marketing automation for SMBs, lead scoring | [activecampaign.md](../../tools/integrations/activecampaign.md) |
| **Zapier** | Cross-tool automation and workflow glue | [zapier.md](../../tools/integrations/zapier.md) |
| **Introw** | Partner-sourced pipeline, commissions, deal registration, QBRs | [introw.md](../../tools/integrations/introw.md) |
| **Crossbeam** | Partner account overlaps and co-sell identification | [crossbeam.md](../../tools/integrations/crossbeam.md) |

---

## Related Skills

- **cold-email**: For outbound prospecting emails
- **emails**: For lifecycle and nurture email flows
- **pricing**: For pricing decisions and packaging
- **analytics**: For tracking pipeline metrics and attribution
- **launch**: For go-to-market launch planning
- **sales-enablement**: For sales collateral, decks, and objection handling

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/automation-playbooks.md

# Automation Playbooks

Platform-specific workflow recipes for HubSpot, Salesforce, scheduling tools, and cross-tool automation.

## HubSpot Workflow Recipes

### 1. MQL Alert and Assignment

**Name:** MQL Notification and Task Creation
**Trigger:** Contact property "Lifecycle Stage" is changed to "Marketing Qualified Lead"
**Actions:**
1. Rotate contact owner among sales team (round-robin)
2. Send internal email notification to contact owner with lead context
3. Create task: "Follow up with [Contact Name]" — due in 4 hours
4. Send Slack notification to #sales-alerts channel
5. Enroll in "MQL Follow-Up" sequence (if using HubSpot Sequences)
**Outcome:** Every MQL gets assigned instantly with a clear SLA
**Notes:** Set enrollment criteria to exclude leads already owned by a rep

---

### 2. MQL SLA Escalation

**Name:** MQL SLA Breach Alert
**Trigger:** Contact property "Lifecycle Stage" equals "MQL" AND "Days since last contacted" is greater than 0.5 (12 hours)
**Actions:**
1. Send internal email to contact owner: "SLA warning: [Contact Name] has not been contacted"
2. If still no activity after 24 hours → send alert to sales manager
3. If still no activity after 48 hours → reassign contact owner via rotation
4. Create task for new owner: "Urgent: Contact [Contact Name] — reassigned due to SLA breach"
**Outcome:** No MQL goes unworked for more than 48 hours
**Notes:** Exclude contacts where last activity type is "Call" or "Meeting" (already engaged)

---

### 3. Lead Scoring Update and MQL Promotion

**Name:** Auto-MQL on Score Threshold
**Trigger:** Contact property "HubSpot Score" is greater than or equal to 65
**Actions:**
1. Set lifecycle stage to "Marketing Qualified Lead"
2. Set "MQL Date" to current date
3. Suppress from marketing nurture workflows
4. Trigger MQL Alert workflow (recipe #1)
**Outcome:** Leads automatically promote to MQL when they hit the scoring threshold
**Notes:** Add suppression list for existing customers and competitors

---

### 4. Meeting Booked Notification

**Name:** Meeting Booked Alert to AE
**Trigger:** Meeting activity is logged for contact (via Calendly/HubSpot meetings)
**Actions:**
1. Send internal email to contact owner with meeting details
2. Update contact property "Last Meeting Booked" to current date
3. If lifecycle stage is "Lead" → update to "MQL"
4. Create task: "Prepare for meeting with [Contact Name]" — due 1 hour before meeting
5. Send Slack notification to #meetings channel
**Outcome:** AEs are prepared for every meeting with full context
**Notes:** Include recent page views and content downloads in notification email

---

### 5. Closed-Won Handoff to CS

**Name:** Customer Onboarding Trigger
**Trigger:** Deal stage is changed to "Closed Won"
**Actions:**
1. Update associated contact lifecycle stage to "Customer"
2. Set "Customer Since" date to current date
3. Assign contact owner to CS team member (based on segment/territory)
4. Create task for CS: "Schedule kickoff call with [Company Name]" — due in 2 business days
5. Enroll contact in "Customer Onboarding" email sequence
6. Send internal notification to CS manager
7. Remove from all sales sequences
**Outcome:** Seamless handoff from sales to customer success
**Notes:** Include deal notes, contract value, and key stakeholders in CS notification

---

### 6. Stale Deal Alert

**Name:** Pipeline Hygiene — Stale Deal Detection
**Trigger:** Deal property "Days in current stage" is greater than [2x average for that stage]
**Actions:**
1. Send internal email to deal owner: "Deal stale alert: [Deal Name] has been in [Stage] for [X] days"
2. Create task: "Update or close [Deal Name]" — due in 3 business days
3. If no update after 7 days → alert sales manager
4. Add to "Stale Deals" dashboard list
**Outcome:** Pipeline stays clean and forecast stays accurate
**Notes:** Customize thresholds per stage (Discovery: 14 days, Proposal: 10 days, Negotiation: 21 days)

---

### 7. Recycled Lead Nurture Re-Entry

**Name:** MQL Recycling to Nurture
**Trigger:** Contact property "Sales Rejection Reason" is known (any value)
**Actions:**
1. Update lifecycle stage to "Recycled"
2. Reset engagement score to baseline (keep fit score)
3. Enroll in "Recycled Lead Nurture" sequence (lower frequency)
4. Set "Recycle Date" to current date
5. Set re-enrollment trigger: if HubSpot Score exceeds threshold again, re-trigger MQL workflow
**Outcome:** Rejected leads get a second chance without clogging the pipeline
**Notes:** Track recycled-to-MQL conversion rate as a separate metric

---

### 8. Lead Activity Digest

**Name:** Daily Lead Activity Summary
**Trigger:** Scheduled — daily at 8:00 AM local time
**Actions:**
1. Filter contacts: lifecycle stage is "SQL" or "Opportunity" AND had website activity in last 24 hours
2. Send digest email to each contact owner with their leads' activity
3. Include: pages visited, content downloaded, emails opened/clicked
**Outcome:** Sales reps start each day knowing which leads are active
**Notes:** Only include leads with meaningful activity (exclude single homepage visits)

---

## Salesforce Flow Equivalents

### 1. MQL Alert and Assignment (Salesforce Flow)

**Type:** Record-Triggered Flow
**Object:** Lead
**Trigger:** Lead field "Status" is changed to "MQL"
**Flow steps:**
1. Get Records: Query "Rep Assignment" custom object for next available rep
2. Update Records: Set Lead Owner to assigned rep
3. Create Records: Create Task — "Contact MQL: {Lead.Name}" with due date = NOW + 4 hours
4. Action: Send email alert to new lead owner
5. Update Records: Update "Rep Assignment" last-assigned timestamp
**Notes:** Use a custom "Rep Assignment" object to manage round-robin state

### 2. SLA Escalation (Salesforce Flow)

**Type:** Scheduled-Triggered Flow
**Schedule:** Every 4 hours during business hours
**Flow steps:**
1. Get Records: Leads where Status = "MQL" AND LastActivityDate < TODAY - 1
2. Decision: Is lead older than 48 hours with no activity?
   - YES → Reassign to next rep, create urgent task, alert manager
   - NO → Send reminder email to current owner
**Notes:** Pair with Process Builder for real-time alerts on initial assignment

### 3. Pipeline Stage Automation (Salesforce Flow)

**Type:** Record-Triggered Flow
**Object:** Opportunity
**Trigger:** Stage field is updated
**Flow steps:**
1. Decision: Which stage was it changed to?
2. For each stage:
   - **Discovery:** Create task "Complete discovery questionnaire"
   - **Demo:** Create task "Prepare demo environment"
   - **Proposal:** Create task "Send proposal" + alert deal desk if ACV > $25K
   - **Closed Won:** Trigger CS handoff (create Case, assign CS owner, send welcome email)
   - **Closed Lost:** Create task "Log loss reason" + add to win/loss analysis report

### 4. Stale Deal Detection (Salesforce Flow)

**Type:** Scheduled-Triggered Flow
**Schedule:** Daily at 7:00 AM
**Flow steps:**
1. Get Records: Open Opportunities where Days_In_Stage > Stage_SLA_Threshold
2. Loop through results:
   - Create Task: "Update stale deal: {Opportunity.Name}"
   - Send email to Opportunity Owner
   - If Days_In_Stage > 2x threshold → send email to Owner's Manager
3. Update custom field "Stale Flag" = true for dashboard visibility

---

## Calendly / SavvyCal Integration Patterns

### Round-Robin Meeting Scheduling

**Calendly setup:**
1. Create a team event type with all eligible reps
2. Distribution: "Optimize for equal distribution"
3. Availability: Each rep manages their own calendar
4. Buffer: 15 min before and after meetings
5. Minimum notice: 4 hours (avoid last-minute bookings)

**CRM integration:**
1. Calendly webhook fires on booking
2. Match invitee email to CRM contact
3. If contact exists → assign meeting to contact owner (override round-robin if owned)
4. If new contact → create lead, assign via routing rules, log meeting
5. Set lifecycle stage to MQL (meeting = high intent)

### SavvyCal Setup

**Advantages over Calendly:**
- Priority-based scheduling (prefer certain time slots)
- Overlay calendars (show team availability in one view)
- Personalized booking links per rep

**Integration pattern:**
1. Create team scheduling link with priority rules
2. Webhook on booking → Zapier/Make → CRM
3. Match or create contact, assign owner, create task
4. Send confirmation with meeting prep materials

### Meeting Routing by Criteria

```
Booking form submitted
├─ Company size > 500? (form field)
│  ├─ YES → Route to enterprise AE calendar
│  └─ NO ↓
├─ Existing customer? (CRM lookup)
│  ├─ YES → Route to account owner's calendar
│  └─ NO ↓
└─ Round-robin across SDR team
```

### No-Show Workflow

**Trigger:** Meeting time passes + no meeting notes logged within 30 minutes
**Actions:**
1. Wait 30 minutes after scheduled meeting time
2. Check: Was a call or meeting logged?
   - YES → No action
   - NO → Send "Sorry we missed you" email to prospect
3. Create task: "Reschedule with [Contact Name]" — due next business day
4. If second no-show → flag contact and alert manager

---

## Zapier Cross-Tool Patterns

### 1. New Lead → CRM + Slack + Task

**Trigger:** New form submission (Typeform, HubSpot, Webflow)
**Actions:**
1. Create/update contact in CRM
2. Enrich with Clearbit (if available)
3. Post to Slack #new-leads with enriched data
4. Create task in project management tool (Asana, Linear)

### 2. Meeting Booked → CRM + Prep Email

**Trigger:** New Calendly/SavvyCal booking
**Actions:**
1. Find or create CRM contact
2. Update lifecycle stage to MQL
3. Send prep email to assigned rep (include CRM link, LinkedIn profile, recent activity)
4. Create pre-meeting task

### 3. Deal Closed → Onboarding Stack

**Trigger:** CRM deal stage changed to "Closed Won"
**Actions:**
1. Create customer record in CS tool (Vitally, Gainsight, ChurnZero)
2. Add to onboarding project template
3. Send welcome email via email tool
4. Create Slack channel: #customer-[company-name]
5. Notify CS team in Slack

### 4. Lead Scoring → Cross-Tool Sync

**Trigger:** CRM lead score crosses MQL threshold
**Actions:**
1. Update marketing automation platform status
2. Add to retargeting audience (Facebook, Google Ads)
3. Trigger SDR outreach sequence
4. Log event in analytics (Mixpanel, Amplitude)

### 5. SLA Breach → Multi-Channel Alert

**Trigger:** CRM task overdue (MQL follow-up task)
**Actions:**
1. Send Slack DM to rep
2. Send email to rep
3. If 2+ hours overdue → Slack DM to manager
4. If 4+ hours overdue → reassign in CRM (via webhook back to CRM)

### 6. Weekly Pipeline Digest

**Trigger:** Schedule — every Monday at 8:00 AM
**Actions:**
1. Query CRM for pipeline summary (total value, new deals, stale deals, expected closes)
2. Format as summary
3. Post to Slack #sales-team
4. Send email digest to sales leadership

### references/lifecycle-definitions.md

# Lifecycle Stage Definitions

Complete templates for lead lifecycle stages, MQL criteria by business type, SLAs, and rejection/recycling workflows.

## Stage Templates

### Subscriber

**Entry criteria:**
- Opted in to blog, newsletter, or content updates
- No company information required

**Exit criteria:**
- Provides company information via form or enrichment
- Visits 3+ pages in a session
- Downloads gated content

**Owner:** Marketing (automated)

**Actions on entry:**
- Add to newsletter nurture
- Begin tracking engagement score

---

### Lead

**Entry criteria:**
- Identified contact with name + email + company
- May come from form fill, enrichment, or import

**Exit criteria:**
- Reaches MQL threshold (fit + engagement)
- Manually qualified by marketing/SDR

**Owner:** Marketing

**Actions on entry:**
- Enrich contact data (company size, industry, role)
- Begin scoring
- Add to relevant nurture sequence

---

### MQL (Marketing Qualified Lead)

**Entry criteria:**
- Meets fit score threshold AND engagement score threshold
- OR triggers high-intent action (demo request, pricing page + form fill)

**Exit criteria:**
- Sales accepts (becomes SQL)
- Sales rejects (recycled to nurture with reason code)
- No response within SLA (escalated to manager)

**Owner:** Marketing → Sales (handoff)

**Actions on entry:**
- Instant alert to assigned sales rep
- Create follow-up task with 4-hour SLA
- Pause marketing nurture sequences
- Log all recent activity for sales context

---

### SQL (Sales Qualified Lead)

**Entry criteria:**
- Sales rep has had qualifying conversation
- Confirmed: budget, authority, need, or timeline (at least 2 of 4)

**Exit criteria:**
- Opportunity created with projected value
- Disqualified (recycled with reason code)

**Owner:** Sales (SDR or AE)

**Actions on entry:**
- Update lifecycle stage in CRM
- Notify AE if SDR-qualified
- Begin sales sequence if not already in conversation

---

### Opportunity

**Entry criteria:**
- Formal opportunity created in CRM
- Deal value, close date, and stage assigned

**Exit criteria:**
- Closed-won or closed-lost

**Owner:** Sales (AE)

**Actions on entry:**
- Add to pipeline reporting
- Create deal tasks (proposal, demo, etc.)
- Notify CS if deal is likely to close

---

### Customer

**Entry criteria:**
- Closed-won deal
- Contract signed and payment terms set

**Exit criteria:**
- Churns, expands, or renews

**Owner:** Customer Success / Account Management

**Actions on entry:**
- Trigger onboarding sequence
- Assign CS manager
- Schedule kickoff call
- Remove from all sales sequences

---

### Evangelist

**Entry criteria:**
- NPS score 9-10, or active referral behavior
- Agreed to case study, testimonial, or referral program

**Exit criteria:**
- Ongoing program participation

**Owner:** Customer Success + Marketing

**Actions on entry:**
- Add to advocacy program
- Request case study or testimonial
- Invite to referral program
- Feature in marketing campaigns (with permission)

---

## MQL Criteria Templates by Business Type

### PLG (Product-Led Growth)

**Fit score (40% weight):**

| Attribute | Points |
|-----------|--------|
| Company size 10-500 | +15 |
| Company size 500-5000 | +20 |
| Target industry | +10 |
| Decision-maker role | +15 |
| Uses complementary tool | +10 |

**Engagement score (60% weight) — weight product usage heavily:**

| Signal | Points |
|--------|--------|
| Created free account | +15 |
| Completed onboarding | +20 |
| Used core feature 3+ times | +25 |
| Invited team member | +20 |
| Hit usage limit | +15 |
| Visited pricing page | +10 |

**MQL threshold:** 65 points

---

### Sales-Led (Enterprise)

**Fit score (60% weight) — weight fit heavily:**

| Attribute | Points |
|-----------|--------|
| Company size 500+ | +20 |
| Target industry | +15 |
| VP+ title | +20 |
| Budget authority confirmed | +15 |
| Uses competitor product | +10 |

**Engagement score (40% weight):**

| Signal | Points |
|--------|--------|
| Requested demo | +25 |
| Attended webinar | +10 |
| Downloaded whitepaper | +10 |
| Visited pricing page 2+ times | +15 |
| Engaged with sales email | +10 |

**MQL threshold:** 70 points

---

### Mid-Market (Balanced)

**Fit score (50% weight):**

| Attribute | Points |
|-----------|--------|
| Company size 50-1000 | +15 |
| Target industry | +10 |
| Manager+ title | +15 |
| Target geography | +10 |

**Engagement score (50% weight):**

| Signal | Points |
|--------|--------|
| Demo request | +25 |
| Free trial signup | +20 |
| Pricing page visit | +10 |
| Content download (2+) | +10 |
| Email click (3+) | +10 |
| Webinar attendance | +10 |

**MQL threshold:** 60 points

---

## SLA Templates

### MQL-to-SQL SLA

| Metric | Target | Escalation |
|--------|--------|------------|
| First contact attempt | Within 4 business hours | Alert to sales manager at 4 hours |
| Qualification decision | Within 48 hours | Auto-escalate at 48 hours |
| Meeting scheduled (if qualified) | Within 5 business days | Weekly pipeline review flag |

### SQL-to-Opportunity SLA

| Metric | Target | Escalation |
|--------|--------|------------|
| Discovery call completed | Within 3 business days of SQL | Alert to AE manager |
| Opportunity created | Within 5 business days of SQL | Pipeline review flag |

### Opportunity-to-Close SLA

| Metric | Target | Escalation |
|--------|--------|------------|
| Proposal delivered | Within 5 business days of demo | AE manager alert |
| Deal stale in stage | 2x average days for that stage | Pipeline review flag |
| Close date pushed 2+ times | Immediate | Forecast review required |

---

## Lead Rejection and Recycling

### Rejection Reason Codes

| Code | Reason | Recycle Action |
|------|--------|----------------|
| **FIT-01** | Company too small | Nurture; re-score if company grows |
| **FIT-02** | Wrong industry | Archive; do not recycle |
| **FIT-03** | Wrong role / no authority | Nurture; monitor for org changes |
| **ENG-01** | No response after 3 attempts | Recycle to nurture in 90 days |
| **ENG-02** | Interested but bad timing | Recycle to nurture; re-engage in 60 days |
| **QUAL-01** | No budget | Recycle to nurture in 90 days |
| **QUAL-02** | Using competitor, locked in | Recycle; trigger before contract renewal |
| **QUAL-03** | Not a real project | Archive; do not recycle |

### Recycling Workflow

1. Sales rejects MQL with reason code
2. CRM updates lifecycle stage to "Recycled"
3. Lead enters recycling nurture sequence (different from original nurture)
4. Engagement score resets to baseline (keep fit score)
5. If lead re-engages and crosses MQL threshold, re-route to sales with "Recycled MQL" flag
6. Track recycled MQL conversion rate separately

### Recycling Nurture Sequence

- **Frequency:** Bi-weekly or monthly (lower frequency than initial nurture)
- **Content:** Industry insights, case studies, product updates
- **Duration:** 6 months, then archive if no engagement
- **Re-MQL trigger:** High-intent action (demo request, pricing page revisit)

### references/routing-rules.md

# Lead Routing Rules

Decision trees, platform-specific configurations, territory routing, ABM routing, and speed-to-lead benchmarks.

## Routing Decision Tree

Use this template to map your routing logic:

```
New Lead Arrives
│
├─ Is this a named/target account?
│  ├─ YES → Route to assigned account owner
│  └─ NO ↓
│
├─ Is ACV likely > $50K? (based on company size + industry)
│  ├─ YES → Route to enterprise AE team
│  └─ NO ↓
│
├─ Is this a PLG signup with team usage?
│  ├─ YES → Route to PLG sales specialist
│  └─ NO ↓
│
├─ Does lead match a territory?
│  ├─ YES → Route to territory owner
│  └─ NO ↓
│
└─ Default: Round-robin across available reps
   └─ If no rep available: Assign to team queue with 1-hour SLA
```

Customize this tree for your business. The key principle: **route to the most specific match first, fall back to general.**

---

## Round-Robin Configuration

### Basic Round-Robin Rules

1. Distribute leads evenly across eligible reps
2. Skip reps who are on PTO, at capacity, or have a full pipeline
3. Weight by quota attainment (reps below quota get slight priority)
4. Reset distribution count weekly or monthly
5. Log every assignment for auditing

### HubSpot Round-Robin Setup

**Using HubSpot's rotation tool:**
- Navigate to Automation → Workflows
- Trigger: Contact property "Lifecycle Stage" equals "MQL"
- Action: Rotate contact owner among selected users
- Options: Even distribution, skip unavailable owners
- Add delay + task creation after assignment

**Custom rotation with workflows:**
1. Create a custom property "Rotation Counter" (number)
2. Workflow trigger: New MQL created
3. Branch by rotation counter value (0, 1, 2... for each rep)
4. Set contact owner to corresponding rep
5. Increment counter (reset at max)
6. Create follow-up task with SLA deadline

### Salesforce Round-Robin Setup

**Using Lead Assignment Rules:**
1. Setup → Feature Settings → Marketing → Lead Assignment Rules
2. Create rule entries in priority order (most specific first)
3. For round-robin: Use assignment rule + custom logic

**Using Flow for advanced routing:**
1. Create a Record-Triggered Flow on Lead creation
2. Get Records: Query a custom "Rep Queue" object for next available rep
3. Decision element: Check rep availability, capacity, territory
4. Update Records: Assign lead owner
5. Create Task: Follow-up task with SLA
6. Update "Rep Queue" to track last assignment

---

## Territory Routing

### By Geography

| Territory | Regions | Assigned Team |
|-----------|---------|---------------|
| West | CA, WA, OR, NV, AZ, UT, CO, HI | Team West |
| Central | TX, IL, MN, MO, OH, MI, WI, IN | Team Central |
| East | NY, MA, PA, NJ, CT, VA, FL, GA | Team East |
| International | All non-US | International team |

### By Company Size

| Segment | Company Size | Team |
|---------|-------------|------|
| SMB | 1-50 employees | Inside sales |
| Mid-market | 51-500 employees | Mid-market AEs |
| Enterprise | 501-5000 employees | Enterprise AEs |
| Strategic | 5000+ employees | Strategic account team |

### By Industry

| Vertical | Industries | Specialist |
|----------|-----------|------------|
| Tech | SaaS, IT services, hardware | Tech vertical rep |
| Financial | Banking, insurance, fintech | Financial vertical rep |
| Healthcare | Hospitals, pharma, healthtech | Healthcare vertical rep |
| General | All others | General pool (round-robin) |

### Hybrid Territory Model

Combine multiple dimensions for precision:

```
Lead arrives
├─ Company size > 1000?
│  ├─ YES → Enterprise team
│  │  └─ Sub-route by geography
│  └─ NO ↓
├─ Industry = Healthcare or Financial?
│  ├─ YES → Vertical specialist
│  └─ NO ↓
└─ Round-robin across general pool
   └─ Weighted by geography preference
```

---

## Named Account / ABM Routing

### Setup

1. **Define target account list** (typically 50-500 accounts)
2. **Assign account owners** in CRM (1 rep per account)
3. **Match logic:** Any lead from a target account domain routes to account owner
4. **Matching rules:**
   - Email domain match (primary)
   - Company name fuzzy match (secondary, requires manual review)
   - IP-to-company resolution (tertiary, for anonymous visitors)

### ABM Routing Rules

| Tier | Account Type | Routing | Response SLA |
|------|-------------|---------|--------------|
| Tier 1 | Top 20 strategic accounts | Named owner, instant alert | 1 hour |
| Tier 2 | Top 100 target accounts | Named owner, standard alert | 4 hours |
| Tier 3 | Target industry / size match | Territory or round-robin | Same business day |

### Multi-Contact Handling

When multiple contacts from the same account engage:
- Route all contacts to the **same account owner**
- Notify the owner of new contacts entering
- Track account-level engagement score (sum of all contacts)
- Trigger "buying committee" alert when 3+ contacts from one account engage

---

## Speed-to-Lead Data

### Response Time Impact on Conversion

| Response Time | Relative Qualification Rate | Notes |
|---------------|---------------------------|-------|
| Under 5 minutes | **21x** more likely to qualify | Gold standard |
| 5-10 minutes | 10x more likely | Still strong |
| 10-30 minutes | 4x more likely | Acceptable for most |
| 30 min - 1 hour | 2x more likely | Below best practice |
| 1-24 hours | Baseline | Industry average |
| 24+ hours | 60% lower than baseline | Lead is effectively cold |

Source: Lead Connect, InsideSales.com

### Implementing Speed-to-Lead

1. **Instant notification** — Push notification + email to rep on MQL creation
2. **Auto-task with timer** — Create task with 5-minute SLA countdown
3. **Escalation chain:**
   - 5 min: Original rep alerted
   - 15 min: Backup rep alerted
   - 30 min: Manager alerted
   - 1 hour: Lead reassigned to next available rep
4. **Measure and report** — Track actual response times weekly; recognize fast responders

### Speed-to-Lead Automation

**Trigger:** New MQL created
**Actions:**
1. Assign to rep via routing rules (instant)
2. Send push notification + email to rep
3. Create task: "Contact [Lead Name] — 5 min SLA"
4. Start SLA timer
5. If no activity logged in 15 min → alert backup rep
6. If no activity in 30 min → alert manager
7. If no activity in 60 min → reassign via round-robin

### Measuring Speed-to-Lead

Track these metrics weekly:
- **Average time to first contact** (from MQL creation to first call/email)
- **Median time to first contact** (less skewed by outliers)
- **% of leads contacted within SLA** (target: 90%+)
- **Contact rate by time of day** (identify coverage gaps)
- **Conversion rate by response time** (prove the ROI of speed)

### references/scoring-models.md

# Lead Scoring Models

Detailed scoring templates, example models by business type, and calibration guidance.

## Explicit Scoring Template (Fit)

### Company Attributes

| Attribute | Criteria | Points |
|-----------|----------|--------|
| **Company size** | 1-10 employees | +5 |
| | 11-50 employees | +10 |
| | 51-200 employees | +15 |
| | 201-1000 employees | +20 |
| | 1000+ employees | +15 (unless enterprise-focused, then +25) |
| **Industry** | Primary target industry | +20 |
| | Secondary target industry | +10 |
| | Non-target industry | 0 |
| **Revenue** | Under $1M | +5 |
| | $1M-$10M | +10 |
| | $10M-$100M | +15 |
| | $100M+ | +20 |
| **Geography** | Primary market | +10 |
| | Secondary market | +5 |
| | Non-target market | 0 |

### Contact Attributes

| Attribute | Criteria | Points |
|-----------|----------|--------|
| **Job title** | C-suite (CEO, CTO, CMO) | +25 |
| | VP level | +20 |
| | Director level | +15 |
| | Manager level | +10 |
| | Individual contributor | +5 |
| **Department** | Primary buying department | +15 |
| | Adjacent department | +5 |
| | Unrelated department | 0 |
| **Seniority** | Decision maker | +20 |
| | Influencer | +10 |
| | End user | +5 |

### Technology Attributes

| Attribute | Criteria | Points |
|-----------|----------|--------|
| **Tech stack** | Uses complementary tool | +15 |
| | Uses competitor | +10 (they understand the category) |
| | Uses tool you replace | +20 |
| **Tech maturity** | Modern stack (cloud, SaaS-forward) | +10 |
| | Legacy stack | +5 |

---

## Implicit Scoring Template (Engagement)

### High-Intent Signals

| Signal | Points | Decay |
|--------|--------|-------|
| **Demo request** | +30 | None |
| **Pricing page visit** | +20 | -5 per week |
| **Free trial signup** | +25 | None |
| **Contact sales form** | +30 | None |
| **Case study page (2+)** | +15 | -5 per 2 weeks |
| **Comparison page visit** | +15 | -5 per week |
| **ROI calculator used** | +20 | -5 per 2 weeks |

### Medium-Intent Signals

| Signal | Points | Decay |
|--------|--------|-------|
| **Webinar registration** | +10 | -5 per month |
| **Webinar attendance** | +15 | -5 per month |
| **Whitepaper download** | +10 | -5 per month |
| **Blog visit (3+ in a week)** | +10 | -5 per 2 weeks |
| **Email click** | +5 per click | -2 per month |
| **Email open (3+)** | +5 | -2 per month |
| **Social media engagement** | +5 | -2 per month |

### Low-Intent Signals

| Signal | Points | Decay |
|--------|--------|-------|
| **Single blog visit** | +2 | -2 per month |
| **Newsletter open** | +2 | -1 per month |
| **Single email open** | +1 | -1 per month |
| **Visited homepage only** | +1 | -1 per week |

### Product Usage Signals (PLG)

| Signal | Points | Decay |
|--------|--------|-------|
| **Created account** | +15 | None |
| **Completed onboarding** | +20 | None |
| **Used core feature (3+ times)** | +25 | -5 per month inactive |
| **Invited team member** | +25 | None |
| **Hit usage limit** | +20 | -10 per month |
| **Exported data** | +10 | -5 per month |
| **Connected integration** | +15 | None |
| **Daily active for 5+ days** | +20 | -10 per 2 weeks inactive |

---

## Negative Scoring Signals

| Signal | Points | Notes |
|--------|--------|-------|
| **Competitor email domain** | -50 | Auto-flag for review |
| **Student email (.edu)** | -30 | May still be valid in some cases |
| **Personal email (gmail, yahoo)** | -10 | Less relevant for B2B; adjust for SMB |
| **Unsubscribe from emails** | -20 | Reduce engagement score |
| **Bounce (hard)** | -50 | Remove from scoring |
| **Spam complaint** | -100 | Remove from all sequences |
| **Job title: Student/Intern** | -25 | Low buying authority |
| **Job title: Consultant** | -10 | May be evaluating for client |
| **No website visit in 90 days** | -15 | Score decay |
| **Invalid phone number** | -10 | Data quality signal |
| **Careers page visitor only** | -30 | Likely a job seeker |

---

## Example Scoring Models

### Model 1: PLG SaaS (ACV $500-$5K)

**Weight: 30% fit / 70% engagement (heavily favor product usage)**

**Fit criteria:**
- Company size 10-500: +15
- Target industry: +10
- Manager+ role: +10
- Uses complementary tool: +10

**Engagement criteria:**
- Created free account: +15
- Completed onboarding: +20
- Used core feature 3+ times: +25
- Invited team member: +25
- Hit usage limit: +20
- Pricing page visit: +15

**Negative:**
- Personal email: -10
- No login in 14 days: -15
- Competitor domain: -50

**MQL threshold: 60 points**
**Recalibration: Monthly** (fast feedback loop with high volume)

---

### Model 2: Enterprise Sales-Led (ACV $50K+)

**Weight: 60% fit / 40% engagement (fit is critical at this ACV)**

**Fit criteria:**
- Company size 500+: +20
- Revenue $50M+: +15
- Target industry: +15
- VP+ title: +20
- Decision maker confirmed: +15
- Uses competitor: +10

**Engagement criteria:**
- Demo request: +30
- Multiple stakeholders engaged: +20
- Attended executive webinar: +15
- Downloaded ROI guide: +10
- Visited pricing page 2+: +15

**Negative:**
- Company too small (<100): -30
- Individual contributor only: -15
- Competitor domain: -50

**MQL threshold: 75 points**
**Recalibration: Quarterly** (longer sales cycles, smaller sample size)

---

### Model 3: Mid-Market Hybrid (ACV $5K-$25K)

**Weight: 50% fit / 50% engagement (balanced approach)**

**Fit criteria:**
- Company size 50-1000: +15
- Target industry: +10
- Manager-VP title: +15
- Target geography: +10
- Uses complementary tool: +10

**Engagement criteria:**
- Demo request or trial signup: +25
- Pricing page visit: +15
- Case study download: +10
- Webinar attendance: +10
- Email engagement (3+ clicks): +10
- Blog visits (5+ pages): +10

**Negative:**
- Personal email: -10
- No engagement in 30 days: -10
- Competitor domain: -50
- Student/intern title: -25

**MQL threshold: 65 points**
**Recalibration: Quarterly**

---

## Threshold Calibration

### Setting the Initial Threshold

1. **Pull closed-won data** from the last 6-12 months
2. **Retroactively score** each deal using your new model
3. **Find the natural breakpoint** — what score separated wins from losses?
4. **Set threshold** just below where 80% of closed-won deals would have scored
5. **Validate** against closed-lost — if many closed-lost score above threshold, tighten criteria

### Calibration Cadence

| Business Type | Recalibration Frequency | Why |
|---------------|------------------------|-----|
| PLG / High volume | Monthly | Fast feedback loop, lots of data |
| Mid-market | Quarterly | Moderate cycle length |
| Enterprise | Quarterly to semi-annually | Long cycles, small sample size |

### Calibration Steps

1. **Pull MQL-to-closed data** for the calibration period
2. **Compare scored MQLs vs. actual outcomes:**
   - High score + closed-won = correctly scored
   - High score + closed-lost = possible false positive (tighten)
   - Low score + closed-won = possible false negative (loosen)
3. **Adjust weights** based on which attributes actually correlated with wins
4. **Adjust threshold** if MQL volume is too high (raise) or too low (lower)
5. **Document changes** and communicate to sales team

### Warning Signs Your Model Needs Recalibration

- MQL-to-SQL acceptance rate drops below 30%
- Sales consistently rejects MQLs as "not ready"
- High-scoring leads don't convert; low-scoring leads do
- MQL volume spikes without corresponding revenue
- New product/market changes since last calibration

