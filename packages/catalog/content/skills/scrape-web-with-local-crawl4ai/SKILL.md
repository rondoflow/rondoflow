---
name: scrape-web-with-local-crawl4ai
description: "Web scraping using local Crawl4AI instance. Use for fetching full page content with JavaScript rendering. Better than Tavily for complex pages. Unlimited usage."
category: "Content & Writing"
author: community
version: "1.0.1"
icon: pencil
---

# Crawl4AI Web Scraper

Local Crawl4AI instance for full web page extraction with JavaScript rendering.

## Endpoints

**Proxy (port 11234)** — Clean output, OpenWebUI-compatible
- Returns: `[{page_content, metadata}]`
- Use for: Simple content extraction

**Direct (port 11235)** — Full output with all data
- Returns: `{results: [{markdown, html, links, media, ...}]}`
- Use for: When you need links, media, or other metadata

## Usage

```bash
# Via script
node {baseDir}/scripts/crawl4ai.js "url"
node {baseDir}/scripts/crawl4ai.js "url" --json
```

**Script options:**
- `--json` — Full JSON response

**Output:** Clean markdown from the page.

## Configuration

**Required environment variable:**

- `CRAWL4AI_URL` — Your Crawl4AI instance URL (e.g., `http://localhost:11235`)

**Optional:**

- `CRAWL4AI_KEY` — API key if your instance requires authentication

## Features

- **JavaScript rendering** — Handles dynamic content
- **Unlimited usage** — Local instance, no API limits
- **Full content** — HTML, markdown, links, media, tables
- **Better than Tavily** for complex pages with JS

## API

Uses your local Crawl4AI instance REST API. Auth header only sent if `CRAWL4AI_KEY` is set.
