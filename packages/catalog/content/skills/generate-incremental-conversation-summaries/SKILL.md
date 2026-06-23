---
name: generate-incremental-conversation-summaries
description: "Generate summaries for conversation content with incremental update support."
category: "Content & Writing"
author: community
version: "1.0.0"
icon: pencil
---

# Conversation Summary - Agent Instructions

Use this skill to generate summaries for conversation content.

## Usage

When the user requests any of the following:
- "Summarize this conversation"
- "Generate a summary"
- "What did we talk about"

Use the `summarize_conversation` tool to call the summary API.

## How to Call

```bash
python3 scripts/conversation_summary.py '<chat_list_json>' '<history_summary>'
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_list | string | Yes | JSON formatted conversation content |
| history_summary | string | No | Previous summary for incremental update |

### chat_list Format Example

```json
[
  {"role": "user", "content": "How is the weather today?"},
  {"role": "assistant", "content": "It is sunny, 25 degrees."}
]
```

## Response

The script returns JSON with:
- `status`: "completed" or "error"
- `summary`: Generated conversation summary
- `error`: Error message if failed

## Error Handling

- If the API returns a non-zero code, report the error message to the user
- If the request fails, check network connectivity
- Ensure chat_list is valid JSON format before calling
