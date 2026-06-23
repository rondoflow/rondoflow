---
name: lookup-country-info-cli
description: "CLI for AI agents to lookup country info for their humans. Uses REST Countries API. No auth required."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# Countries Lookup

CLI for AI agents to lookup country info for their humans. "What's the capital of Mongolia?" — now your agent can answer.

Uses REST Countries API (v3.1). No account or API key needed.

## Usage

```
"Tell me about Japan"
"What countries are in South America?"
"Which country has Tokyo as capital?"
"Info on country code DE"
```

## Commands

| Action | Command |
|--------|---------|
| Search by name | `countries search "query"` |
| Get details | `countries info <code>` |
| List by region | `countries region <region>` |
| Search by capital | `countries capital "city"` |
| List all | `countries all` |

### Examples

```bash
countries search "united states"   # Find country by name
countries info US                  # Get full details by alpha-2 code
countries info USA                 # Also works with alpha-3
countries region europe            # All European countries
countries capital tokyo            # Find country by capital
countries all                      # List all countries (sorted)
```

### Regions

Valid regions: `africa`, `americas`, `asia`, `europe`, `oceania`

## Output

**Search/list output:**
```
[US] United States — Washington D.C., Americas, Pop: 331M, 🇺🇸
```

**Info output:**
```
🌍 Japan
   Official: Japan
   Code: JP / JPN / 392
   Capital: Tokyo
   Region: Asia — Eastern Asia
   Population: 125.8M
   Area: 377930 km²
   Languages: Japanese
   Currencies: Japanese yen (JPY)
   Timezones: UTC+09:00
   Borders: None (island/isolated)
   Driving: left side
   Flag: 🇯🇵

🗺️ Map: https://goo.gl/maps/...
```

## Notes

- Uses REST Countries API v3.1 (restcountries.com)
- No authentication or rate limits
- Country codes: alpha-2 (US), alpha-3 (USA), or numeric (840)
- Population formatted with K/M/B suffixes
- All regions lowercase

---

## Agent Implementation Notes

**Script location:** `{skill_folder}/countries` (wrapper to `scripts/countries`)

**When user asks about countries:**
1. Run `./countries search "name"` to find country code
2. Run `./countries info <code>` for full details
3. Run `./countries region <region>` for regional lists
4. Run `./countries capital "city"` to find by capital

**Common patterns:**
- "What country is X in?" → search by name
- "Tell me about X" → search, then info with code
- "Countries in Europe" → region europe
- "Capital of X" → info with code, check capital field
- "What country has capital X?" → capital search

**Don't use for:** Historical countries, disputed territories, non-sovereign regions.
