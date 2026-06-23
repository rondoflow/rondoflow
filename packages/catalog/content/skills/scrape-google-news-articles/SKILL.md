---
name: scrape-google-news-articles
description: "Scrape structured news data from Google News automatically. Use when the user asks for news on a topic, industry trends, or PR monitoring. Triggers on keywords like \"find news about\", \"track trends\", or \"monitor PR\"."
category: "Data & Analytics"
author: community
version: "0.1.0"
icon: chart-bar
---

# Google News Automation Scraper Skill

## ✨ Platform Compatibility

**✅ Works Powerfully & Reliably On All Major AI Assistants**

| Platform | Status | How to Install |
|----------|--------|----------------|
| **OpenCode** | ✅ Fully Supported | Copy skill folder to `~/.opencode/skills/` |
| **Claude Code** | ✅ Fully Supported | Native skill support |
| **Cursor** | ✅ Fully Supported | Copy to `~/.cursor/skills/` |
| **OpenClaw** | ✅ Fully Supported | Compatible |

**Why Choose BrowserAct Skills?**
- 🚀 Stable & crash-free execution
- ⚡ Fast response times
- 🔧 No configuration headaches
- 📦 Plug & play installation
- 💬 Professional support

## 📖 Introduction
This skill provides a one-stop news collection service using BrowserAct's Google News API template. It allows the agent to retrieve structured news data with a single command.

## 🔑 API Key Guidance
Before running, check the `BROWSERACT_API_KEY` environment variable. If not set, do not proceed with script execution; instead, request the API key from the user.

**Required Message to User**:
> "Since you haven't configured the BrowserAct API Key, please go to the [BrowserAct Console](https://www.browseract.com/reception/integrations) to get your Key and provide it to me in this chat."

## 🛠️ Input Parameters
Flexibly configure these parameters based on user requirements:

1. **Search_Keywords**
   - **Type**: `string`
   - **Description**: Keywords to search on Google News (e.g., company names, industry terms).
   - **Example**: `AI Startup`, `Tesla`, `SpaceX`

2. **Publish_date**
   - **Type**: `string`
   - **Description**: Time range filter for articles.
   - **Options**: 
     - `any time`: No restriction
     - `past hours`: Breaking news
     - `past 24 hours`: Daily monitoring (Recommended)
     - `past week`: Short-term trends
     - `past year`: Long-term research
   - **Default**: `past week`

3. **Datelimit**
   - **Type**: `number`
   - **Description**: Maximum news items to extract.
   - **Default**: `30`
   - **Suggestion**: Use 10-30 for monitoring, higher for research.

## 🚀 Execution (Recommended)
Execute the following script to get results:

```bash
# Call Example
python .cursor/skills/google-news-api/scripts/google_news_api.py "Keywords" "TimeRange" Count
```

## 📊 Data Output
Successful execution returns structured data:
- `headline`: News title
- `source`: Publisher
- `news_link`: URL
- `published_time`: Timestamp
- `author`: Author name (if available)

## ⚠️ Error Handling & Retry Mechanism
1. **Check Output**:
   - If output contains `"Invalid authorization"`, the API Key is invalid. **Do not retry**. Guide the user to provide a correct key.
   - For other failures (e.g., `Error:` or empty results), **automatically retry once**.

2. **Retry Limit**:
   - Maximum **one** automatic retry. If it still fails, stop and report the error to the user.
