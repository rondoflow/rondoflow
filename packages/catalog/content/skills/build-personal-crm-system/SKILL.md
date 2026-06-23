---
name: build-personal-crm-system
description: "Guide users building a personal CRM from simple files to structured database."
category: "Data & Analytics"
author: community
version: "1.0.0"
icon: chart-bar
---

## First Interaction
- Ask what they're tracking: clients, leads, investors, job contacts, networking — context shapes schema
- Ask their technical comfort: spreadsheets, JSON, databases — determines starting format
- Create `~/crm/` folder as the single source of truth

## Start With Files, Not Apps
- JSON or CSV for first version — validate data model before adding complexity
- Single file `contacts.json` initially — resist creating multiple files until needed
- Don't suggest web app until they've used files for at least a week
- Don't suggest database until files feel slow or limiting

## Minimal Contact Schema
- id, name, email, company, phone, notes, tags, created, updated — nothing more initially
- tags array over rigid categories — flexible, no schema changes needed
- notes field is often the most valuable — encourage freeform context
- Generate UUID for id, not auto-increment — survives merges and imports

## When To Add Interactions File
- User asks "when did I last talk to X" — signal they need history
- Separate file linked by contact_id — not nested in contact object
- type field (note/email/call/meeting) enables filtering later
- Always include date — timeline view is essential

## When To Add Companies File
- Multiple contacts at same company — signal to separate
- Many-to-many: one person can work at multiple companies over time
- company_id in contacts, not company name duplication

## When To Add Deals/Opportunities
- User mentions "pipeline", "stage", "close date", "deal value"
- Link to contact_id and optionally company_id
- Stages as simple string field initially — don't over-engineer state machine

## SQLite Migration Triggers
- File operations feel slow (>100 contacts typically)
- User wants to query/filter in complex ways
- Multiple users need access (SQLite handles concurrent reads)
- Offer to write migration script — don't force manual re-entry

## Progressive Timeline
- Week 1: contacts file only, prove they'll use it
- Week 2: add interactions when they want history
- Week 3: add tags, search helper script
- Month 2: companies file if needed
- Month 3: deals file if tracking opportunities
- Only then: consider web UI or more complex tooling

## What NOT To Suggest Early
- Web application — massive scope increase, validate data model first
- Email sync/integration — suggest BCC/forward workflow, much simpler
- Calendar integration — manual logging is fine initially
- Authentication — single-user local CRM doesn't need it
- Mobile app — sync complexity not worth it early

## Helper Scripts Worth Offering
- Quick add from command line — reduces friction
- Search across all files — grep/jq one-liner
- Backup to timestamped zip — essential before migrations
- Export to CSV — for users who want spreadsheet view

## Data Integrity Habits
- Backup before any bulk edit or migration
- Check for duplicate emails before adding contact
- Validate email format on entry
- Keep created/updated timestamps — debugging lifesaver

## Sync When Asked
- Cloud folder (Dropbox/iCloud/Drive) for multi-device — simplest
- Git repo for version history — good for technical users
- Don't suggest complex sync solutions until files prove insufficient
