---
name: configure-nginx-reverse-proxy
description: "Configure Nginx for reverse proxy, load balancing, SSL termination, and high-performance static serving."
category: "DevOps & Infra"
author: community
version: "1.0.1"
icon: server
---

## When to Use

User needs Nginx expertise — from basic server blocks to production configurations. Agent handles reverse proxy, SSL, caching, and performance tuning.

## Quick Reference

| Topic | File |
|-------|------|
| Reverse proxy patterns | `proxy.md` |
| SSL/TLS configuration | `ssl.md` |
| Performance tuning | `performance.md` |
| Common configurations | `examples.md` |

## Location Matching

- Exact `=` first, then `^~` prefix, then regex `~`/`~*`, then longest prefix
- `location /api` matches `/api`, `/api/`, `/api/anything` — prefix match
- `location = /api` only matches exactly `/api` — not `/api/`
- `location ~ \.php$` is regex, case-sensitive — `~*` for case-insensitive
- `^~` stops regex search if prefix matches — use for static files

## proxy_pass Trailing Slash

- `proxy_pass http://backend` preserves location path — `/api/users` → `/api/users`
- `proxy_pass http://backend/` replaces location path — `/api/users` → `/users`
- Common mistake: missing slash = double path — or unexpected routing
- Test with `curl -v` to see actual backend request

## try_files

- `try_files $uri $uri/ /index.html` for SPA — checks file, then dir, then fallback
- Last argument is internal redirect — or `=404` for error
- `$uri/` tries directory with index — set `index index.html`
- Don't use for proxied locations — use `proxy_pass` directly

## Proxy Headers

- `proxy_set_header Host $host` — backend sees original host, not proxy IP
- `proxy_set_header X-Real-IP $remote_addr` — client IP, not proxy
- `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for` — append to chain
- `proxy_set_header X-Forwarded-Proto $scheme` — for HTTPS detection

## Upstream

- Define servers in `upstream` block — `upstream backend { server 127.0.0.1:3000; }`
- `proxy_pass http://backend` uses upstream — load balancing included
- Health checks with `max_fails` and `fail_timeout` — marks server unavailable
- `keepalive 32` for connection pooling — reduces connection overhead

## SSL/TLS

- `ssl_certificate` is full chain — cert + intermediates, not just cert
- `ssl_certificate_key` is private key — keep permissions restricted
- `ssl_protocols TLSv1.2 TLSv1.3` — disable older protocols
- `ssl_prefer_server_ciphers on` — server chooses cipher, not client

## Common Mistakes

- `nginx -t` before `nginx -s reload` — test config first
- Missing semicolon — syntax error, vague message
- `root` inside `location` — prefer in `server`, override only when needed
- `alias` vs `root` — alias replaces location, root appends location
- Variables in `if` — many things break inside if, avoid complex logic

## Variables

- `$uri` is decoded, normalized path — `/foo%20bar` becomes `/foo bar`
- `$request_uri` is original with query string — unchanged from client
- `$args` is query string — `$arg_name` for specific parameter
- `$host` from Host header — `$server_name` from config

## Performance

- `worker_processes auto` — matches CPU cores
- `worker_connections 1024` — per worker, multiply by workers for max
- `sendfile on` — kernel-level file transfer
- `gzip on` only for text — `gzip_types text/plain application/json ...`
- `gzip_min_length 1000` — small files not worth compressing

## Logging

- `access_log off` for static assets — reduces I/O
- Custom log format with `log_format` — add response time, upstream time
- `error_log` level: `debug`, `info`, `warn`, `error` — debug is verbose
- Conditional logging with `map` and `if` — skip health checks
