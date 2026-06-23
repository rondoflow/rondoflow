---
name: lemon-squeezy-store-admin
description: "Admin CLI for Lemon Squeezy stores. View orders, subscriptions, and customers."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

# Lemon Squeezy Admin 🍋

Manage your Lemon Squeezy store from the command line.

## Setup

1. Get an API Key from [Lemon Squeezy Settings > API](https://app.lemonsqueezy.com/settings/api).
2. Set it: `export LEMONSQUEEZY_API_KEY="your_key"`

## Commands

### Orders
```bash
ls-admin orders --limit 10
# Output: #1234 - $49.00 - john@example.com (Paid)
```

### Subscriptions
```bash
ls-admin subscriptions
# Output: Active: 15 | MMR: $450
```

### Stores
```bash
ls-admin stores
```
