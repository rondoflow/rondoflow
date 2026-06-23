# @rondoflow/docs

Static documentation site for RondoFlow, built with [Nextra 4](https://nextra.site).

It runs as a standalone Next.js app (default port **3002**) with `basePath: '/docs'`
and is served to users at `<host>/docs` — the `@rondoflow/ui` app proxies `/docs`
to this app via a Next.js `rewrites()` rule (see `packages/ui/next.config.mjs`,
configurable through the `DOCS_ORIGIN` env var).

## Develop

```bash
# from the repo root — starts ui (3000), server (3001) and docs (3002)
npm run dev

# docs only
npm run dev:docs
```

Open <http://localhost:3000/docs> (through the UI proxy) or
<http://localhost:3002/docs> (direct).

## Content

Documentation pages live in `content/` as MDX. Sidebar order and titles are
declared per-directory in `_meta.ts` files. Add a page by creating an `.mdx`
file and (optionally) listing it in the sibling `_meta.ts`.

## Build

```bash
npm run build --workspace=@rondoflow/docs
```

`build` runs `next build`; the `postbuild` step generates the Pagefind search
index into `public/_pagefind`. In Docker the `public/` directory must be copied
into the standalone runtime image (see `Dockerfile`).
