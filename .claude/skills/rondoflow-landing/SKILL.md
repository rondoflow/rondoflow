---
name: rondoflow-landing
description: Conventions for editing the RondoFlow landing/marketing site (packages/landing). Use when adding or changing copy, components, or content in packages/landing — covers the static-export setup and the house copy style rules (no em dashes).
---

# RondoFlow landing site conventions

`packages/landing` (@rondoflow/landing) is the public marketing site: Next.js App Router, light-themed, **static-exported** (`output: 'export'` → `out/`). Dev on port 3003 via `npm run dev:landing`; build with `npx turbo build --filter=@rondoflow/landing`. It renders the catalog by importing `@rondoflow/catalog` directly (browser-safe).

## Copy style rules

- **No em dashes.** Never use the `—` (U+2014 em dash) character anywhere in landing source — copy, JSX text, comments, metadata, config. Use a plain hyphen `-` instead. This applies to all of `packages/landing` (the `out/` build output regenerates, so don't hand-edit it).
  - To audit: `grep -rl "—" packages/landing/src packages/landing/*.ts packages/landing/*.mjs`
  - To fix in bulk: `grep -rl "—" packages/landing/src | while read f; do sed -i 's/—/-/g' "$f"; done`

## Notes

- Heavy catalog fields (personas, SKILL.md) are dropped server-side in `catalog-overview.tsx` so they never reach the client bundle.
- `next.config.mjs` sets `transpilePackages: ['@rondoflow/catalog','@rondoflow/shared']` because the catalog entry is raw TS.
- `src/lib/site.ts` `SITE.docs` is a placeholder until the docs subdomain DNS exists.
