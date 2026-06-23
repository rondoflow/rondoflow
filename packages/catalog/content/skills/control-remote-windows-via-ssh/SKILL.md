---
name: control-remote-windows-via-ssh
description: "Control remote Windows machines via SSH. Use when executing commands on Windows, checking GPU status (nvidia-smi), running scripts, or managing remote Windows systems. Triggers on \"run on Windows\", \"execute on remote\", \"check GPU\", \"nvidia-smi\", \"远程执行\", \"Windows 命令\"."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

# Windows Remote Control

Execute commands on remote Windows machines via SSH.

## Configuration

Set environment variables in `~/.openclaw/openclaw.json` under `skills.windows-remote.env`:

```json
{
  "skills": {
    "windows-remote": {
      "env": {
        "WINDOWS_SSH_HOST": "192.168.1.100",
        "WINDOWS_SSH_PORT": "22",
        "WINDOWS_SSH_USER": "Administrator"
      }
    }
  }
}
```

Or export directly:
```bash
export WINDOWS_SSH_HOST="192.168.1.100"
export WINDOWS_SSH_PORT="22"
export WINDOWS_SSH_USER="Administrator"
```

## Quick Commands

### Check Connection
```bash
scripts/win-exec.sh "echo connected"
```

### GPU Status
```bash
scripts/win-exec.sh "nvidia-smi"
```

### Run PowerShell
```bash
scripts/win-exec.sh "powershell -Command 'Get-Process | Select-Object -First 10'"
```

### Execute Script
```bash
scripts/win-exec.sh "python C:\\path\\to\\script.py"
```

## Script Reference

### win-exec.sh
Execute a single command on the remote Windows machine.

```bash
scripts/win-exec.sh "<command>"
```

### win-gpu.sh
Quick GPU status check (nvidia-smi wrapper).

```bash
scripts/win-gpu.sh
scripts/win-gpu.sh --query  # Compact output
```

### win-upload.sh
Upload files to the remote machine via SCP.

```bash
scripts/win-upload.sh <local-file> <remote-path>
```

### win-download.sh
Download files from the remote machine.

```bash
scripts/win-download.sh <remote-path> <local-file>
```

## Common Tasks

### Check if Ollama is Running
```bash
scripts/win-exec.sh "tasklist | findstr ollama"
```

### Start a Service
```bash
scripts/win-exec.sh "net start <service-name>"
```

### Run Python with GPU
```bash
scripts/win-exec.sh "python -c \"import torch; print(torch.cuda.is_available())\""
```

### Check Disk Space
```bash
scripts/win-exec.sh "wmic logicaldisk get size,freespace,caption"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check SSH service: `Get-Service sshd` |
| Permission denied | Verify SSH key in `~/.ssh/authorized_keys` or `administrators_authorized_keys` |
| Timeout | Check firewall rules, verify IP/port |
| Command not found | Use full path or check PATH on Windows |

## Security Notes

- Use SSH keys instead of passwords
- Keep private keys secure (chmod 600)
- Consider using Tailscale for cross-network access
