---
name: setup-honcho-integration
description: "Install the @honcho-ai/openclaw-honcho plugin and run initial setup. Runs `openclaw plugins install`, `openclaw honcho setup` (which prompts for your API key and migrates any legacy memory files to Honcho), and restarts the gateway. **UPLOADS WORKSPACE CONTENT TO EXTERNAL API**…"
category: "Content & Writing"
author: community
version: "1.0.4"
icon: pencil
---

# Honcho Setup

Install the `@honcho-ai/openclaw-honcho` plugin. The plugin includes `openclaw honcho setup`, which handles API key configuration and migration of any legacy memory files to Honcho.

> ⚠️ **DATA UPLOAD WARNING**: `openclaw honcho setup` (run in Step 2) will offer to upload your workspace memory files (USER.md, MEMORY.md, IDENTITY.md, memory/, canvas/, SOUL.md, AGENTS.md, BOOTSTRAP.md, TOOLS.md) to an external API. `HEARTBEAT.md` is excluded. By default, data is sent to `api.honcho.dev`. For self-hosted instances, data is sent to your configured `HONCHO_BASE_URL`. The setup command will show exactly which files will be uploaded and ask for explicit confirmation before proceeding.

> **No local files are deleted, moved, or modified.** Originals remain exactly in place.

## Step 1: Install the Plugin

Install the Honcho plugin using the OpenClaw plugin system. **Use this exact command — do not install `@honcho-ai/sdk` directly or use `npm install` in the workspace.**

```bash
openclaw plugins install @honcho-ai/openclaw-honcho
```

Then enable it:

```bash
openclaw plugins enable openclaw-honcho
```

Verify the plugin loaded without errors. If the gateway logs show `Cannot find module '@honcho-ai/sdk'`, install dependencies manually:

```bash
cd ~/.openclaw/extensions/openclaw-honcho && npm install
```

This is a known issue with the OpenClaw plugin installer not running dependency resolution for plugin packages.

## Step 2: Run Setup

Run the setup command that ships with the plugin:

```bash
openclaw honcho setup
```

This command will:
1. Prompt interactively for your Honcho API key
2. Write configuration to `~/.openclaw/openclaw.json`
3. Scan for legacy memory files and offer to migrate them to Honcho

Follow the prompts. Migration is optional — if you have no legacy files or want to skip, you can skip the upload step.

For managed Honcho, you need an API key from https://app.honcho.dev. For self-hosted instances, set `HONCHO_BASE_URL` to your instance URL and the API key is optional.

## Step 3: Restart the Gateway

```bash
openclaw gateway restart
```

## Step 4: Confirm

Verify the plugin is active by checking gateway logs or running:

```bash
openclaw honcho status
```

Honcho memory is now active.

> **Ongoing behavior after setup**: Once enabled, the plugin will persistently observe conversations in this workspace and send conversation data to `api.honcho.dev` (or your configured `HONCHO_BASE_URL`) to build and retrieve memory. This is ongoing network activity that continues across sessions. Memory is made available via `honcho_recall`, `honcho_search`, `honcho_profile`, and related tools. To stop this behavior, disable the plugin with `openclaw plugins disable openclaw-honcho`.

---

## Security & Privacy Disclosure

This skill has been designed with transparency and safety as priorities. Below is a complete disclosure of what this skill does:

### What This Skill Does
This skill runs three commands: `openclaw plugins install`, `openclaw honcho setup`, and `openclaw gateway restart`. The data upload and file access described below is performed by `openclaw honcho setup`, not by this skill directly.

### Data Upload
- **uploaded_content**: USER.md, MEMORY.md, IDENTITY.md, all files under memory/, all files under canvas/, SOUL.md, AGENTS.md, BOOTSTRAP.md, TOOLS.md — uploaded by `openclaw honcho setup` during migration
- **not_uploaded**: HEARTBEAT.md — excluded by design, never read or uploaded
- **Where it goes**: By default to `api.honcho.dev` (managed Honcho cloud service). For self-hosted instances, to your configured `HONCHO_BASE_URL`
- **User control**: `openclaw honcho setup` always requires explicit interactive confirmation before any upload, even when `HONCHO_API_KEY` is pre-set in the environment. You will see the exact list of files and the destination URL
- **Purpose**: Migrating file-based memory system to Honcho API for AI agent personalization and memory

### File Modifications
- **Config written**: `openclaw honcho setup` writes API key and config to `~/.openclaw/openclaw.json`
- **Workspace files**: Never modified — originals remain exactly in place
- **HEARTBEAT.md**: Never read or uploaded — excluded by design

### Credentials
- **HONCHO_API_KEY**: Required only for managed Honcho (api.honcho.dev). Not required for self-hosted instances. Stored in `~/.openclaw/openclaw.json` by the setup command.
- **No other credentials**: This skill does not access, read, or transmit any other credentials or secrets

### Network Access
- **Managed mode**: Connects to `api.honcho.dev` (Honcho cloud service)
- **Self-hosted mode**: Connects to your configured `HONCHO_BASE_URL` (e.g., `http://localhost:8000`)

### Ongoing Behavior After Setup
- **Persistent observation**: Once enabled, the plugin observes all conversations in the workspace and transmits conversation data to the configured Honcho endpoint on an ongoing basis
- **Network activity**: Continues across sessions as long as the plugin is enabled — this is not a one-time migration
- **How to stop**: Run `openclaw plugins disable openclaw-honcho` to stop all observation and network activity

### Open Source
- **Honcho SDK**: Open source at https://github.com/plastic-labs/honcho
- **Plugin code**: Available at `~/.openclaw/extensions/openclaw-honcho` after installation
- **This skill**: You are reading the complete skill instructions - there is no hidden behavior
