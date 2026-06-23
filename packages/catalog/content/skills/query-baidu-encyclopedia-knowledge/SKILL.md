---
name: query-baidu-encyclopedia-knowledge
description: "The Baidu Baike Component is a knowledge service tool designed to query authoritative encyclopedia explanations for various nouns. Its core function is given a specific \"noun\" (object, person, location, concept, event, etc.) provided by the user, it returns a standardized, detai…"
category: "Community"
author: community
version: "1.1.0"
icon: puzzle
---

# Baidu Baike

Query encyclopedia entries from Baidu Baike.

## Two Usage Scenarios

### Scenario 1: Direct Search
Get default matching entry for a keyword.
```bash
python3 scripts/baidu_baike.py --search_type=lemmaTitle --search_key="keyword"
```

### Scenario 2: Homonym Resolution
When term has multiple entries, list them and select by ID.
```bash
# List entries with same name
python3 scripts/baidu_baike.py --search_type=lemmaList --search_key="keyword" --top_k=5

# Get specific entry by ID
python3 scripts/baidu_baike.py --search_type=lemmaId --search_key="entry_id"
```

## API
- LemmaList: List entries with same title
- LemmaContent: Get entry details by title or ID

## Setup
```bash
export BAIDU_API_KEY="your_api_key"
```

## Workflow
1. Extract noun from query
2. For ambiguous terms, call LemmaList first
3. User selects entry from list
4. Call LemmaContent with selected ID
5. Return structured data
