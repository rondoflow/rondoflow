---
name: find-recipes-via-themealdb
description: "CLI for AI agents to find recipes for their humans. Uses TheMealDB API. No auth required."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# Recipe Lookup

CLI for AI agents to find recipes for their humans. "What can I make with chicken?" — now your agent can help.

Uses TheMealDB API. No account or API key needed.

## Usage

```
"Search for pasta recipes"
"Give me a random dinner idea"
"What Italian dishes can I make?"
"Tell me about meal ID 52772"
```

## Commands

| Action | Command |
|--------|---------|
| Search | `recipes search "query"` |
| Get details | `recipes info <meal_id>` |
| Random meal | `recipes random` |
| List categories | `recipes categories` |
| By area/cuisine | `recipes area <area>` |

### Examples

```bash
recipes search "chicken"          # Find chicken recipes
recipes info 52772                # Get full recipe by ID
recipes random                    # Surprise me!
recipes categories                # List all categories
recipes area Italian              # Italian dishes
recipes area Mexican              # Mexican dishes
```

## Output

**Search/list output:**
```
[52772] Spaghetti Bolognese — Italian, Beef
```

**Info/random output:**
```
🍽️  Spaghetti Bolognese
   ID: 52772 | Category: Beef | Area: Italian
   Tags: Pasta,Meat

📝 Ingredients:
   • 500g Beef Mince
   • 2 Onions
   • 400g Tomato Puree
   ...

📖 Instructions:
[Full cooking instructions]

🎥 Video: [YouTube URL if available]
📎 Source: [Recipe source if available]
```

## Areas (Cuisines)

American, British, Canadian, Chinese, Croatian, Dutch, Egyptian, Filipino, French, Greek, Indian, Irish, Italian, Jamaican, Japanese, Kenyan, Malaysian, Mexican, Moroccan, Polish, Portuguese, Russian, Spanish, Thai, Tunisian, Turkish, Ukrainian, Vietnamese

## Notes

- Uses TheMealDB free API
- No authentication required
- Meal ID is the database identifier
- Filter commands (area) return IDs only — use `info` for details
- Categories endpoint includes descriptions

---

## Agent Implementation Notes

**Script location:** `{skill_folder}/recipes` (wrapper to `scripts/recipes`)

**When user asks about recipes/cooking:**
1. Run `./recipes search "ingredient or dish"` to find options
2. Run `./recipes info <id>` for full recipe with ingredients and instructions
3. Run `./recipes random` for dinner inspiration
4. Run `./recipes area <cuisine>` to explore by cuisine

**Workflow example:**
```
User: "What can I make for dinner?"
1. recipes random  →  Get a random idea
2. recipes info <id>  →  Full recipe details

User: "I want something Italian"
1. recipes area Italian  →  List Italian dishes
2. recipes info <id>  →  Pick one and get full recipe
```

**Don't use for:** Nutritional info, calorie counts, dietary restrictions (API doesn't provide this).
