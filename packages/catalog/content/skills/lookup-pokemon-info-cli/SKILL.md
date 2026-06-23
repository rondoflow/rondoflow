---
name: lookup-pokemon-info-cli
description: "CLI for AI agents to lookup Pokémon info for their humans. Uses PokéAPI. No auth required."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# Pokémon Lookup

CLI for AI agents to lookup Pokémon info for their humans. "What type is Charizard weak to?" — now your agent can answer.

Uses PokéAPI. No account or API key needed.

## Usage

```
"Look up Pikachu"
"What are fire type weaknesses?"
"Tell me about the ability Levitate"
"Search for dragon Pokémon"
```

## Commands

| Action | Command |
|--------|---------|
| Search | `pokemon search "query"` |
| Get details | `pokemon info <name\|id>` |
| Type matchups | `pokemon type <name>` |
| Ability info | `pokemon ability <name>` |

### Examples

```bash
pokemon search pikachu        # Find Pokémon by partial name
pokemon info 25               # Get details by Pokédex number
pokemon info charizard        # Get details by name
pokemon type fire             # Fire type matchups
pokemon ability static        # Ability description
```

## Output

**Search output:**
```
Pikachu
Pikachu-rock-star
Pikachu-belle
```

**Info output:**
```
⚡ Pikachu [#25]
   Types: Electric
   Height: 0.4m | Weight: 6kg
   Base Stats:
     HP: 35 | Atk: 55 | Def: 40
     Sp.Atk: 50 | Sp.Def: 50 | Spd: 90
   Abilities: Static, Lightning rod
   Sprite: https://raw.githubusercontent.com/.../25.png
```

**Compact format:**
```
[#25] Pikachu — Electric, HP: 35, Atk: 55, Def: 40, Spd: 90
```

**Type output:**
```
🔥 Type: Fire

⚔️ Offensive:
   2x damage to: Grass, Ice, Bug, Steel
   ½x damage to: Fire, Water, Rock, Dragon
   0x damage to: None

🛡️ Defensive:
   2x damage from: Water, Ground, Rock
   ½x damage from: Fire, Grass, Ice, Bug, Steel, Fairy
   0x damage from: None
```

**Ability output:**
```
✨ Ability: Static

📖 Effect:
Pokémon with this Ability have a 30% chance of paralyzing
attacking Pokémon on contact.

🎯 Short: Has a 30% chance of paralyzing attacking Pokémon on contact.
```

## Notes

- Uses PokéAPI v2 (pokeapi.co)
- No rate limit (but be reasonable)
- No authentication required
- Names are case-insensitive
- Use hyphens for multi-word names: `pokemon info mr-mime`
- Search returns up to 20 matches

---

## Agent Implementation Notes

**Script location:** `{skill_folder}/pokemon` (wrapper) → `scripts/pokemon`

**When user asks about Pokémon:**
1. Run `./pokemon search "name"` to find exact name
2. Run `./pokemon info <name|id>` for full stats
3. Run `./pokemon type <type>` for matchup questions
4. Run `./pokemon ability <name>` for ability details

**Common patterns:**
- "What is X weak to?" → Get info for types, then lookup type matchups
- "Best counter for X?" → Get types, then check what's super effective
- "Does X have ability Y?" → Get info and check abilities list

**Don't use for:** Non-Pokémon game info, competitive tier lists, or fan content.
