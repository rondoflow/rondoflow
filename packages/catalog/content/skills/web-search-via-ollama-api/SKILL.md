---
name: web-search-via-ollama-api
description: "Web search via Ollama API. Returns relevant results from Ollama web search for AI agents."
category: "AI & Agents"
author: community
version: "1.0.1"
icon: bot
---

# Ollama Web Search

Web search using Ollama's web_search API.

## Search

```bash
node {baseDir}/scripts/search.mjs "query"
node {baseDir}/scripts/search.mjs "query" -n 10
node {baseDir}/scripts/search.mjs "query" --max-results 10
```

## Options

- `-n <count>`: Number of results to request (default: 5)
- `--max-results <count>`: Same as `-n`

## Notes

- Needs `OLLAMA_API_KEY`
- Outputs Ollama API response as JSON
- Uses `POST https://ollama.com/api/web_search`
