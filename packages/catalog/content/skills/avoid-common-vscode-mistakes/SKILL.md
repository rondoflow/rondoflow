---
name: avoid-common-vscode-mistakes
description: "Avoid common VSCode mistakes — settings conflicts, debugger setup, and extension clashes."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

## Settings Precedence
- User → Workspace → Folder — later overrides earlier
- `.vscode/settings.json` per project — overrides user settings
- `"editor.formatOnSave"` in workspace overrides user — can be confusing
- Multi-root workspaces need per-folder settings — or root `.code-workspace` file
- Some settings only work in user — `"terminal.integrated.shell"` is user-only

## Formatter Conflicts
- Multiple formatters for same language — set `"[language]": {"editor.defaultFormatter": "id"}`
- Prettier vs ESLint both formatting — disable one: `"prettier.enable": false` in ESLint projects
- Format on save runs wrong formatter — explicit `defaultFormatter` required
- `.editorconfig` overrides some settings — can conflict with extension settings

## Debugger Setup
- `launch.json` needed for most debugging — can't just press F5
- `"cwd"` relative to workspace root — not launch.json location
- `"program"` path wrong — use `${workspaceFolder}/path/to/file`
- Node.js: `"skipFiles"` to avoid stepping into node_modules
- Compound configurations for multi-process — `"compounds"` array in launch.json

## Extensions
- Extension host crash — disable recently installed, enable one by one
- "Cannot find module" after install — restart VS Code completely
- Extension settings not applying — check if workspace setting overrides
- Conflicting extensions — keybinding conflicts, duplicate features

## Terminal
- Wrong shell on new terminal — set `"terminal.integrated.defaultProfile.*"`
- Environment variables missing — terminal inherits from launch method, not .bashrc
- Path not updated after install — restart VS Code, not just terminal
- Shell integration issues — `"terminal.integrated.shellIntegration.enabled": false` to disable

## Remote Development
- SSH: `~/.ssh/config` Host must match — `"remote.SSH.configFile"` to use different config
- Containers: `.devcontainer/devcontainer.json` required — won't auto-detect Dockerfile
- WSL: extensions install separately — WSL extensions stay in WSL
- Port forwarding: auto but not always — check Ports panel

## Workspace Trust
- Restricted mode disables some features — debugging, tasks, some extensions
- Trust prompt on first open — "Trust Folder" to enable everything
- Per-folder trust in multi-root — can trust some folders, not others

## Common Fixes
- IntelliSense not working — check language server status in Output panel
- "Cannot find module" in TypeScript — restart TS server: Cmd+Shift+P → "TypeScript: Restart TS Server"
- Git not detecting changes — check if inside subfolder, `.git` must be at root or configured
- Settings not saving — check write permissions on settings.json
