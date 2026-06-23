---
name: personal-contact-management-system
description: "Build a personal contact system with details, interactions, birthdays, and smart reminders."
category: "Productivity"
author: community
version: "1.0.1"
icon: check-square
---

## Core Behavior
- User mentions a person → check if contact exists, offer to create/update
- Calendar event detected with contact → surface relevant notes before meeting
- Birthday approaching → remind with context about the person
- Create `~/contacts/` as workspace

## When User Mentions Someone
- "Had coffee with Maria" → log interaction, create contact if new
- "John's daughter is Sofia" → add to personal details
- "Sarah loves hiking" → add to interests/notes
- "Meeting with Tom tomorrow" → check calendar, surface Tom's context

## Contact Structure
- One Markdown file per person: `maria-garcia.md`
- Sections: basics, personal details, interaction history, notes
- Tags for grouping: #family #work #friend #neighbor
- Keep it human-readable — this is about relationships, not data entry

## Key Fields To Capture
- Name, how you met, where they work/live
- Birthday, anniversary, important dates
- Family members, pets, kids names
- Interests, hobbies, what they care about
- Last interaction and context
- How they prefer to communicate

## Interaction Logging
- Date + brief note: "2024-03-15: Lunch, discussed her new job"
- Don't force structure — freeform is fine
- Recent interactions at top — most relevant for context
- Link to related contacts if group interaction

## Birthday System
- Store birthday in frontmatter or consistent format
- Daily/weekly scan for upcoming birthdays
- Remind 3-7 days ahead — time to prepare
- Include context: interests, gift ideas from notes

## Calendar Integration
- Before meeting: "You're meeting Alex tomorrow. Last saw him in January, discussed his startup pivot"
- After meeting: prompt to log interaction
- Detect recurring meetings — suggest adding contact details if sparse
- Conference/event: remind of attendees you know

## Progressive Enhancement
- Week 1: create contacts as they come up naturally
- Week 2: add birthdays for close contacts
- Month 2: review and enrich sparse contacts
- Ongoing: capture details during conversations

## What To Surface Proactively
- "Tomorrow is David's birthday" + last interaction + interests
- "Meeting with Lisa in 2 hours" + her context + last topics
- "Haven't talked to Mom in 3 weeks" — if user wants relationship nudges
- "Alex mentioned job hunting last time" — relevant context resurfacing

## Details Worth Remembering
- Kids/spouse names and ages
- Recent life events: new job, moved, health issues
- Preferences: vegetarian, doesn't drink, early riser
- Sensitive topics to avoid
- How you can help them / how they can help you

## What NOT To Suggest
- Syncing with phone contacts — different purpose, keep separate
- CRM-style pipeline tracking — this is personal, not sales
- Automated birthday messages — defeats the purpose
- Social media integration — privacy and complexity

## Folder Structure
```
~/contacts/
├── people/
│   ├── maria-garcia.md
│   └── john-smith.md
├── index.md          # quick reference
└── birthdays.md      # upcoming dates view
```

## Search and Retrieval
- "What do I know about Sarah?" → show full contact
- "Who works at Google?" → search by company
- "Friends in Madrid" → search by location + tag
- "Who have I not seen in 6 months?" → interaction date scan

## Privacy Considerations
- This is sensitive data — keep local, encrypt if needed
- Cloud sync optional but consider privacy
- Git history shows evolution — consider if appropriate
- Some notes are for you only — don't share contact file

## Relationship Maintenance Prompts
- Offer to check on contacts not seen in X months
- Flag contacts with outdated info
- Suggest reaching out around their important dates
- "You mentioned wanting to introduce A to B" — track pending intros
