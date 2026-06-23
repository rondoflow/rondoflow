---
name: operate-linux-systems-safely
description: "Operate Linux systems avoiding permission traps, silent failures, and common admin mistakes."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

# Linux Gotchas

## Permission Traps
- `chmod 777` fixes nothing, breaks everything — find the actual owner/group issue
- Setuid on scripts is ignored for security — only works on binaries
- `chown -R` follows symlinks outside target directory — use `--no-dereference`
- Default umask 022 makes files world-readable — set 077 for sensitive systems
- ACLs override traditional permissions silently — check with `getfacl`

## Process Gotchas
- `kill` sends SIGTERM by default, not SIGKILL — process can ignore it
- `nohup` doesn't work if process already running — use `disown` instead
- Background job with `&` still dies on terminal close without `disown` or `nohup`
- Zombie processes can't be killed — parent must call wait() or be killed
- `kill -9` skips cleanup handlers — data loss possible, use SIGTERM first

## Filesystem Traps
- Deleting open file doesn't free space until process closes it — check `lsof +L1`
- `rm -rf /path /` with accidental space = disaster — use `rm -rf /path/` trailing slash
- Inodes exhausted while disk shows space free — many small files problem
- Symlink loops cause infinite recursion — `find -L` follows them
- `/tmp` cleared on reboot — don't store persistent data there

## Disk Space Mysteries
- Deleted files held open by processes — `lsof +L1` shows them, restart process to free
- Reserved blocks (5% default) only for root — `tune2fs -m 1` to reduce
- Journal eating space — `journalctl --vacuum-size=500M`
- Docker overlay eating space — `docker system prune -a`
- Snapshots consuming space — check LVM, ZFS, or cloud provider snapshots

## Networking
- `localhost` and `127.0.0.1` may resolve differently — check `/etc/hosts`
- Firewall rules flushed on reboot unless saved — `iptables-save` or use firewalld/ufw persistence
- `netstat` deprecated — use `ss` instead
- Port below 1024 requires root — use `setcap` for capability instead
- TCP TIME_WAIT exhaustion under load — tune `net.ipv4.tcp_tw_reuse`

## SSH Traps
- Wrong permissions on ~/.ssh = silent auth failure — 700 for dir, 600 for keys
- Agent forwarding exposes your keys to remote admins — avoid on untrusted servers
- Known hosts hash doesn't match after server rebuild — remove old entry with `ssh-keygen -R`
- SSH config Host blocks: first match wins — put specific hosts before wildcards
- Connection timeout on idle — add `ServerAliveInterval 60` to config

## Systemd
- `systemctl enable` doesn't start service — also need `start`
- `restart` vs `reload`: restart drops connections, reload doesn't (if supported)
- Journal logs lost on reboot by default — set `Storage=persistent` in journald.conf
- Failed service doesn't retry by default — add `Restart=on-failure` to unit
- Dependency on network: `After=network.target` isn't enough — use `network-online.target`

## Cron Pitfalls
- Cron has minimal PATH — use absolute paths or set PATH in crontab
- Output goes to mail by default — redirect to file or `/dev/null`
- Cron uses system timezone, not user's — set TZ in crontab if needed
- Crontab lost if edited incorrectly — `crontab -l > backup` before editing
- @reboot runs on daemon restart too, not just system reboot

## Memory and OOM
- OOM killer picks "best" victim, often not the offender — check dmesg for kills
- Swap thrashing worse than OOM — monitor with `vmstat`
- Memory usage in `free` includes cache — "available" is what matters
- Process memory in `/proc/[pid]/status` — VmRSS is actual usage
- cgroups limit respected before system OOM — containers die first

## Commands That Lie
- `df` shows filesystem capacity, not physical disk — check underlying device
- `du` doesn't count sparse files correctly — file appears smaller than disk usage
- `ps aux` memory percentage can exceed 100% (shared memory counted multiple times)
- `uptime` load average includes uninterruptible I/O wait — not just CPU
- `top` CPU percentage is per-core — 400% means 4 cores maxed
