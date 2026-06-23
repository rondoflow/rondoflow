import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Static marketing site for RondoFlow. Exported to plain HTML/CSS/JS (`out/`)
 * so it can be hosted on any static host (GitHub Pages, Cloudflare Pages,
 * Vercel) with no server. The catalog overview is baked in at build time.
 *
 * `transpilePackages` is required because `@rondoflow/catalog`'s entry point is
 * raw TypeScript (`src/index.ts`). It is browser-safe - it re-exports the Zod
 * schema as *types only*, so neither Zod nor `fs` reaches this bundle.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ['@rondoflow/catalog', '@rondoflow/shared'],
  outputFileTracingRoot: resolve(__dirname, '../../'),
  reactStrictMode: true,
  // basePath: '' - set to '/<repo>' if hosting on a GitHub-Pages project subpath.
}

export default nextConfig
