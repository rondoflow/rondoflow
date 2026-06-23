---
name: alibaba-bailian-web-search
description: "AI-optimized web search via Bailian(Alibaba ModelStdio) API. Returns multisourced, concise web search results for LLMs."
category: "Web & Scraping"
author: community
version: "1.0.4"
icon: globe
---

# Bailian Web Search

AI-optimized web search using Bailian WebSearch(Enable_search) API. Designed for AI agents - returns clean, relevant content.

## Search

```bash
{baseDir}/scripts/mcp-websearch.sh "query"
{baseDir}/scripts/mcp-websearch.sh  "query"  10
```

## Options

- `<count>`: Number of results (default: 5, max: 20)
- `<query>`: User Query for Websearch
