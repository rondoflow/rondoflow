---
name: visualize-repository-complexity-stats
description: "Visualizes repository complexity by counting files, lines of code, and grouping by extension. Use to assess project size or growth."
category: "Development"
author: community
version: "1.0.0"
icon: code
---

# Code Stats

Analyzes the current workspace to provide development metrics.

## Usage

```bash
node skills/code-stats/index.js [path]
```

Defaults to current working directory if path is omitted.

## Output

JSON object with:
- `files`: Total file count.
- `lines`: Total line count (approximate).
- `byExt`: Breakdown by file extension.
