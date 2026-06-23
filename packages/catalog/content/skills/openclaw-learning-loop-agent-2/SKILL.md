---
name: openclaw-learning-loop-agent-2
description: "NousResearch Hermes Agent CLI integration. Core capabilities: - Self-improving skill system - Persistent memory (FTS5 + LLM summaries) - Sub-agent delegation - MCP integration - Browser automation - Code execution"
category: "AI & Agents"
author: community
version: "2.1.0"
icon: bot
---

# Hermes Agent Skill

Call [NousResearch Hermes Agent](https://github.com/NousResearch/hermes-agent) via CLI.

## Prerequisites

Hermes CLI must be installed. See https://github.com/NousResearch/hermes-agent for installation.

## Usage

### Quick Q&A

```bash
hermes run "your question" --non-interactive --no-stream
```

### With Context

```bash
hermes run "question" --context-file ./ctx.md --non-interactive
```

### Sub-agent Delegation

```bash
hermes run "use delegate_task to: research topic" --non-interactive --no-stream
```

### Memory

```bash
hermes memory search "keyword"
hermes memory notes list
hermes memory notes add "note content"
```

### Skills

```bash
hermes skills list
hermes skills create "name" --description "desc"
```

### Status

```bash
hermes status
hermes doctor
```

## Configuration

Edit `~/.hermes/.env` to set your LLM provider key.
Edit `~/.hermes/config.yaml` to set model and provider.

## File Access Scope

This skill only invokes hermes CLI commands. No direct file operations.
Hermes Agent operates within `~/.hermes/` only.
