---
name: record-share-coding-sessions
description: "Record, export, and share your AI coding sessions as replayable buildlogs"
category: "Integrations"
author: community
version: "1.0.0"
icon: plug
---

# Buildlog Skill

Record your OpenClaw coding sessions and share them on buildlog.ai.

## Overview

The buildlog skill captures your AI-assisted coding sessions in real-time, creating replayable recordings that can be shared with others. Perfect for:

- **Tutorials**: Share how you built something step-by-step
- **Documentation**: Create living documentation of complex implementations
- **Debugging**: Review sessions to understand what went wrong
- **Learning**: Study how others approach problems

## Commands

### Recording

- **"Start a buildlog [title]"** — Begin recording a new session
- **"Stop the buildlog"** — End recording and optionally upload
- **"Pause the buildlog"** — Temporarily pause recording
- **"Resume the buildlog"** — Continue a paused recording

### Exporting

- **"Export this session as a buildlog"** — Convert current session to buildlog format
- **"Export the last [N] messages"** — Export a portion of the session

### Uploading

- **"Upload the buildlog"** — Push to buildlog.ai
- **"Share the buildlog"** — Upload and get a shareable link

### Annotations

- **"Add a note: [text]"** — Add commentary to the current point
- **"Mark this as important"** — Flag the current exchange
- **"Add chapter: [title]"** — Create a chapter marker

### Status

- **"Buildlog status"** — Check recording state
- **"Show buildlog info"** — Display current recording details

## Configuration

Add to your OpenClaw configuration:

```json
{
  "skills": {
    "buildlog": {
      "apiKey": "your-api-key",
      "autoUpload": false,
      "defaultPublic": true,
      "includeFileContents": true,
      "maxFileSizeKb": 100
    }
  }
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | — | Your buildlog.ai API key (optional for public uploads) |
| `autoUpload` | boolean | `false` | Automatically upload when recording stops |
| `defaultPublic` | boolean | `true` | Make buildlogs public by default |
| `includeFileContents` | boolean | `true` | Include file content snapshots |
| `maxFileSizeKb` | number | `100` | Maximum file size to include |

## Events

The skill emits the following events:

- `buildlog:started` — Recording began
- `buildlog:stopped` — Recording ended
- `buildlog:paused` — Recording paused
- `buildlog:resumed` — Recording resumed
- `buildlog:uploaded` — Buildlog uploaded successfully
- `buildlog:error` — An error occurred

## Examples

### Basic Recording

```
You: Start a buildlog "Building a REST API"
Assistant: 🔴 Recording started: "Building a REST API"

You: Create an Express server with TypeScript
Assistant: [creates files...]

You: Stop the buildlog
Assistant: Recording stopped. 12 exchanges captured.
         Would you like to upload to buildlog.ai?
```

### Retroactive Export

```
You: Export this session as a buildlog
Assistant: Exported 24 exchanges as buildlog.
         Title: "Untitled Session"
         Ready to upload?
```

## Privacy

- Buildlogs can be public or private
- API keys are never included in exports
- You control what gets shared
- Delete buildlogs anytime at buildlog.ai
