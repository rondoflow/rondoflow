---
name: search-evaluate-biomedical-literature
description: "Search and evaluate biomedical literature with effective queries, filters, and critical appraisal."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

# PubMed Research Rules

## Query Construction
- Use MeSH terms for precise searching — controlled vocabulary ensures you find related concepts regardless of wording
- Boolean operators must be uppercase: AND, OR, NOT — lowercase is ignored
- Phrase searching with quotes: "heart failure" not heart failure — unquoted searches terms separately
- Field tags narrow searches: [Title], [Author], [MeSH Terms] — example: aspirin[Title] AND prevention[MeSH]
- Truncation with asterisk: therap* finds therapy, therapies, therapeutic

## Essential Filters
- Article type matters: Clinical Trial, Systematic Review, Meta-Analysis — filter by study design
- Publication date for recent evidence — older studies may be superseded
- Free full text filter if access is limited — but don't ignore paywalled high-quality studies
- Humans filter excludes animal studies — relevant for clinical questions
- Language filter if translation isn't feasible

## Study Hierarchy
- Systematic reviews and meta-analyses synthesize multiple studies — start here for established topics
- Randomized controlled trials (RCTs) are gold standard for interventions — but not all questions are answerable by RCT
- Cohort studies for long-term outcomes and rare exposures
- Case-control for rare diseases
- Case reports are lowest evidence — interesting but not generalizable
- Guidelines synthesize evidence into recommendations — check who wrote them and when

## Critical Appraisal
- Sample size matters — small studies may show effects that don't replicate
- Check confidence intervals, not just p-values — narrow CI with meaningful effect size beats p<0.05
- Funding source and conflicts of interest affect interpretation — industry-funded studies favor sponsors
- Primary vs secondary outcomes — cherry-picking significant secondary outcomes is common
- Intention-to-treat vs per-protocol analysis — ITT is more conservative and realistic

## Common Traps
- Abstract conclusions may oversell results — read methods and results sections
- Single studies rarely settle questions — look for replication and systematic reviews
- Statistical significance isn't clinical significance — 1% improvement may not matter to patients
- Retracted papers still appear in searches — check Retraction Watch for controversial papers
- Predatory journals publish low-quality research — verify journal reputation
- Preprints haven't been peer-reviewed — useful for speed but not vetted

## Search Strategy
- PICO framework: Patient/Population, Intervention, Comparison, Outcome — structures clinical questions
- Start broad, then narrow with filters — missing relevant papers worse than sorting through extras
- Save searches for ongoing monitoring — PubMed can email when new papers match
- Related Articles feature finds similar papers — useful after finding one good paper
- Citation tracking: who cited this paper? — follow research forward in time

## Evaluating Sources
- Impact factor indicates journal prestige, not individual paper quality
- First and last authors typically did the work and led the project
- Corresponding author handles questions — contact for clarifications
- Check author affiliations — institutional reputation matters
- Methods section determines if results are trustworthy — results are only as good as methods

## For Specific Questions
- Treatment efficacy: RCTs and systematic reviews first
- Diagnosis accuracy: sensitivity/specificity studies
- Prognosis: cohort studies with long follow-up
- Etiology/harm: cohort or case-control studies
- Prevention: RCTs when available, cohort otherwise

## Practical Tips
- PubMed is free but full text often isn't — check institutional access, Unpaywall, or request from authors
- PMID is the unique identifier — use it for precise citations
- Export to reference manager (EndNote, Zotero) — manual citation is error-prone
- Clinical Queries filter pre-filters for clinical relevance — therapy, diagnosis, prognosis, etiology
- Similar Articles and Cited By expand discovery — algorithm finds related work

## Red Flags in Papers
- No control group for intervention studies
- Conclusions not supported by data presented
- Missing or inadequate statistical analysis
- Selective reporting of outcomes
- Conflicts of interest not disclosed
- Extraordinary claims without extraordinary evidence
