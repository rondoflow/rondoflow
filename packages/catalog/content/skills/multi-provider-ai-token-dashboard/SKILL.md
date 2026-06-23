---
name: multi-provider-ai-token-dashboard
description: "Know exactly where your AI tokens go. Multi-provider tracking, budget alerts, and a REST API—all in one dashboard."
category: "Finance & Crypto"
author: community
version: "2.1.1"
icon: coins
---

# Token Panel Ultimate

**One dashboard for every token you spend.** Anthropic, Gemini, OpenAI, Manus—tracked, stored, and queryable before the bill arrives.

## Why This Exists

You've checked your Anthropic console, squinted at the OpenAI dashboard, opened a Gemini tab, and still weren't sure where last Tuesday's $14 went. Token Panel Ultimate puts all four providers in one place so the answer is always one query away.

## What It Does

- **Multi-Provider Tracking** — Anthropic, Gemini, OpenAI, and Manus in a single SQLite database
- **Budget Alerts** — Set monthly limits per provider. Get warned before you overspend, not after
- **REST API** — Query usage programmatically on port 8765. Plug it into your own scripts or dashboards
- **Transcript Parsing** — Automatically extracts token counts from OpenClaw session transcripts
- **Zero Dependencies** — SQLite storage. No Postgres, no Redis, no cloud account required
- **Runs as a Daemon** — Systemd service keeps it alive in the background

## Quick Start

```bash
pip install -r requirements.txt
python3 api.py
```

## Architecture

```
OpenClaw Plugin → Budget Collector API → SQLite DB
                        ↓
                Transcripts / Anthropic API / Manus Tracker
```

## API Endpoints

| Method | Path              | Description                  |
|--------|-------------------|------------------------------|
| GET    | /usage            | All provider usage           |
| GET    | /usage/:provider  | Usage for a single provider  |
| GET    | /budget           | Current budget limits        |
| POST   | /budget           | Set or update budget limits  |

*Clone it. Fork it. Break it. Make it yours.*

👉 Explore the full project: [github.com/globalcaos/clawdbot-moltbot-openclaw](https://github.com/globalcaos/clawdbot-moltbot-openclaw)
