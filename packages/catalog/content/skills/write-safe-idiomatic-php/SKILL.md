---
name: write-safe-idiomatic-php
description: "Write solid PHP avoiding type juggling traps, array quirks, and common security pitfalls."
category: "Content & Writing"
author: community
version: "1.0.1"
icon: pencil
---

## Quick Reference

| Topic | File |
|-------|------|
| Loose typing, ==, ===, type juggling, strict_types | `types.md` |
| Associative arrays, iteration, array functions | `arrays.md` |
| Traits, interfaces, visibility, late static binding | `oop.md` |
| Encoding, interpolation, heredoc, regex | `strings.md` |
| Exceptions, error handling, @ operator | `errors.md` |
| SQL injection, XSS, CSRF, input validation | `security.md` |
| PHP 8+ features, attributes, named args, match | `modern.md` |

## Critical Rules

- `==` coerces types: `"0" == false` is true — always use `===` for strict comparison
- `in_array($val, $arr)` uses loose comparison — pass `true` as third param for strict
- `strpos()` returns 0 for match at start — use `=== false` not `!strpos()`
- Never concatenate SQL — use prepared statements with PDO
- `htmlspecialchars($s, ENT_QUOTES)` all output — prevents XSS
- `isset()` returns false for null — use `array_key_exists()` to check key exists
- `foreach ($arr as &$val)` — unset `$val` after loop or last ref persists
- `static::` late binding vs `self::` early binding — `static` respects overrides
- `@` suppresses errors — avoid, makes debugging impossible
- Catch `Throwable` for both `Error` and `Exception` — PHP 7+
- `declare(strict_types=1)` per file — enables strict type checking
- `strlen()` counts bytes — use `mb_strlen()` for UTF-8 character count
- Objects pass by reference-like handle — clone explicitly with `clone $obj`
- `array_merge()` reindexes numeric keys — use `+` operator to preserve keys
