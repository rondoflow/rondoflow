---
name: configure-server-cloud-firewalls
description: "Configure firewalls on servers and cloud providers with security best practices."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

# Firewall Rules

## Critical First Steps
- Allow SSH/remote access before enabling any firewall — enabling first locks you out
- Test access in a second session before closing the first — verify the rule actually works
- Know how to access provider console — it's the only way back if locked out

## Default Stance
- Default deny all incoming traffic — only open what you explicitly need
- Default allow outgoing traffic — most apps need to reach the internet
- Every open port is attack surface — question each one before adding

## Essential Ports
- SSH (22 or custom): Always needed for remote access — consider limiting to your IP only
- HTTP (80): Only if serving web traffic — also needed for Let's Encrypt HTTP challenge
- HTTPS (443): For production web services
- Don't open database ports (3306, 5432, 27017) to the internet — access via SSH tunnel or private network

## Provider Firewalls (Hetzner, DigitalOcean, AWS, etc.)
- Provider firewall applies before traffic reaches your server — faster, less server load
- Changes usually apply immediately — no reload command needed
- Stateful by default — allow inbound, responses automatically allowed outbound
- Apply to server groups for consistency — easier than per-server rules
- Provider firewall + OS firewall = defense in depth — use both when possible

## IP Restrictions
- Limit SSH to known IPs when possible — dramatically reduces attack surface
- Your home IP may change — use a VPN with static IP or update rules when it changes
- Allow IP ranges with CIDR notation — /32 is single IP, /24 is 256 IPs
- Some providers support dynamic DNS in rules — check before building complex solutions

## Common Services to Consider
- VPN (WireGuard: 51820/UDP, OpenVPN: 1194) — allows secure access without exposing other ports
- Mail (25, 465, 587) — only if running mail server
- DNS (53 TCP/UDP) — only if running DNS server
- Monitoring agents may need outbound access to specific IPs

## Docker Warning
- Docker bypasses most OS firewalls by default — containers expose ports regardless of UFW/iptables
- Solution: bind containers to localhost only and use reverse proxy for public access
- Or configure Docker to respect firewall rules — requires additional setup
- Provider-level firewalls still work — they block before traffic reaches Docker

## IPv6
- Firewalls often have separate IPv4 and IPv6 rules — configure both
- Provider firewalls may handle both together — check their documentation
- Attackers probe IPv6 when IPv4 is locked down — don't neglect it

## Debugging
- Test from outside your network — rules may look correct but not work
- Provider dashboards often show blocked traffic logs
- "Connection refused" = port closed properly; "Connection timeout" = firewall dropping silently
- Online port scanners verify what's actually open from the internet

## Common Mistakes
- Opening ports "temporarily" and forgetting to close them
- Opening 80/443 when no web server runs — unnecessary exposure
- Forgetting UDP for services that need it — DNS, VPN, game servers
- Assuming firewall is active — verify it's actually running/applied
- Only configuring IPv4 — leaving IPv6 wide open
- Trusting "security through obscurity" — non-standard ports slow attackers, don't stop them
