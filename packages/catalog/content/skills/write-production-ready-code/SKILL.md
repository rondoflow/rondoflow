---
name: write-production-ready-code
description: "Write production-ready code with clean architecture, proper error handling, and pragmatic trade-offs between shipping fast and building right."
category: "Content & Writing"
author: community
version: "1.0.0"
icon: pencil
---

## When to Use

Agent needs to write, review, or refactor code. Handles implementation decisions, architecture trade-offs, and code quality across any language or framework.

## Quick Reference

| Topic | File |
|-------|------|
| Code patterns | `patterns.md` |
| Architecture decisions | `architecture.md` |
| Testing practices | `testing.md` |

## Core Rules

### 1. Read Before Write
- Check existing code style, patterns, and conventions before writing new code
- Respect the current stack — never swap libraries without explicit request
- Match naming conventions, formatting, and project structure already in place

### 2. Code That Compiles
Every code block must:
- Have correct imports for the actual library versions in use
- Use APIs that exist in the project's dependency versions
- Pass basic syntax checks — no placeholder `// TODO: implement`

### 3. Minimal First
- Solve the specific problem, not hypothetical future problems
- One abstraction when you have three concrete cases, not before
- Features that might be needed → skip. Features that are needed → implement

### 4. Errors as First-Class Citizens
```
❌ catch (e) {}
❌ catch (e) { console.log(e) }
✅ catch (e) { logger.error('context', { error: e, input }); throw new DomainError(...) }
```
- Typed errors over generic strings
- Include context: what operation failed, with what input
- Distinguish recoverable vs fatal errors

### 5. Boundaries and Separation
| Layer | Contains | Never Contains |
|-------|----------|----------------|
| Handler/Controller | HTTP/CLI parsing, validation | Business logic, SQL |
| Service/Domain | Business rules, orchestration | Infrastructure details |
| Repository/Adapter | Data access, external APIs | Business decisions |

### 6. Explicit Trade-offs
When making architectural choices, state:
- What you chose and why
- What you traded away
- When to revisit the decision

Example: "Using SQLite for simplicity. Trade-off: no concurrent writes. Revisit if >1 write/sec needed."

### 7. PR-Ready Code
Before delivering any code:
- [ ] No dead code, commented blocks, or debug statements
- [ ] Functions under 30 lines
- [ ] No magic numbers — use named constants
- [ ] Early returns over nested conditionals
- [ ] Edge cases handled: null, empty, error states

## Code Quality Signals

**Senior code reads like prose:**
- Names explain "what" and "why", not "how"
- A junior understands it in 30 seconds
- No cleverness that requires comments to explain

**The best code is boring:**
- Predictable patterns
- Standard library over dependencies when reasonable
- Explicit over implicit

## Common Traps

| Trap | Consequence | Prevention |
|------|-------------|------------|
| Inventing APIs | Code doesn't compile | Verify method exists in docs first |
| Over-engineering | 3 hours instead of 30 min | Ask: "Do I have 3 concrete cases?" |
| Ignoring context | Suggests wrong stack | Read existing files before suggesting |
| Copy-paste without understanding | Hidden bugs surface later | Explain what the code does |
| Empty error handling | Silent failures in production | Always log + type + rethrow |
| Premature abstraction | Complexity without benefit | YAGNI until proven otherwise |

## Pragmatic Shipping

**Critical paths (do it right):**
- Authentication, authorization
- Payment processing
- Data integrity, migrations
- Secrets management

**Experimental paths (ship fast, iterate):**
- UI/UX features
- Admin panels
- Analytics
- Anything unvalidated with users

Test for critical path: "Can this wake me at 3am or lose money?"

## Security & Privacy

**This skill does NOT:**
- Store any data externally
- Make network requests
- Access files outside the current project

All code suggestions are generated in context of the conversation.
