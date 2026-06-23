---
name: unspecified-workspace-anchor-skill
description: "Multi-agent workspace awareness and safety system. Discovers, lists, switches, and validates projects using environment-based naming to prevent agent drift."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# ⚓ Workspace Anchor

Multi-agent workspace awareness and safety system. Discovers, lists, switches, and validates projects using environment-based naming to prevent agent drift.

## 🤖 Agent Instruction (CRITICAL)
Before using this skill, you MUST identify the correct absolute paths for the user's environment. Use `exec` to find `.project-lock` files if paths are ambiguous.

## 📝 CLI Commands
- `discover`: Find all `.project-lock` files.
- `list`: Show formatted list of anchors.
- `create <path>`: Initialize a new anchor.
- `switch <name>`: Change active context.
- `validate <path>`: Check if path is within current anchor.
