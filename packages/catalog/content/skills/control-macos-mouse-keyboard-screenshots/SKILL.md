---
name: control-macos-mouse-keyboard-screenshots
description: "A high-fidelity automation bridge for macOS (Darwin) that enables agents to perceive the desktop state and execute precise mouse and keyboard interactions."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# macOS Control Skill

A high-fidelity automation bridge for macOS (Darwin) that enables agents to perceive the desktop state and execute precise mouse and keyboard interactions.

## 🛠 Included Scripts
This skill leverages specialized wrappers located in the `/scripts` directory to interface with system-level binaries:

### 1. `cliclick_wrapper.sh`
A dedicated wrapper for the `cliclick` utility to handle synthetic input events.
- **Path**: `scripts/cliclick_wrapper.sh`
- **Logic**: Executes `/opt/homebrew/bin/cliclick` with passed arguments.
- **Capabilities**: Left/Right clicks, mouse movement, and keyboard emulation.

### 2. `vision_wrapper.sh`
The visual perception engine for the skill.
- **Path**: `scripts/vision_wrapper.sh`
- **Logic**: Utilizes the native macOS `screencapture` utility in silent mode (`-x`).
- **Output**: Generates a standard PNG at `/tmp/claw_view.png`.

---

## 🚀 Tool Specifications

### `see`
Captures the current screen state for visual analysis.
* **Returns**: A string confirming the filepath of the capture.
* **Use Case**: Identifies UI elements, window positions, and application states.

### `click`
Sends precise commands to the mouse and keyboard.
* **Usage**: `click "c:x,y"` (Click) or `click "m:x,y"` (Move).
* **Syntax**: Supports all `cliclick` standard notation including `w:` (wait) and `t:` (type).

---

## ⚙️ Requirements & Setup

1. **Binary Dependency**:
   ```bash
   brew install cliclick
   ```
