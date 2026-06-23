---
name: rondoflow-i18n
description: Add or change user-facing UI strings in RondoFlow across all three locales (en/sk/es) without breaking the catalog parity test. Use whenever you add, rename, or remove a translation key, create a new i18n namespace, or touch any file under packages/ui/src/lib/i18n/locales/.
---

# RondoFlow i18n

Every user-facing string in the Next.js UI goes through `react-i18next`. English (`en`) is
the default and the typing source of truth; **Slovak (`sk`)** and **Spanish (`es`)** must stay
in lockstep. A vitest catalog test enforces this — skipping a locale fails CI.

## Layout

```
packages/ui/src/lib/i18n/
├── config.ts        # SUPPORTED_LOCALES, DEFAULT_LOCALE, I18N_NAMESPACES (the registry)
├── resources.ts     # eager imports of every <locale>/<ns>.json → the `resources` map
├── index.ts         # i18next instance
├── locales/{en,sk,es}/<namespace>.json
└── __tests__/locales.test.ts   # parity + no-empty + interpolation test
```

- **Locales:** `en` (default), `sk`, `es` — defined in `config.ts:SUPPORTED_LOCALES`.
- **Namespaces** (one JSON file per feature, per locale) are listed in `config.ts:I18N_NAMESPACES`:
  `common`, `shell`, `canvas`, `auth`, `settings`, `onboarding`, `notifications`,
  `agentDrawer`, `discussions`, `analytics`, `resources`, `scheduling`, `git`, `admin`,
  `panelsMisc`, `app`.
- **`common`** holds shared actions/status plus domain terminology (e.g. Agent→Assistant).
  Reuse those from other namespaces with the `common:` prefix in `t()`.

## Rendering strings in components

```tsx
import { useTranslation } from 'react-i18next'

const { t } = useTranslation('canvas')          // pick the namespace
t('toolbar.run')                                  // key within that namespace
t('common:actions.save')                          // borrow a shared key
t('runs.count', { count: n })                     // interpolation / plurals
```

## Adding or changing a key — checklist

1. **Add the key to ALL THREE files** for the namespace:
   `locales/en/<ns>.json`, `locales/sk/<ns>.json`, `locales/es/<ns>.json`.
   Same key path in each; translate the **value** (do not leave it equal to English unless
   the term is intentionally identical).
2. **Keep interpolation variables identical** across locales. `{{count}}`, `{{name}}` etc.
   must appear in every locale's value — the test compares the *set* of `{{vars}}` per key.
3. **No empty values and no `[[TODO]]` markers** — the test rejects both.
4. **Plurals:** English uses `_one`/`_other`; Slovak may add `_few`. The test is
   plural-insensitive (it collapses `_zero|one|two|few|many|other` to a base key), so
   `sk` may legitimately have a `_few` variant `en` lacks — that does not count as an extra key.
5. **Render it** via `useTranslation('<ns>')` → `t('your.key')`.
6. **Run the catalog test** (see verify below).

## Adding a NEW namespace

Three coordinated edits — the test asserts every locale declares every namespace:

1. Create `locales/{en,sk,es}/<newns>.json` (all three, even if you only have English ready —
   but they must not be empty/`[[TODO]]`, so translate up front).
2. Add `'<newns>'` to `I18N_NAMESPACES` in `config.ts`.
3. Wire it in `resources.ts`: add the three `import` lines and add the key under each locale
   in the `resources` object. (`config.ts` even says: *"Keep in sync with resources.ts."*)

## What NOT to translate

Code identifiers, model IDs (`claude-opus-4-8`), tool names, URLs, env-var names, and brand
names — **RondoFlow, Claude Code, Anthropic, PostgreSQL, Prisma**, etc. Locale autonyms in
`config.ts:LOCALE_LABELS` are also intentionally left in their own language.

## Verify (always run before declaring done)

```bash
cd packages/ui && npx vitest run src/lib/i18n/__tests__/locales.test.ts
```

The test (`__tests__/locales.test.ts`) enforces, per namespace:
- **Every namespace exists for every locale.**
- **`sk` and `es` have exactly the same (base, plural-insensitive) keys as `en`** — reports
  `missing` and `extra` keys.
- **No empty / `[[TODO]]` values** in any locale.
- **Interpolation `{{variables}}` match `en`** per key.

A failure prints the exact offending keys — fix those and re-run. The slash command
`/i18n-check` runs this same test.
