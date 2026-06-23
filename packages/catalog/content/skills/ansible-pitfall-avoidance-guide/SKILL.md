---
name: ansible-pitfall-avoidance-guide
description: "Avoid common Ansible mistakes — YAML syntax traps, variable precedence, idempotence failures, and handler gotchas."
category: "Community"
author: community
version: "1.0.0"
icon: puzzle
---

## YAML Syntax Traps
- Jinja2 in value needs quotes — `"{{ variable }}"` not `{{ variable }}`
- `:` in string needs quotes — `msg: "Note: this works"` not `msg: Note: this`
- Boolean strings: `yes`, `no`, `true`, `false` parsed as bool — quote if literal string
- Indentation must be consistent — 2 spaces standard, tabs forbidden

## Variable Precedence
- Extra vars (`-e`) override everything — highest precedence
- Host vars beat group vars — more specific wins
- `vars:` in playbook beats inventory vars — order: inventory < playbook < extra vars
- Undefined variable fails — use `{{ var | default('fallback') }}`

## Idempotence
- `command`/`shell` modules aren't idempotent — always "changed", use `creates:` or specific module
- Use `apt`, `yum`, `copy` etc. — designed for idempotence
- `changed_when: false` for commands that don't change state — like queries
- `creates:`/`removes:` for command idempotence — skips if file exists/doesn't

## Handlers
- Handlers only run if task reports changed — not on "ok"
- Handlers run once at end of play — not immediately after notify
- Multiple notifies to same handler = one run — deduplicated
- `--force-handlers` to run even on failure — or `meta: flush_handlers`

## Become (Privilege Escalation)
- `become: yes` to run as root — `become_user:` for specific user
- `become_method: sudo` is default — use `su` or `doas` if needed
- Password needed for sudo — `--ask-become-pass` or in ansible.cfg
- Some modules need become at task level — even if playbook has `become: yes`

## Conditionals
- `when:` without Jinja2 braces — `when: ansible_os_family == "Debian"` not `when: "{{ ... }}"`
- Multiple conditions use `and`/`or` — or list for implicit `and`
- `is defined`, `is not defined` for optional vars — `when: my_var is defined`
- Boolean variables: `when: my_bool` — don't compare `== true`

## Loops
- `loop:` is modern, `with_items:` is legacy — both work, loop preferred
- `loop_control.loop_var` for nested loops — avoids variable collision
- `item` is the loop variable — use `loop_control.label` for cleaner output
- `until:` for retry loops — `until: result.rc == 0 retries: 5 delay: 10`

## Facts
- `gather_facts: no` speeds up play — but can't use `ansible_*` variables
- Facts cached with `fact_caching` — persists across runs
- Custom facts in `/etc/ansible/facts.d/*.fact` — JSON or INI, available as `ansible_local`

## Common Mistakes
- `register:` captures output even on failure — check `result.rc` or `result.failed`
- `ignore_errors: yes` continues but doesn't change result — task still "failed" in register
- `delegate_to: localhost` for local commands — but `local_action` is cleaner
- Vault password for encrypted files — `--ask-vault-pass` or vault password file
- `--check` (dry run) not supported by all modules — `command`, `shell` always skip
