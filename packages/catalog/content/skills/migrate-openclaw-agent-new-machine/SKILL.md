---
name: migrate-openclaw-agent-new-machine
description: "Securely migrate OpenClaw Agent (config, memory, skills) to a new machine."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# OpenClaw Migrator

A utility to package an Agent's state into a portable, encrypted archive (`.oca`) for migration.

## Features

- **Encrypted Archive**: Uses AES-256-GCM + auth tag for confidentiality and integrity.
- **Path Normalization**: Restores workspace path using `manifest.json` metadata.
- **Dependency Manifest**: Captures system dependencies (Brewfile) to ensure the new environment matches.

## Usage

### Export (On Old Machine)

```bash
migrator export --out my-agent.oca --password "secret"
```

### Import (On New Machine)

```bash
migrator import --in my-agent.oca --password "secret"
```

## Security

This skill handles sensitive data (`openclaw.json`, `auth.token`). 
The export process **always** requires a password to encrypt the archive.
Unencrypted exports are **disabled** by design.
