import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

// Emitted as /manifest.webmanifest at build time (works with output: 'export').
export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RondoFlow - Visual orchestration for Claude Code agents',
    short_name: SITE.name,
    description: SITE.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/favicon.png', type: 'image/png', sizes: '1024x1024', purpose: 'any' },
    ],
  }
}
