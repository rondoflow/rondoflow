---
name: manage-family-todo-lists
description: "Manage family todo lists with multi-user support"
category: "Productivity"
author: community
version: "1.0.0"
icon: check-square
---

# Family Todo Manager

A lightweight, multi-user todo list manager for any family, powered by Node.js and JSON.

## Features
- 📝 **Natural Language Add**: "Add a task: Buy milk tomorrow"
- 👥 **Multi-User**: Supports Admin (You), Partner, and Family shared tasks.
- ⏰ **Cron Integration**: Designed to work with OpenClaw cron for daily briefings.
- 💾 **JSON Storage**: Simple file-based storage (`memory/todo.json`), easy to backup.
- 🆔 **Timestamp IDs**: Tasks have unique, time-ordered IDs.

## Installation

1.  Place `todo.js` in your skill folder (e.g., `skills/family-todo/todo.js`).
2.  Ensure `memory/todo.json` exists (or let the script create it).
3.  **Configuration**: Edit `todo.js` to set your user IDs (see below).

## Configuration

Open `todo.js` and modify the `USERS` constant at the top:

```javascript
const USERS = {
  'Mark': 'YOUR_TELEGRAM_ID_HERE', // e.g., '123456789'
  'Jane': 'PARTNER_TELEGRAM_ID_HERE', // e.g., '987654321'
  'Shared':  'GROUP_ID' // Family shared tasks
};
```

## Usage

### Add Task
- `node todo.js add "Buy milk" "Mark"`
- `node todo.js add "Walk the dog" "Susie"`

### List Tasks
- `node todo.js list` (Shows all active tasks)
- `node todo.js list Mark` (Shows tasks for Mark + Family)

### Complete Task
- `node todo.js done <ID>` or `node todo.js done "Buy milk"`

### Daily Briefing (Cron)
- `node todo.js brief` (Morning reminder)
- `node todo.js review` (Evening review)

## License
MIT
