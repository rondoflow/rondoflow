---
name: local-usage-statistics-reporting
description: "Advanced usage statistics and high-fidelity visual reporting for OpenClaw. 100% local processing. Audit-verified privacy (No credentials stored)."
category: "Community"
author: community
version: "1.1.3"
icon: puzzle
---

# Usage Visualizer

**Usage Visualizer** is a high-fidelity analytics engine for OpenClaw that transforms raw session logs into professional, actionable visual reports.

## 🚀 Quick Start

```bash
# Generate today's visual report
python3 scripts/run_usage_report.py --mode image --period today
```

## 📈 Usage Guide

### Visual Reports
The visualizer syncs logs first, then generates the report image.
- `python3 scripts/run_usage_report.py --mode image --period today`
- `python3 scripts/run_usage_report.py --mode image --period week --json`

### Text Summaries
- `python3 scripts/run_usage_report.py --mode text --period today --json`

## 🛡 Delivery Protocol (MANDATORY FOR AGENTS)

1.  **Image Delivery**: Extract `image_path` from JSON and send as attachment using `message` tool's `filePath`. **NEVER** send the local path as a string.
2.  **Verification**: Verify the file exists and is a valid PNG before sending.
3.  **No Network**: This skill is 100% local. It has zero network dependencies.

## 📄 License
MIT
