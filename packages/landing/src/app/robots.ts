import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

// Emitted as /robots.txt at build time (works with output: 'export').
// We explicitly welcome AI answer-engine crawlers (GEO): being read and cited by
// ChatGPT, Claude, Perplexity, Google AI Overviews, and Apple is the goal.
export const dynamic = 'force-static'

// Citation + search crawlers we never want to block, plus the training/opt-out
// tokens we deliberately allow (open-source posture, brand familiarity).
const AI_AGENTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Googlebot',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    host: SITE.url,
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
