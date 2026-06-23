import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Origin of the @rondoflow/docs app. The docs site runs separately (dev :3002,
// prod the `docs` compose service) with basePath '/docs'; we proxy /docs to it
// so users reach the documentation at <host>/docs on the UI origin. Because the
// docs app sets basePath '/docs', the destination keeps the /docs prefix (it is
// not stripped) and this single pair of rules proxies HTML, _next/* assets and
// the Pagefind search index.
const DOCS_ORIGIN = process.env.DOCS_ORIGIN ?? 'http://localhost:3002';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  outputFileTracingRoot: resolve(__dirname, '../../'),
  async rewrites() {
    return [
      { source: '/docs', destination: `${DOCS_ORIGIN}/docs` },
      { source: '/docs/:path*', destination: `${DOCS_ORIGIN}/docs/:path*` },
    ];
  },
};

export default nextConfig;
