---
name: clickup-task-management-api
description: "**Note:** Configure your credentials in TOOLS.md or set environment variables:"
category: "Productivity"
author: community
version: "1.0.2"
icon: check-square
---

# ClickUp Integration

## Credentials
**Note:** Configure your credentials in TOOLS.md or set environment variables:
- `CLICKUP_API_TOKEN` - Your ClickUp API token
- `CLICKUP_WORKSPACE_ID` - Your ClickUp workspace ID

## User Assignment Guide
When assigning tasks, use the correct email based on who should do the work:

| Email | Who | Use When |
|-------|-----|----------|
| `your-email@example.com` | **Human** | Tasks for you to do manually |
| `ai-assistant@example.com` | **AI Assistant** | Tasks for AI to execute |
| Both emails | **Both Human + AI** | Collaborative tasks where AI does research/writing, human reviews/decides |

### Examples
- **AI-only task**: "Research trend detection tools" → Assign to AI email
- **Human-only task**: "Record video for YouTube" → Assign to your email
- **Collaborative**: "Create content strategy" → Assign to both

## Common Actions

### List Tasks in a List
```http
GET https://api.clickup.com/api/v2/list/{list_id}/task
Authorization: {your_api_token}
```

### Get All Tasks in Workspace
```http
GET https://api.clickup.com/api/v2/team/{workspace_id}/task
Authorization: {your_api_token}
```

### Create Task
```http
POST https://api.clickup.com/api/v2/list/{list_id}/task
Authorization: {your_api_token}
Content-Type: application/json

{
  "name": "Task name",
  "description": "Task description",
  "status": "active"
}
```

### Update Task Status
```http
PUT https://api.clickup.com/api/v2/task/{task_id}
Authorization: {your_api_token}
Content-Type: application/json

{
  "status": "done"
}
```

### Get Task Details
```http
GET https://api.clickup.com/api/v2/task/{task_id}
Authorization: {your_api_token}
```

## Headers for All Requests
```
Authorization: {your_api_token}
Content-Type: application/json
```

## Status Values
Common statuses: `active`, `pending`, `review`, `completed`, `done`

## Error Handling
- 401: Check API token
- 404: Verify list_id or task_id exists
- 429: Rate limited - wait before retrying
