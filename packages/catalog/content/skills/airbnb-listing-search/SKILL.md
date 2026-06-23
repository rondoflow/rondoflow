---
name: airbnb-listing-search
description: "Search Airbnb listings with prices, ratings, and direct links. No user API key required (uses Airbnb's public frontend API key). Use when searching for Airbnb stays, vacation rentals, or accommodation pricing."
category: "Development"
author: community
version: "0.1.4"
icon: code
---

# Airbnb Search

Search Airbnb listings from the command line. Returns prices, ratings, and direct booking links.

## Requirements

- Python 3.8+
- `requests` library (auto-installed via `uv run --with`)

## Quick Start

```bash
# Run directly (no install needed)
uv run --with requests scripts/airbnb-search.py "Steamboat Springs, CO" --checkin 2025-03-01 --checkout 2025-03-03

# JSON output
uv run --with requests scripts/airbnb-search.py "Denver, CO" --checkin 2025-06-01 --checkout 2025-06-05 --json
```

## Options

```
query                Search location (e.g., "Steamboat Springs, CO")
--checkin, -i DATE   Check-in date (YYYY-MM-DD)
--checkout, -o DATE  Check-out date (YYYY-MM-DD)
--min-price N        Minimum price filter
--max-price N        Maximum price filter
--min-bedrooms N     Minimum bedrooms filter
--limit N            Max results (default: 50)
--json               Output as JSON
--format FORMAT      table or json (default: table)
```

## Example Output

```
📍 Steamboat Springs, CO
📊 Found 300+ total listings

==========================================================================================
Cozy Mountain Cabin 🏆
  2BR/1BA | ⭐4.92 | 127 reviews
  💰 $407 total
  🔗 https://airbnb.com/rooms/12345678
```

## Notes

- Dates are required for accurate pricing
- Prices include cleaning fees in the total
- No user API key needed — uses Airbnb's public frontend API key (hardcoded, same key used by airbnb.com in the browser)
- May break if Airbnb changes their internal GraphQL API
- Be respectful of rate limits

## Links

- [PyPI](https://pypi.org/project/airbnb-search/)
- [GitHub](https://github.com/Olafs-World/airbnb-search)
