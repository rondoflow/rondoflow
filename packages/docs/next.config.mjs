import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import nextra from 'nextra'

const __dirname = dirname(fileURLToPath(import.meta.url))

const withNextra = nextra({
  // Built-in Pagefind search. Skip indexing fenced code blocks to keep the
  // index small and search results focused on prose.
  search: { codeblocks: false },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Served behind the UI app at <host>/docs via a Next.js rewrite proxy.
  // basePath makes every page and `_next/*` asset resolve under /docs so the
  // single rewrite rule in packages/ui can proxy both HTML and assets.
  basePath: '/docs',
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  outputFileTracingRoot: resolve(__dirname, '../../'),
  reactStrictMode: true,
}

export default withNextra(nextConfig)
