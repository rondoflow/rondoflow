---
name: build-reliable-flutter-apps
description: "Build reliable Flutter apps avoiding state loss, widget rebuild traps, and async pitfalls."
category: "Community"
author: community
version: "1.0.1"
icon: puzzle
---

## Quick Reference

| Topic | File |
|-------|------|
| setState, state loss, keys | `state.md` |
| build method, context, GlobalKey | `widgets.md` |
| FutureBuilder, dispose, mounted | `async.md` |
| Context after pop, deep linking | `navigation.md` |
| const, rebuilds, performance | `performance.md` |
| Platform channels, null safety | `platform.md` |

## Critical Rules

- `setState` after dispose — check `mounted` before calling, crashes otherwise
- Key missing on list items — reordering breaks state, always use keys
- FutureBuilder rebuilds on parent rebuild — triggers future again, cache the Future
- BuildContext after async gap — context may be invalid, check `mounted` first
- `const` constructor — prevents rebuilds, use for static widgets
- `StatefulWidget` recreated — key change or parent rebuild creates new state
- GlobalKey expensive — don't use just to access state, pass callbacks instead
- `dispose` incomplete — cancel timers, subscriptions, controllers
- Navigator.pop with result — returns Future, don't ignore errors
- ScrollController not disposed — memory leak
- Image caching — use `cached_network_image`, default doesn't persist
- PlatformException not caught — platform channel calls can throw
