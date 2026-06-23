---
name: write-safe-swift-code
description: "Write safe Swift code avoiding memory leaks, optional traps, and concurrency bugs."
category: "Content & Writing"
author: community
version: "1.0.1"
icon: pencil
---

## Quick Reference

| Topic | File |
|-------|------|
| Optionals, nil safety, force unwrap | `optionals.md` |
| Retain cycles, weak refs, closures | `memory.md` |
| async/await, actors, Sendable, value types | `concurrency.md` |
| JSON encoding/decoding traps | `codable.md` |
| Protocols, collections, strings, errors, build | `types.md` |
| SwiftUI state (@State, @Binding, Combine) | `swiftui.md` |
| Property wrappers, actors, result builders, macros | `advanced.md` |
| XCTest pitfalls, SPM gotchas | `testing.md` |

## Critical Rules

### Memory & Safety
- Force unwrap `!` crashes on nil — use `guard let` or `if let` instead
- Closures capturing `self` strongly create retain cycles — use `[weak self]` in escaping closures
- Delegates must be `weak` — strong delegate = object never deallocates
- `try!` crashes on any error — never use in production paths
- `removeFirst()` crashes on empty — use `popFirst()` for safety

### Concurrency
- `async let` starts immediately — not when you `await`
- Actor reentrancy at every `await` — state may change between suspension points
- `@MainActor` doesn't guarantee immediate main thread — it's queued
- `Sendable` conformance violations crash at runtime — compiler warnings are errors

### Types & Collections
- Protocol extensions don't override — static dispatch ignores subclass implementation
- Mutating struct in collection requires reassignment — `array[0].mutate()` doesn't work
- `String.Index` from one string invalid on another — even if contents match

### SwiftUI
- `@StateObject` owns, `@ObservedObject` borrows — recreating view loses ObservedObject state
- `@EnvironmentObject` crashes if not injected — no compile-time check
- View identity change resets all `@State` — changing ID loses state

### Build
- `print()` builds strings even in release — remove or use os_log
- Generic code bloat — specialized for each type, increases binary size
