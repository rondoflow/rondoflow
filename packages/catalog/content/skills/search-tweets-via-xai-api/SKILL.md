---
name: search-tweets-via-xai-api
description: "Search X (Twitter) posts using the xAI API. Use when the user wants to find tweets, search X/Twitter, look up what people are saying on X, or find social media posts about a topic."
category: "Communication"
author: community
version: "1.0.0"
icon: message-circle
---

# X Search

Search X (Twitter) posts using the xAI Grok API with real-time access to X content.

## Setup

1. Get your API key: https://console.x.ai
2. Set environment variable:
   ```bash
   export XAI_API_KEY="xai-your-key-here"
   ```
3. Or set `skills."x-search".apiKey` / `skills."x-search".env.XAI_API_KEY` in `~/.openclaw/openclaw.json`

## Usage

```bash
python3 {baseDir}/scripts/search.py "what is trending in AI right now"
```

Useful flags:

```bash
# Filter by handles (max 10)
python3 {baseDir}/scripts/search.py --handles jaaneek,OpenClaw "latest posts"

# Exclude handles (max 10)
python3 {baseDir}/scripts/search.py --exclude spambot,crypto_shill "trending AI"

# Date range (YYYY-MM-DD)
python3 {baseDir}/scripts/search.py --from 2026-03-01 --to 2026-03-20 "xAI grok updates"

# Enable image/video understanding in posts
python3 {baseDir}/scripts/search.py --images --video "product demos"
```

## Notes

- Uses the xAI Responses API with `x_search` tool (Grok performs the search and summarizes results)
- Cannot use `--handles` and `--exclude` at the same time
- Results include citations with links to original X posts
- Present results in a readable format with post content, authors, and citations
