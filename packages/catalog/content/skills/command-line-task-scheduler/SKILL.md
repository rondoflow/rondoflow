---
name: command-line-task-scheduler
description: "Scheduler - command-line tool for everyday use Use when you need scheduler."
category: "Productivity"
author: community
version: "2.0.0"
icon: check-square
---

# Scheduler

Task scheduler — cron job management, recurring tasks, calendar integration, reminder setting, deadline tracking, and time blocking.

## Commands

| Command | Description |
|---------|-------------|
| `scheduler run` | Execute main function |
| `scheduler list` | List all items |
| `scheduler add <item>` | Add new item |
| `scheduler status` | Show current status |
| `scheduler export <format>` | Export data |
| `scheduler help` | Show help |

## Usage

```bash
# Show help
scheduler help

# Quick start
scheduler run
```

## Examples

```bash
# Run with defaults
scheduler run

# Check status
scheduler status

# Export results
scheduler export json
```

## How It Works


## Tips

- Run `scheduler help` for all commands
- Data stored in `~/.local/share/scheduler/`


---
*Powered by BytesAgain | bytesagain.com*
*Feedback & Feature Requests: https://bytesagain.com/feedback*
