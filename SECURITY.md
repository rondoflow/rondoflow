# Security Policy

RondoFlow is a local-first, self-hosted, visual orchestration platform for Claude Code
agents. Its server spawns the Claude Code CLI as child processes that can read and write
files and run shell commands on the host, governed by a policy system. Because of this,
security is central to how the project is built and operated. This document describes which
versions receive fixes, how to report a vulnerability, the security model implemented in the
code, and the trust assumptions and limitations you must understand before deploying it.

## Supported Versions

RondoFlow is pre-1.0 (0.x). The API, schema, and security surface may change between minor
releases, so only the latest released version receives security fixes. Older 0.x versions
are not patched — upgrade to the latest release to receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x (latest) | :white_check_mark: |
| < 0.1.0 | :x:                |

If a fix is required, it will be released as a new 0.x version. There are no long-term
support branches for earlier 0.x releases.

## Reporting a Vulnerability

Please report security vulnerabilities **privately** through GitHub's private vulnerability
reporting, not through public channels.

1. Go to the repository on GitHub: <https://github.com/rondoflow/rondoflow>
2. Open the **Security** tab.
3. Click **Report a vulnerability** to open a private advisory.
4. Include a clear description, the affected version/commit, reproduction steps, and the
   impact you observed.

**Please do not open a public GitHub issue or pull request for a suspected vulnerability**,
and do not disclose it publicly until a fix has been released and coordinated. Public
disclosure before a fix puts every operator at risk.

What to expect:

- **Acknowledgement:** we aim to acknowledge a valid report within **5 business days**.
- **Coordination:** we will work with you to confirm the issue, assess impact, prepare a
  fix, and agree on a coordinated disclosure timeline before any public details are shared.
- **Credit:** with your permission, we are happy to credit you in the advisory once the fix
  ships.

This is a community open-source project (MIT licensed) with no formal bug-bounty program or
guaranteed response SLA, but reports are taken seriously and handled in good faith.

## Security Model

RondoFlow's threat model centers on one fact: an Assistant (Agent) is a real Claude Code CLI
subprocess that can read/write files and run shell commands on the host. The defenses below
harden the boundary between RondoFlow and the processes and tools it starts, and between the
HTTP/WebSocket surface and unauthenticated callers. Every protection listed here is
implemented in the codebase.

### Process execution safety

- **Never `shell: true`.** Agents are started with Node's `child_process.spawn` using an
  argument array — never a shell string — so nothing in a prompt, tool list, or directory
  path is interpreted by a shell. This eliminates the classic command-injection vector.
- **No `execSync`.** Synchronous external calls use `spawnSync` with an args array, never a
  concatenated command string.
- **Prompt is always a positional argument after `--`.** The CLI is invoked with an explicit
  `--` end-of-options separator placed immediately before the prompt, so variadic flags
  (`--allowedTools`, `--add-dir`) can never absorb the prompt or smuggle in extra options.
- **Structured output only.** The CLI is started with `--output-format stream-json`, so
  RondoFlow parses typed events instead of scraping free-form text.
- **Whole-tree termination.** On Unix the child runs in its own process group
  (`detached: true`) so a Stop kills the entire process tree via a negative PID; on Windows
  `taskkill /T /F` does the same.

### Three-layer Safety Rule (Policy) resolution

Safety Rules (Policies) constrain what an Assistant may do and resolve with
**most-restrictive-wins** semantics across three layers, merged in order: **global → agent →
session**. Because each merge step can only tighten the inherited value, a narrower scope
(session) can never relax a broader restriction (global or agent).

| Field | Merge rule |
| --- | --- |
| Numeric limits (`maxTimeout`, `maxFileSize`, `maxBudgetUsd`) | Minimum value wins |
| `blockedCommands` | Union — additive; the blocked list never shrinks |
| `requireApproval` | Union of patterns; if any layer sets `true`, **every** command requires human approval (the strictest result) |
| `permissionMode` | Escalates toward the strictest mode (`default` > `plan` > `acceptEdits` > `dontAsk` / `bypassPermissions`, the least restrictive) |

Defaults when no rule overrides them: a 5-minute (300,000 ms) timeout, a 10 MB file-size
cap, and a 100 USD budget ceiling.

### Tool gating and human approval

At runtime each tool invocation is checked against the resolved policy:

- A command matching the **blocked** list is denied outright.
- A command matching a **require-approval** pattern is allowed only after a human explicitly
  approves it.
- **Approvals auto-reject after 5 minutes.** A pending approval that is not answered within
  its timeout is automatically rejected, so a run can never hang indefinitely waiting on a
  human.

### Credential and secret handling

- **AES-256-GCM at rest.** Workspace secret variables are encrypted with `aes-256-gcm`
  (a random IV per value plus an authentication tag) before being written to the database.
  Decryption fails loudly if a stored value has been tampered with (GCM tag mismatch).
- **Secrets do not leave the server in full.** When a workspace resource is serialized for
  the API, the secret value is omitted; credentials never reach the frontend.
- **Exactly one Claude credential is forwarded, deterministically.** A setup token
  (`CLAUDE_CODE_OAUTH_TOKEN`) wins over an API key (`ANTHROPIC_API_KEY`), so an ambient API
  key cannot silently override the credential you chose. This precedence is shared by every
  Claude-invoking path. When spawn-time tracing is enabled, the forwarded credential is
  masked in logs and the `--mcp-config` value is redacted entirely.
- **No hardcoded auth secret.** `BETTER_AUTH_SECRET` must be set; there is no hardcoded
  fallback.

### Environment isolation for child processes

A spawned child does **not** inherit RondoFlow's full environment. The spawner builds a fresh
environment from a small allowlist (`PATH`, `HOME`, `USERPROFILE`, `LANG`, `TERM`, plus
Windows runtime equivalents) and the output-token ceiling. Server secrets are on a hard
blocklist and are **never** forwarded to a child — `DATABASE_URL`, `BETTER_AUTH_SECRET`, and
`RONDOFLOW_SECRET` are stripped (compared case-insensitively) even if a workspace "variable"
resource tries to supply one of those names.

### Input validation and filesystem protection

- **Zod at the edges.** Request bodies and query strings are parsed with Zod schemas (with
  explicit min/max bounds, enums, and URL validation) so malformed input is rejected before
  it touches the database or the engine.
- **Path-traversal protection on filesystem routes.** Filenames containing `..`, `/`, or `\`
  are rejected, and resolved read targets are re-checked to confirm they stay inside the
  intended directory.

### Authorization and transport

- **Session auth on every non-public route.** Authentication is handled by Better Auth with
  session cookies; routes return `401` without a valid session.
- **Per-user ownership checks (IDOR protection).** Routes and socket handlers verify that the
  authenticated user owns the resource they are acting on.
- **WebSocket auth and room scoping.** Socket.IO connections are rejected without a valid
  session cookie, and each client joins a per-user room so server-to-client events are scoped
  to their owner rather than broadcast.
- **CORS enforced.** Both the HTTP server and the Socket.IO server restrict origins (default
  `http://localhost:3000`) with credentials, so a hostile page in another origin cannot drive
  the API using the user's cookies.

### Rate limiting

`@fastify/rate-limit` guards against abuse and runaway use:

- **Global:** 5000 requests/minute per IP across every route (returns `429`, not a masked
  `500`).
- **Auth:** sign-in is limited to 30 requests/minute to deter credential brute-forcing.
- **AI generation:** workflow generation is limited to 10 requests/minute because it is
  expensive.

## Deployment & Trust Model / Known Limitations

Read this section before deploying RondoFlow. The protections above harden specific
boundaries; they do **not** make RondoFlow safe to expose to untrusted networks or untrusted
users.

- **Local-first, effectively single-user.** Multi-user authentication with roles
  (admin/editor/viewer) is **not implemented yet**. RondoFlow assumes a single trusted
  operator on a trusted machine. Treat anyone who can reach the running instance as having
  full operator capability.
- **Agents execute code on the host.** Within the policy limits, an Assistant runs real shell
  commands and reads/writes files on the host with the privileges of the server process.
  Policies reduce risk but do not sandbox the host. Run RondoFlow only on a machine and under
  an account whose blast radius you accept.
- **Do not expose the server to untrusted networks.** Do not put the RondoFlow server (or its
  UI) on the public internet or any network reachable by untrusted parties. Keep it on
  `localhost` or behind a trusted private network / VPN. The HTTP and WebSocket hardening is
  not a substitute for network isolation.
- **Do not run as root with `bypassPermissions` outside a sandbox.** The Claude Code CLI
  refuses `--dangerously-skip-permissions` as root unless the environment is marked sandboxed
  (`IS_SANDBOX=1`). RondoFlow sets that flag only for that exact case. Running privileged with
  bypass permissions outside a real sandbox/container removes a meaningful safety check —
  avoid it.
- **The host file picker is permissive by design.** The `/api/fs/*` host file-browser routes
  are intentionally permissive to make local use convenient (browsing your own machine). This
  is acceptable for the single-operator, local-first model but is another reason not to expose
  the instance to others.
- **Pre-execution native policy blocking is a planned improvement.** Today, dangerous tool use
  is handled via a detect-and-act path (the tool event is evaluated and then blocked or held
  for approval) rather than blocked natively before the CLI considers it. Treat policies as a
  strong guardrail, not a hard kernel-level sandbox.
- **Protect the encryption key material.** `RONDOFLOW_SECRET` (falling back to
  `BETTER_AUTH_SECRET`) derives the key that protects every stored secret. Keep these out of
  version control; rotating them invalidates previously encrypted secret variables.

### Reminder

If you find a way to bypass any of the boundaries above, please report it privately through
GitHub's **Security** tab as described in [Reporting a Vulnerability](#reporting-a-vulnerability)
rather than opening a public issue.
