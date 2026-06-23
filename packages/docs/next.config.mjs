import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import nextra from 'nextra'

const __dirname = dirname(fileURLToPath(import.meta.url))

const withNextra = nextra({
  // Built-in Pagefind search. Skip indexing fenced code blocks to keep the
  // index small and search results focused on prose.
  search: { codeblocks: false },
})

// STATIC_EXPORT=1 builds a self-contained static site to `out/` for hosting on
// any static host (Cloudflare Pages, GitHub Pages, etc.) with no server. In that
// mode we drop basePath so pages serve at the host root (e.g. docs.example.com)
// — set DOCS_BASE_PATH to host under a subpath instead.
const STATIC_EXPORT = process.env.STATIC_EXPORT === '1'
const basePath = STATIC_EXPORT ? process.env.DOCS_BASE_PATH || '' : '/docs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Default (no env): served behind the UI app at <host>/docs via a Next.js
  // rewrite proxy. basePath makes every page and `_next/*` asset resolve under
  // /docs so the single rewrite rule in packages/ui can proxy HTML and assets.
  basePath,
  output: STATIC_EXPORT ? 'export' : process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  trailingSlash: STATIC_EXPORT ? true : undefined,
  images: STATIC_EXPORT ? { unoptimized: true } : undefined,
  outputFileTracingRoot: resolve(__dirname, '../../'),
  reactStrictMode: true,
}

export default withNextra(nextConfig)
