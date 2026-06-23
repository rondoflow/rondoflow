---
name: copy-editing
description: "When the user wants to edit, review, or improve existing marketing copy, or refresh outdated content. Also use when the user mentions 'edit this copy,' 'review my copy,' 'copy feedback,' 'proofread,' 'polish this,' 'make this better,' 'copy sweep,' 'tighten this up,' 'this reads awkwardly,' 'clean up this text,' 'too wordy,' 'sharpen the messaging,' 'refresh this content,' 'update this page,' 'this content is outdated,' or 'content audit.' Use this when the user already has copy and wants it improved or refreshed rather than rewritten from scratch. For writing new copy, see copywriting."
category: Marketing
author: community
version: "2.0.0"
icon: megaphone
---

# Copy Editing

You are an expert copy editor specializing in marketing and conversion copy. Your goal is to systematically improve existing copy through focused editing passes while preserving the core message.

## Core Philosophy

**Check for product marketing context first:**
If `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md` filename, in older setups), read it before editing. Use brand voice and customer language from that context to guide your edits.

Good copy editing isn't about rewriting—it's about enhancing. Each pass focuses on one dimension, catching issues that get missed when you try to fix everything at once.

**Key principles:**
- Don't change the core message; focus on enhancing it
- Multiple focused passes beat one unfocused review
- Each edit should have a clear reason
- Preserve the author's voice while improving clarity

---

## The Seven Sweeps Framework

Edit copy through seven sequential passes, each focusing on one dimension. After each sweep, loop back to check previous sweeps aren't compromised.

### Sweep 1: Clarity

**Focus:** Can the reader understand what you're saying?

**What to check:**
- Confusing sentence structures
- Unclear pronoun references
- Jargon or insider language
- Ambiguous statements
- Missing context

**Common clarity killers:**
- Sentences trying to say too much
- Abstract language instead of concrete
- Assuming reader knowledge they don't have
- Burying the point in qualifications

**Process:**
1. Read through quickly, highlighting unclear parts
2. Don't correct yet—just note problem areas
3. After marking issues, recommend specific edits
4. Verify edits maintain the original intent

**After this sweep:** Confirm the "Rule of One" (one main idea per section) and "You Rule" (copy speaks to the reader) are intact.

---

### Sweep 2: Voice and Tone

**Focus:** Is the copy consistent in how it sounds?

**What to check:**
- Shifts between formal and casual
- Inconsistent brand personality
- Mood changes that feel jarring
- Word choices that don't match the brand

**Common voice issues:**
- Starting casual, becoming corporate
- Mixing "we" and "the company" references
- Humor in some places, serious in others (unintentionally)
- Technical language appearing randomly

**Process:**
1. Read aloud to hear inconsistencies
2. Mark where tone shifts unexpectedly
3. Recommend edits that smooth transitions
4. Ensure personality remains throughout

**After this sweep:** Return to Clarity Sweep to ensure voice edits didn't introduce confusion.

---

### Sweep 3: So What

**Focus:** Does every claim answer "why should I care?"

**What to check:**
- Features without benefits
- Claims without consequences
- Statements that don't connect to reader's life
- Missing "which means..." bridges

**The So What test:**
For every statement, ask "Okay, so what?" If the copy doesn't answer that question with a deeper benefit, it needs work.

❌ "Our platform uses AI-powered analytics"
*So what?*
✅ "Our AI-powered analytics surface insights you'd miss manually—so you can make better decisions in half the time"

**Common So What failures:**
- Feature lists without benefit connections
- Impressive-sounding claims that don't land
- Technical capabilities without outcomes
- Company achievements that don't help the reader

**Process:**
1. Read each claim and literally ask "so what?"
2. Highlight claims missing the answer
3. Add the benefit bridge or deeper meaning
4. Ensure benefits connect to real reader desires

**After this sweep:** Return to Voice and Tone, then Clarity.

---

### Sweep 4: Prove It

**Focus:** Is every claim supported with evidence?

**What to check:**
- Unsubstantiated claims
- Missing social proof
- Assertions without backup
- "Best" or "leading" without evidence

**Types of proof to look for:**
- Testimonials with names and specifics
- Case study references
- Statistics and data
- Third-party validation
- Guarantees and risk reversals
- Customer logos
- Review scores

**Common proof gaps:**
- "Trusted by thousands" (which thousands?)
- "Industry-leading" (according to whom?)
- "Customers love us" (show them saying it)
- Results claims without specifics

**Process:**
1. Identify every claim that needs proof
2. Check if proof exists nearby
3. Flag unsupported assertions
4. Recommend adding proof or softening claims

**After this sweep:** Return to So What, Voice and Tone, then Clarity.

---

### Sweep 5: Specificity

**Focus:** Is the copy concrete enough to be compelling?

**What to check:**
- Vague language ("improve," "enhance," "optimize")
- Generic statements that could apply to anyone
- Round numbers that feel made up
- Missing details that would make it real

**Specificity upgrades:**

| Vague | Specific |
|-------|----------|
| Save time | Save 4 hours every week |
| Many customers | 2,847 teams |
| Fast results | Results in 14 days |
| Improve your workflow | Cut your reporting time in half |
| Great support | Response within 2 hours |

**Common specificity issues:**
- Adjectives doing the work nouns should do
- Benefits without quantification
- Outcomes without timeframes
- Claims without concrete examples

**Process:**
1. Highlight vague words and phrases
2. Ask "Can this be more specific?"
3. Add numbers, timeframes, or examples
4. Remove content that can't be made specific (it's probably filler)

**After this sweep:** Return to Prove It, So What, Voice and Tone, then Clarity.

---

### Sweep 6: Heightened Emotion

**Focus:** Does the copy make the reader feel something?

**What to check:**
- Flat, informational language
- Missing emotional triggers
- Pain points mentioned but not felt
- Aspirations stated but not evoked

**Emotional dimensions to consider:**
- Pain of the current state
- Frustration with alternatives
- Fear of missing out
- Desire for transformation
- Pride in making smart choices
- Relief from solving the problem

**Techniques for heightening emotion:**
- Paint the "before" state vividly
- Use sensory language
- Tell micro-stories
- Reference shared experiences
- Ask questions that prompt reflection

**Process:**
1. Read for emotional impact—does it move you?
2. Identify flat sections that should resonate
3. Add emotional texture while staying authentic
4. Ensure emotion serves the message (not manipulation)

**After this sweep:** Return to Specificity, Prove It, So What, Voice and Tone, then Clarity.

---

### Sweep 7: Zero Risk

**Focus:** Have we removed every barrier to action?

**What to check:**
- Friction near CTAs
- Unanswered objections
- Missing trust signals
- Unclear next steps
- Hidden costs or surprises

**Risk reducers to look for:**
- Money-back guarantees
- Free trials
- "No credit card required"
- "Cancel anytime"
- Social proof near CTA
- Clear expectations of what happens next
- Privacy assurances

**Common risk issues:**
- CTA asks for commitment without earning trust
- Objections raised but not addressed
- Fine print that creates doubt
- Vague "Contact us" instead of clear next step

**Process:**
1. Focus on sections near CTAs
2. List every reason someone might hesitate
3. Check if the copy addresses each concern
4. Add risk reversals or trust signals as needed

**After this sweep:** Return through all previous sweeps one final time: Heightened Emotion, Specificity, Prove It, So What, Voice and Tone, Clarity.

---

## Expert Panel Scoring

Use this after completing the Seven Sweeps for an additional quality gate. For high-stakes copy (landing pages, launch emails, sales pages), a multi-persona expert review catches issues that a single perspective misses.

### How It Works

1. **Assemble 3-5 expert personas** relevant to the copy type
2. **Each persona scores the copy 1-10** on their area of expertise
3. **Collect specific critiques** — not just scores, but what to fix
4. **Revise based on feedback** — address the lowest-scoring areas first
5. **Re-score after revisions** — iterate until all personas score 7+, with an average of 8+ across the panel

### Recommended Expert Panels

**Landing page copy:**
- Conversion copywriter (clarity, CTA strength, benefit hierarchy)
- UX writer (scannability, cognitive load, user flow)
- Target customer persona (does this speak to me? do I trust it?)
- Brand strategist (voice consistency, positioning accuracy)

**Email sequence:**
- Email marketing specialist (subject lines, open/click optimization)
- Copywriter (hooks, storytelling, persuasion)
- Spam filter analyst (deliverability red flags, trigger words)
- Target customer persona (relevance, value, unsubscribe risk)

**Sales page / long-form:**
- Direct response copywriter (offer structure, objection handling, urgency)
- Skeptical buyer persona (proof gaps, trust issues, red flags)
- Editor (flow, readability, conciseness)
- SEO specialist (keyword coverage, search intent alignment)

### Scoring Rubric

| Score | Meaning |
|-------|---------|
| 9-10 | Publish-ready. No meaningful improvements. |
| 7-8 | Strong. Minor tweaks only. |
| 5-6 | Functional but has clear gaps. Needs another pass. |
| 3-4 | Significant issues. Major revision needed. |
| 1-2 | Fundamentally broken. Rethink approach. |

### When to Use

- **Always** for launch copy, pricing pages, and high-traffic landing pages
- **Recommended** for email sequences, sales pages, and ad copy
- **Optional** for blog posts, social content, and internal docs
- **Skip** for quick updates, minor edits, and low-stakes content

---

## Quick-Pass Editing Checks

Use these for faster reviews when a full seven-sweep process isn't needed.

### Word-Level Checks

**Cut these words:**
- Very, really, extremely, incredibly (weak intensifiers)
- Just, actually, basically (filler)
- In order to (use "to")
- That (often unnecessary)
- Things, stuff (vague)

**Replace these:**

| Weak | Strong |
|------|--------|
| Utilize | Use |
| Implement | Set up |
| Leverage | Use |
| Facilitate | Help |
| Innovative | New |
| Robust | Strong |
| Seamless | Smooth |
| Cutting-edge | New/Modern |

**Watch for:**
- Adverbs (usually unnecessary)
- Passive voice (switch to active)
- Nominalizations (verb → noun: "make a decision" → "decide")

### Sentence-Level Checks

- One idea per sentence
- Vary sentence length (mix short and long)
- Front-load important information
- Max 3 conjunctions per sentence
- No more than 25 words (usually)

### Paragraph-Level Checks

- One topic per paragraph
- Short paragraphs (2-4 sentences for web)
- Strong opening sentences
- Logical flow between paragraphs
- White space for scannability

---

## Copy Editing Checklist

For a final QA pass before delivering edits, work through the full checklist in [references/checklist.md](references/checklist.md) — covering all seven sweeps plus pre-start and final-check items.

---

## Common Copy Problems & Fixes

### Problem: Wall of Features
**Symptom:** List of what the product does without why it matters
**Fix:** Add "which means..." after each feature to bridge to benefits

### Problem: Corporate Speak
**Symptom:** "Leverage synergies to optimize outcomes"
**Fix:** Ask "How would a human say this?" and use those words

### Problem: Weak Opening
**Symptom:** Starting with company history or vague statements
**Fix:** Lead with the reader's problem or desired outcome

### Problem: Buried CTA
**Symptom:** The ask comes after too much buildup, or isn't clear
**Fix:** Make the CTA obvious, early, and repeated

### Problem: No Proof
**Symptom:** "Customers love us" with no evidence
**Fix:** Add specific testimonials, numbers, or case references

### Problem: Generic Claims
**Symptom:** "We help businesses grow"
**Fix:** Specify who, how, and by how much

### Problem: Mixed Audiences
**Symptom:** Copy tries to speak to everyone, resonates with no one
**Fix:** Pick one audience and write directly to them

### Problem: Feature Overload
**Symptom:** Listing every capability, overwhelming the reader
**Fix:** Focus on 3-5 key benefits that matter most to the audience

---

## Working with Copy Sweeps

When editing collaboratively:

1. **Run a sweep and present findings** - Show what you found, why it's an issue
2. **Recommend specific edits** - Don't just identify problems; propose solutions
3. **Request the updated copy** - Let the author make final decisions
4. **Verify previous sweeps** - After each round of edits, re-check earlier sweeps
5. **Repeat until clean** - Continue until a full sweep finds no new issues

This iterative process ensures each edit doesn't create new problems while respecting the author's ownership of the copy.

---

## References

- [Plain English Alternatives](references/plain-english-alternatives.md): Replace complex words with simpler alternatives
- [Content Refresh](references/content-refresh.md): Full checklist, refresh vs. rewrite matrix, and cadence guide
- [Copy Editing Checklist](references/checklist.md): Full QA checklist across all seven sweeps

---

## Content Refresh Editing

Copy editing isn't just for new content. Existing pages decay over time — outdated stats, stale examples, and drifted brand voice. Use the content refresh framework when traffic is declining, data is stale, or the product has changed.

**For the full refresh checklist, refresh vs. rewrite decision matrix, and cadence guide**: See [references/content-refresh.md](references/content-refresh.md)

---

## Task-Specific Questions

1. What's the goal of this copy? (Awareness, conversion, retention)
2. What action should readers take?
3. Are there specific concerns or known issues?
4. What proof/evidence do you have available?
5. Is this new copy or a refresh of existing content?

---

## Related Skills

- **copywriting**: For writing new copy from scratch (use this skill to edit after your first draft is complete)
- **cro**: For broader page optimization beyond copy
- **marketing-psychology**: For understanding why certain edits improve conversion
- **ab-testing**: For testing copy variations

---

## When to Use Each Skill

| Task | Skill to Use |
|------|--------------|
| Writing new page copy from scratch | copywriting |
| Reviewing and improving existing copy | copy-editing (this skill) |
| Editing copy you just wrote | copy-editing (this skill) |
| Structural or strategic page changes | cro |

---

## Bundled Reference Material

> The following documents were bundled with this skill (originally separate files under `references/`) and are included inline here.

### references/checklist.md

# Copy Editing Checklist

Use this checklist alongside the Seven Sweeps Framework (see SKILL.md) as a final QA pass before delivering edited copy.

## Before You Start

- [ ] Understand the goal of this copy
- [ ] Know the target audience
- [ ] Identify the desired action
- [ ] Read through once without editing

## Clarity (Sweep 1)

- [ ] Every sentence is immediately understandable
- [ ] No jargon without explanation
- [ ] Pronouns have clear references
- [ ] No sentences trying to do too much

## Voice & Tone (Sweep 2)

- [ ] Consistent formality level throughout
- [ ] Brand personality maintained
- [ ] No jarring shifts in mood
- [ ] Reads well aloud

## So What (Sweep 3)

- [ ] Every feature connects to a benefit
- [ ] Claims answer "why should I care?"
- [ ] Benefits connect to real desires
- [ ] No impressive-but-empty statements

## Prove It (Sweep 4)

- [ ] Claims are substantiated
- [ ] Social proof is specific and attributed
- [ ] Numbers and stats have sources
- [ ] No unearned superlatives

## Specificity (Sweep 5)

- [ ] Vague words replaced with concrete ones
- [ ] Numbers and timeframes included
- [ ] Generic statements made specific
- [ ] Filler content removed

## Heightened Emotion (Sweep 6)

- [ ] Copy evokes feeling, not just information
- [ ] Pain points feel real
- [ ] Aspirations feel achievable
- [ ] Emotion serves the message authentically

## Zero Risk (Sweep 7)

- [ ] Objections addressed near CTA
- [ ] Trust signals present
- [ ] Next steps are crystal clear
- [ ] Risk reversals stated (guarantee, trial, etc.)

## Final Checks

- [ ] No typos or grammatical errors
- [ ] Consistent formatting
- [ ] Links work (if applicable)
- [ ] Core message preserved through all edits

### references/content-refresh.md

# Content Refresh Editing

Copy editing isn't just for new content. Existing pages and posts decay over time — outdated stats, stale examples, drifted brand voice, and missed SEO opportunities. A content refresh applies the same editing rigor to content that's already published.

## When to Refresh

- **Traffic declining** on a page that used to perform well
- **Stats or data** are more than 12 months old
- **Product has changed** — features, pricing, or positioning no longer match
- **Competitors updated** their version of the same content
- **AI search visibility** matters — outdated content gets cited less (see ai-seo skill)

## Content Refresh Checklist

1. **Freshness pass** — Update all dates, stats, and examples. Replace "in 2024" with current data. Remove references to deprecated features or tools.
2. **Accuracy pass** — Verify all claims are still true. Check that linked resources still exist. Confirm pricing and feature descriptions match current state.
3. **Voice pass** — Does the tone match your current brand voice? Older content often reflects an earlier stage of the company.
4. **SEO pass** — Has search intent shifted for this topic? Are there new keywords or questions to address? Add "Last updated: [date]" prominently.
5. **Proof pass** — Can you add newer testimonials, case studies, or data points that didn't exist when this was first published?
6. **Structure pass** — Add comparison tables, FAQ sections, or other scannable formats that make the content easier to consume.

## Refresh vs. Rewrite

| Signal | Action |
|--------|--------|
| Core message still valid, details outdated | Refresh (update facts, stats, examples) |
| Brand voice has evolved significantly | Refresh + voice rewrite |
| Topic angle or audience has shifted | Full rewrite |
| Page structure doesn't match current search intent | Full rewrite |
| Just needs updated stats and links | Light refresh |

## Refresh Cadence

- **Pricing and product pages**: Every quarter, or when pricing/features change
- **High-traffic blog posts**: Every 6 months
- **Comparison and alternatives pages**: Every 3-6 months (competitors change fast)
- **Evergreen guides**: Annually, unless traffic drops sooner
- **Low-traffic pages**: Only when traffic data suggests an opportunity

### references/plain-english-alternatives.md

# Plain English Alternatives

Replace complex or pompous words with plain English alternatives.

Source: Plain English Campaign A-Z of Alternative Words (2001), Australian Government Style Manual (2024), plainlanguage.gov

---

## Contents
- A
- B
- C
- D
- E
- F
- G-H
- I
- L-M
- N-O
- P
- R
- S
- T-U
- V-Z
- Phrases to Remove Entirely

## A

| Complex | Plain Alternative |
|---------|-------------------|
| (an) absence of | no, none |
| abundance | enough, plenty, many |
| accede to | allow, agree to |
| accelerate | speed up |
| accommodate | meet, hold, house |
| accomplish | do, finish, complete |
| accordingly | so, therefore |
| acknowledge | thank you for, confirm |
| acquire | get, buy, obtain |
| additional | extra, more |
| adjacent | next to |
| advantageous | useful, helpful |
| advise | tell, say, inform |
| aforesaid | this, earlier |
| aggregate | total |
| alleviate | ease, reduce |
| allocate | give, share, assign |
| alternative | other, choice |
| ameliorate | improve |
| anticipate | expect |
| apparent | clear, obvious |
| appreciable | large, noticeable |
| appropriate | proper, right, suitable |
| approximately | about, roughly |
| ascertain | find out |
| assistance | help |
| at the present time | now |
| attempt | try |
| authorise | allow, let |

---

## B

| Complex | Plain Alternative |
|---------|-------------------|
| belated | late |
| beneficial | helpful, useful |
| bestow | give |
| by means of | by |

---

## C

| Complex | Plain Alternative |
|---------|-------------------|
| calculate | work out |
| cease | stop, end |
| circumvent | avoid, get around |
| clarification | explanation |
| commence | start, begin |
| communicate | tell, talk, write |
| competent | able |
| compile | collect, make |
| complete | fill in, finish |
| component | part |
| comprise | include, make up |
| (it is) compulsory | (you) must |
| conceal | hide |
| concerning | about |
| consequently | so |
| considerable | large, great, much |
| constitute | make up, form |
| consult | ask, talk to |
| consumption | use |
| currently | now |

---

## D

| Complex | Plain Alternative |
|---------|-------------------|
| deduct | take off |
| deem | treat as, consider |
| defer | delay, put off |
| deficiency | lack |
| delete | remove, cross out |
| demonstrate | show, prove |
| denote | show, mean |
| designate | name, appoint |
| despatch/dispatch | send |
| determine | decide, find out |
| detrimental | harmful |
| diminish | reduce, lessen |
| discontinue | stop |
| disseminate | spread, distribute |
| documentation | papers, documents |
| due to the fact that | because |
| duration | time, length |
| dwelling | home |

---

## E

| Complex | Plain Alternative |
|---------|-------------------|
| economical | cheap, good value |
| eligible | allowed, qualified |
| elucidate | explain |
| enable | allow |
| encounter | meet |
| endeavour | try |
| enquire | ask |
| ensure | make sure |
| entitlement | right |
| envisage | expect |
| equivalent | equal, the same |
| erroneous | wrong |
| establish | set up, show |
| evaluate | assess, test |
| excessive | too much |
| exclusively | only |
| exempt | free from |
| expedite | speed up |
| expenditure | spending |
| expire | run out |

---

## F

| Complex | Plain Alternative |
|---------|-------------------|
| fabricate | make |
| facilitate | help, make possible |
| finalise | finish, complete |
| following | after |
| for the purpose of | to, for |
| for the reason that | because |
| forthwith | now, at once |
| forward | send |
| frequently | often |
| furnish | give, provide |
| furthermore | also, and |

---

## G-H

| Complex | Plain Alternative |
|---------|-------------------|
| generate | produce, create |
| henceforth | from now on |
| hitherto | until now |

---

## I

| Complex | Plain Alternative |
|---------|-------------------|
| if and when | if, when |
| illustrate | show |
| immediately | at once, now |
| implement | carry out, do |
| imply | suggest |
| in accordance with | under, following |
| in addition to | and, also |
| in conjunction with | with |
| in excess of | more than |
| in lieu of | instead of |
| in order to | to |
| in receipt of | receive |
| in relation to | about |
| in respect of | about, for |
| in the event of | if |
| in the majority of instances | most, usually |
| in the near future | soon |
| in view of the fact that | because |
| inception | start |
| indicate | show, suggest |
| inform | tell |
| initiate | start, begin |
| insert | put in |
| instances | cases |
| irrespective of | despite |
| issue | give, send |

---

## L-M

| Complex | Plain Alternative |
|---------|-------------------|
| (a) large number of | many |
| liaise with | work with, talk to |
| locality | place, area |
| locate | find |
| magnitude | size |
| (it is) mandatory | (you) must |
| manner | way |
| modification | change |
| moreover | also, and |

---

## N-O

| Complex | Plain Alternative |
|---------|-------------------|
| negligible | small |
| nevertheless | but, however |
| notify | tell |
| notwithstanding | despite, even if |
| numerous | many |
| objective | aim, goal |
| (it is) obligatory | (you) must |
| obtain | get |
| occasioned by | caused by |
| on behalf of | for |
| on numerous occasions | often |
| on receipt of | when you get |
| on the grounds that | because |
| operate | work, run |
| optimum | best |
| option | choice |
| otherwise | or |
| outstanding | unpaid |
| owing to | because |

---

## P

| Complex | Plain Alternative |
|---------|-------------------|
| partially | partly |
| participate | take part |
| particulars | details |
| per annum | a year |
| perform | do |
| permit | let, allow |
| personnel | staff, people |
| peruse | read |
| possess | have, own |
| practically | almost |
| predominant | main |
| prescribe | set |
| preserve | keep |
| previous | earlier, before |
| principal | main |
| prior to | before |
| proceed | go ahead |
| procure | get |
| prohibit | ban, stop |
| promptly | quickly |
| provide | give |
| provided that | if |
| provisions | rules, terms |
| proximity | nearness |
| purchase | buy |
| pursuant to | under |

---

## R

| Complex | Plain Alternative |
|---------|-------------------|
| reconsider | think again |
| reduction | cut |
| referred to as | called |
| regarding | about |
| reimburse | repay |
| reiterate | repeat |
| relating to | about |
| remain | stay |
| remainder | rest |
| remuneration | pay |
| render | make, give |
| represent | stand for |
| request | ask |
| require | need |
| residence | home |
| retain | keep |
| revised | changed, new |

---

## S

| Complex | Plain Alternative |
|---------|-------------------|
| scrutinise | examine, check |
| select | choose |
| solely | only |
| specified | given, stated |
| state | say |
| statutory | legal, by law |
| subject to | depending on |
| submit | send, give |
| subsequent to | after |
| subsequently | later |
| substantial | large, much |
| sufficient | enough |
| supplement | add to |
| supplementary | extra |

---

## T-U

| Complex | Plain Alternative |
|---------|-------------------|
| terminate | end, stop |
| thereafter | then |
| thereby | by this |
| thus | so |
| to date | so far |
| transfer | move |
| transmit | send |
| ultimately | in the end |
| undertake | agree, do |
| uniform | same |
| utilise | use |

---

## V-Z

| Complex | Plain Alternative |
|---------|-------------------|
| variation | change |
| virtually | almost |
| visualise | imagine, see |
| ways and means | ways |
| whatsoever | any |
| with a view to | to |
| with effect from | from |
| with reference to | about |
| with regard to | about |
| with respect to | about |
| zone | area |

---

## Phrases to Remove Entirely

These phrases often add nothing. Delete them:

- a total of
- absolutely
- actually
- all things being equal
- as a matter of fact
- at the end of the day
- at this moment in time
- basically
- currently (when "now" or nothing works)
- I am of the opinion that (use: I think)
- in due course (use: soon, or say when)
- in the final analysis
- it should be understood
- last but not least
- obviously
- of course
- quite
- really
- the fact of the matter is
- to all intents and purposes
- very

