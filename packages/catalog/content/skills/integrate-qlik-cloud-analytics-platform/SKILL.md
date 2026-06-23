---
name: integrate-qlik-cloud-analytics-platform
description: "Complete Qlik Cloud analytics platform integration with 37 tools. Health checks, search, app management, reloads, natural language queries (Insight Advisor), automations, AutoML, Qlik Answers AI, data alerts, spaces, users, licenses, data files, and lineage. Use when user asks a…"
category: "Data & Analytics"
author: community
version: "1.0.0"
icon: chart-bar
---

# Qlik Cloud Skill

Complete OpenClaw integration for Qlik Cloud — 37 tools covering the full platform.

## Setup

Add credentials to TOOLS.md:

```markdown
### Qlik Cloud
- Tenant URL: https://your-tenant.region.qlikcloud.com
- API Key: your-api-key-here
```

Get an API key: Qlik Cloud → Profile icon → Profile settings → API keys → Generate new key

## ⚡ When to Use What

| You Want... | Use This | Example |
|-------------|----------|---------|
| **Actual data values** (KPIs, numbers, trends) | `qlik-insight.sh` | "what is total sales", "which store has lowest stock" |
| **App structure** (field names, tables) | `qlik-app-fields.sh` | Understanding data model |
| **Refresh data** | `qlik-reload.sh` | Trigger reload before querying |
| **Find apps** | `qlik-search.sh` or `qlik-apps.sh` | Locate app by name |

**🚨 Decision Tree:**

```
User asks about data (numbers, KPIs, trends)?
  └─ YES → Use qlik-insight.sh
           └─ Response has 'narrative' or 'data'? 
              └─ YES → Return the results
              └─ NO → Try rephrasing, check drillDownLink
  └─ NO (structure/metadata) → Use qlik-app-fields.sh
```

**Key insight:** `qlik-app-fields.sh` returns **metadata** (structure), NOT actual data. To get real numbers, always use `qlik-insight.sh` (Insight Advisor).

## Quick Reference

All scripts: `QLIK_TENANT="https://..." QLIK_API_KEY="..." bash scripts/<script>.sh [args]`

### Core Operations
| Script | Description | Args |
|--------|-------------|------|
| `qlik-health.sh` | Health check / connectivity test | — |
| `qlik-tenant.sh` | Get tenant & user info | — |
| `qlik-search.sh` | Search all resources (returns `resourceId`) | `"query"` |
| `qlik-license.sh` | License info & usage | — |

### Apps
| Script | Description | Args |
|--------|-------------|------|
| `qlik-apps.sh` | List apps (supports space filtering) | `[--space personal\|spaceId] [--limit n]` |
| `qlik-app-get.sh` | Get app details | `<app-id>` |
| `qlik-app-create.sh` | Create new app | `"name" [space-id] [description]` |
| `qlik-app-delete.sh` | Delete app | `<app-id>` |
| `qlik-app-fields.sh` | Get fields & tables (metadata only, not data values) | `<app-id>` |
| `qlik-app-lineage.sh` | Get app data sources | `<app-id>` |

### Reloads
| Script | Description | Args |
|--------|-------------|------|
| `qlik-reload.sh` | Trigger app reload | `<app-id>` |
| `qlik-reload-status.sh` | Check reload status | `<reload-id>` |
| `qlik-reload-cancel.sh` | Cancel running reload | `<reload-id>` |
| `qlik-reload-history.sh` | App reload history | `<app-id> [limit]` |
| `qlik-reload-failures.sh` | Recent failed reloads | `[days] [limit]` |

### Monitoring
| Script | Description | Args |
|--------|-------------|------|
| `qlik-duplicates.sh` | Find duplicate apps (same name) | `[limit]` |

### Insight Advisor ⭐ (Natural Language Queries)
| Script | Description | Args |
|--------|-------------|------|
| `qlik-insight.sh` | Ask questions in plain language, get **real data values** back | `"question" [app-id]` |

**This is the primary tool for getting actual data!** Ask naturally:
- "what is total sales"
- "which stores have lowest availability"
- "show stock count by region"
- "items predicted out of stock"

**Important:**

1. **Use `resourceId`** (UUID format) from search results — NOT the item `id`

2. **Check response for `narrative` and/or `data`** — If both missing, try rephrasing

3. **For data questions, use insight.sh NOT fields.sh** — `fields.sh` = metadata, `insight.sh` = actual values

### Users & Governance
| Script | Description | Args |
|--------|-------------|------|
| `qlik-users-search.sh` | Search users | `"query" [limit]` |
| `qlik-user-get.sh` | Get user details | `<user-id>` |
| `qlik-spaces.sh` | List all spaces (shared, managed, data) | `[limit]` |

### ⚠️ Personal Space

**Personal space is VIRTUAL in Qlik Cloud** — it does NOT appear in the `/spaces` API!

```bash
# ❌ WRONG: qlik-spaces.sh will NOT show personal space
bash scripts/qlik-spaces.sh

# ✅ CORRECT: Use qlik-apps.sh with --space personal
bash scripts/qlik-apps.sh --space personal
```

Space types in Qlik Cloud:
- **personal** — Virtual, user's private apps (use `--space personal`)
- **shared** — Team collaboration spaces
- **managed** — Governed spaces with publishing workflow
- **data** — Data storage spaces

### Data Files & Lineage
| Script | Description | Args |
|--------|-------------|------|
| `qlik-datafiles.sh` | List uploaded data files | `[space-id] [limit]` |
| `qlik-datafile.sh` | Get data file details | `<file-id>` |
| `qlik-datasets.sh` | List managed datasets* | `[space-id] [limit]` |
| `qlik-dataset-get.sh` | Get managed dataset details* | `<dataset-id>` |
| `qlik-lineage.sh` | Data lineage graph | `<secure-qri> [direction] [levels]` |

*Managed datasets are available in Qlik Cloud.

### Automations
| Script | Description | Args |
|--------|-------------|------|
| `qlik-automations.sh` | List automations | `[limit]` |
| `qlik-automation-get.sh` | Get automation details | `<automation-id>` |
| `qlik-automation-run.sh` | Run automation | `<automation-id>` |
| `qlik-automation-runs.sh` | Automation run history | `<automation-id> [limit]` |

### AutoML
| Script | Description | Args |
|--------|-------------|------|
| `qlik-automl-experiments.sh` | List ML experiments | `[limit]` |
| `qlik-automl-experiment.sh` | Experiment details | `<experiment-id>` |
| `qlik-automl-deployments.sh` | List ML deployments | `[limit]` |

### Qlik Answers (AI Assistant)
| Script | Description | Args |
|--------|-------------|------|
| `qlik-answers-assistants.sh` | List AI assistants | `[limit]` |
| `qlik-answers-ask.sh` | Ask assistant a question | `<assistant-id> "question" [thread-id]` |

### Data Alerts
| Script | Description | Args |
|--------|-------------|------|
| `qlik-alerts.sh` | List data alerts | `[limit]` |
| `qlik-alert-get.sh` | Get alert details | `<alert-id>` |
| `qlik-alert-trigger.sh` | Trigger alert evaluation | `<alert-id>` |

## Example Workflows

### Check Environment
```bash
bash scripts/qlik-health.sh
bash scripts/qlik-tenant.sh
bash scripts/qlik-license.sh
```

### Find and Query an App
```bash
# Search returns resourceId (UUID) — use this for all app operations
bash scripts/qlik-search.sh "Sales"
# Output: { "resourceId": "950a5da4-0e61-466b-a1c5-805b072da128", ... }

# Use the resourceId for app operations
bash scripts/qlik-app-get.sh "950a5da4-0e61-466b-a1c5-805b072da128"
bash scripts/qlik-app-fields.sh "950a5da4-0e61-466b-a1c5-805b072da128"
bash scripts/qlik-insight.sh "What were total sales last month?" "950a5da4-0e61-466b-a1c5-805b072da128"
```

### See App Data Sources
```bash
bash scripts/qlik-app-lineage.sh "950a5da4-0e61-466b-a1c5-805b072da128"
# Returns: QVD files, Excel files, databases, etc.
```

### Reload Management
```bash
bash scripts/qlik-reload.sh "abc-123"
bash scripts/qlik-reload-status.sh "reload-id"
bash scripts/qlik-reload-history.sh "abc-123"
```

### Natural Language Queries (Insight Advisor)
```bash
# Find apps that match your question
bash scripts/qlik-insight.sh "show me sales trend"

# Query specific app with UUID
bash scripts/qlik-insight.sh "revenue by region" "950a5da4-0e61-466b-a1c5-805b072da128"
```

### Qlik Answers (AI)
```bash
# List available AI assistants
bash scripts/qlik-answers-assistants.sh

# Ask a question (creates thread automatically)
bash scripts/qlik-answers-ask.sh "27c885e4-85e3-40d8-b5cc-c3e20428e8a3" "What products do you sell?"
```

## Response Format

All scripts output JSON:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-04T12:00:00Z"
}
```

## Environment Variables

**Required credentials** (add to TOOLS.md or set as environment variables):

- **QLIK_TENANT** — Your tenant URL (e.g., `https://company.eu.qlikcloud.com`)
- **QLIK_API_KEY** — API key from Qlik Cloud profile settings

## Cloud-Only Features

The following features are **Qlik Cloud exclusive** (not available on Qlik Sense Enterprise on Windows):

- ⚙️ **Automations** — Low-code workflow automation
- 🤖 **AutoML** — Machine learning experiments & deployments  
- 💬 **Qlik Answers** — AI-powered Q&A assistants
- 🔔 **Data Alerts** — Threshold-based notifications
- 🔗 **Lineage (QRI)** — Data flow visualization
- 📊 **Managed Datasets** — Centralized data management
