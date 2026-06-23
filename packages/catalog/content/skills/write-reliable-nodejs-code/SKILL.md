---
name: write-reliable-nodejs-code
description: "Write reliable Node.js avoiding event loop blocking, async pitfalls, ESM gotchas, and memory leaks."
category: "Content & Writing"
author: community
version: "1.0.1"
icon: pencil
---

## Quick Reference

| Topic | File |
|-------|------|
| Callbacks, Promises, async/await, event loop | `async.md` |
| CommonJS vs ESM, require vs import | `modules.md` |
| Error handling, uncaught exceptions | `errors.md` |
| Readable, Writable, Transform, backpressure | `streams.md` |
| Memory leaks, event loop blocking, profiling | `performance.md` |
| Input validation, dependencies, env vars | `security.md` |
| Jest, Mocha, mocking, integration tests | `testing.md` |
| npm, package.json, lockfiles, publishing | `packages.md` |

## Critical Traps

- `fs.readFileSync` blocks entire server — use `fs.promises.readFile`
- Unhandled rejection crashes Node 15+ — always `.catch()` or try/catch
- `process.env` values are strings — `"3000"` not `3000`, parseInt needed
- `JSON.parse` throws on invalid — wrap in try/catch
- `require()` cached — same object, mutations visible everywhere
- Circular deps return incomplete export — restructure to avoid
- Event listeners accumulate — `removeListener` or `once()`
- `async` always returns Promise — even for plain return
- `pipeline()` over `.pipe()` — handles errors and cleanup
- No `__dirname` in ESM — use `fileURLToPath(import.meta.url)`
- `Buffer.from(string)` — encoding matters, default UTF-8
