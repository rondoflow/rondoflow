---
name: google-calendar-agenda-and-search
description: "Use `gog` (gogcli) for Google Calendar: agenda (events list) and keyword search across calendars."
category: "Productivity"
author: community
version: "1.0.0"
icon: check-square
---

# gog-calendar

Use `gog` (gogcli) for Google Calendar: agenda (events list) and keyword search across calendars.

## Output rule (tokens vs reliability)

gogcli stdout should stay parseable; prefer `--plain` / `--json` and put hints to stderr.  [oai_citation:0‡GitHub](https://github.com/steipete/gogcli/blob/main/AGENTS.md?utm_source=chatgpt.com)

- Default to **`--plain`** for read-only listing you only summarize (cheaper tokens):
  - agenda listing (today / next days / range)
  - calendars list
- Use **`--json`** only when structure is required:
  - aggregating results across calendars (cross-calendar keyword search)
  - deduping / sorting / extracting IDs for follow-up calls
  - any write workflow where exact fields matter
- In automation runs, add **`--no-input`** (fail instead of prompting).  [oai_citation:1‡GitHub](https://github.com/steipete/gogcli/blob/main/README.md?utm_source=chatgpt.com)

## Calendar exclusions (post-processing)

Users may explicitly exclude certain calendars from searches/agenda (e.g., “National holidays”).  
When answering, you MUST:
1) Query broadly (e.g., `events --all` or iterate all calendars for search),
2) Then **filter out excluded calendars in post-processing**.

How to determine excluded calendars:
- First, check the user’s preferences/memory for an explicit “exclude calendars” list.
- If none is provided, apply a conservative default filter for obvious noise calendars:
  - calendars whose name/summary contains: `holiday`, `holidays`, `national holidays` (and localized equivalents)
- Never filter out user-owned calendars unless explicitly excluded.

Filtering rule:
- If you have calendar metadata (from `gog calendar calendars`), filter by **calendar name/summary**.
- If you only have events output, filter by matching event’s calendarId to the excluded calendarIds resolved from the calendars list.

Always mention filtering briefly if it materially changes the answer:
- “(Filtered out: National holidays)”

## Agenda (always cross-calendar, then filter)

For “what’s on my calendar today / tomorrow / this week / between X and Y”:
- MUST query all calendars:
  - `gog calendar events --all --from <date_or_iso> --to <date_or_iso> --plain`
- Then apply calendar exclusions (above).
- Do not answer “nothing scheduled” unless you ran the command for the correct window and applied filtering.

Examples:
- Today: `gog calendar events --all --from 2026-02-04 --to 2026-02-05 --plain`
- Next 7 days: `gog calendar events --all --from 2026-02-04 --to 2026-02-11 --plain`

Output formatting:
- sort by start time
- group by day
- show: time range, summary, location (calendar name only if it helps)

## Keyword search across calendars (best-effort, aggregate, then filter)

Calendar event queries are scoped to a `calendarId` (API is `/calendars/{calendarId}/events`), so keyword search must iterate calendars and aggregate results.  [oai_citation:2‡Google for Developers](https://developers.google.com/workspace/calendar/api/v3/reference/events/list?utm_source=chatgpt.com)

Default window:
- if user didn’t specify a range: **next 6 months from today** (inclusive)
- if user specified date/range: use it

Workflow (do not skip):
1) List calendars (need IDs + names for filtering):
   - `gog calendar calendars --json`
2) Build the set of excluded calendarIds from the exclusions rule.
3) For EACH non-excluded `calendarId`, search (JSON required for merge/dedupe):
   - `gog calendar search "<query>" --calendar <calendarId> --from <from> --to <to> --max 50 --json --no-input`
4) Aggregate all matches across calendars (do NOT stop on first match unless user asked).
5) Deduplicate by `(calendarId, eventId)`, sort by start time.
6) Report results and explicitly mention the searched window (and any filters applied).

If nothing found in default window:
- say: “No events found in the next 6 months (<from> → <to>). Want me to search further (e.g., 12 months) or within specific dates?”

Fallback if user is sure it exists:
- ask/derive an approximate date and list around it (then filter):
  - `gog calendar events --all --from <date-7d> --to <date+7d> --plain`
- then match by title tokens locally (casefold + token overlap)

## Writes (create/update/delete/RSVP)

Before any write action:
- summarize exact intent (calendar, title, start/end, timezone, attendees, location)
- ask for explicit “yes”
- then run the command
