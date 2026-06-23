# Third-Party Notices

RondoFlow is distributed under the [MIT License](LICENSE). Its dependency tree is
overwhelmingly permissive (MIT / ISC / Apache-2.0 / BSD). There are **no** GPL,
AGPL, SSPL, BUSL, EUPL, or non-commercial dependencies.

A small number of dependencies carry weak-copyleft or attribution licenses. These
are all compatible with distributing RondoFlow under MIT: they are used **unmodified**,
and file-level (MPL-2.0) / dynamic-linking (LGPL) copyleft does not extend to
RondoFlow's own source. They are listed here for attribution.

If you redistribute RondoFlow (source or binary), keep this file with it.

## MPL-2.0 (Mozilla Public License 2.0 — file-level copyleft)

Only modifications to the original MPL-2.0 files would need to remain under MPL-2.0.
RondoFlow does not modify any of these; it consumes them as published.

| Package | Role |
| --- | --- |
| `lightningcss` (+ `lightningcss-linux-x64-gnu`, `lightningcss-linux-x64-musl`) | Build-time CSS transform (Tailwind / Next.js pipeline); not shipped to end users |
| `axe-core` | Accessibility-testing engine (development / test dependency) |
| `@vercel/og` | Present only as a vendored bundle inside Next.js (`next/dist/compiled/@vercel/og`) |

`dompurify` is dual-licensed **(MPL-2.0 OR Apache-2.0)**; RondoFlow elects the
**Apache-2.0** option, which is permissive.

## LGPL-3.0-or-later (dynamic linking)

| Package | Role |
| --- | --- |
| `@img/sharp-libvips-linux-x64`, `@img/sharp-libvips-linuxmusl-x64` | Prebuilt `libvips` native binaries loaded as **optional** native dependencies of `sharp` (Apache-2.0), which Next.js uses for image optimization |

These are unmodified prebuilt shared libraries loaded dynamically. Under LGPL this is
compatible with distributing RondoFlow's own code under MIT. To rebuild or replace
`libvips`, see the [sharp documentation](https://sharp.pixelplumbing.com/).

## CC-BY-4.0 (attribution)

| Package | Role |
| --- | --- |
| `caniuse-lite` | Browser-support dataset used at build time by browserslist / autoprefixer. Data © the caniuse contributors, licensed CC-BY-4.0 |

---

This notice is best-effort and generated from an automated scan of the dependency
tree. License metadata can change between versions — re-verify before a formal
release. To regenerate the underlying data, inspect the `license` field of each
package under `node_modules`.
