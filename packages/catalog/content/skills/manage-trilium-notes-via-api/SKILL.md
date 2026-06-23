---
name: manage-trilium-notes-via-api
description: "Work with Trilium Notes via the [ETAPI](https://github.com/zadam/trilium/wiki/Etapi)."
category: "Productivity"
author: community
version: "1.0.3"
icon: check-square
---

# Trilium Notes

Work with Trilium Notes via the [ETAPI](https://github.com/zadam/trilium/wiki/Etapi).

## Configuration

This skill requires a Trilium ETAPI token and the server URL. These should be stored in the environment or passed by the user.

- `TRILIUM_ETAPI_TOKEN`: Your ETAPI token (generated in Trilium -> Options -> ETAPI).
- `TRILIUM_SERVER_URL`: The URL of your Trilium server (e.g., `http://localhost:8080`).

## Core Concepts

- **Note ID**: A unique identifier for a note (e.g., `root`, `_day_2026-02-11`).
- **Attributes**: Metadata attached to notes (labels, relations).
- **ETAPI**: The External Trilium API, a REST API for interacting with the database.

## Example Prompts

### Search for information
- "Search my Trilium notes for 'Home Lab'"
- "Find any notes in Trilium about 'Docker configuration'"
- "What did I write in Trilium about 'Project X'?"

### Create new content
- "Create a new note in Trilium called 'Meeting Notes' under the root folder"
- "Add a note to Trilium with title 'Ideas' and content 'Buy more coffee'"
- "Create a text note in Trilium under my 'Projects' folder"

### Read and retrieve
- "Show me the content of my Trilium note called 'Todo List'"
- "Get the details for the Trilium note with ID 'U5cC2X3KKPdC'"

## Reference Documentation
For detailed API information, see [references/api.md](references/api.md).
