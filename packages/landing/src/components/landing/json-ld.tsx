import { FAQ } from '@/lib/faq'
import { SITE } from '@/lib/site'

// Structured data for search + AI engines. Absolute URLs (JSON-LD is not
// resolved against metadataBase). @id values cross-link the graph.
const ORG_ID = `${SITE.url}/#org`
const SITE_ID = `${SITE.url}/#website`

// VideoObject for the hero demo - only emitted once a recording is wired up via
// SITE.demoVideo, since Google flags VideoObjects whose contentUrl 404s.
const VIDEO = SITE.demoVideo
  ? [
      {
        '@type': 'VideoObject',
        name: SITE.demoTitle,
        description: SITE.demoDescription,
        thumbnailUrl: [`${SITE.url}${SITE.demoPoster}`],
        contentUrl: `${SITE.url}${SITE.demoVideo}`,
        uploadDate: SITE.demoUploadDate,
        publisher: { '@id': ORG_ID },
      },
    ]
  : []

const DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/favicon.png`,
      sameAs: [SITE.github],
    },
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      name: SITE.name,
      url: SITE.url,
      publisher: { '@id': ORG_ID },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE.url}/#app`,
      name: SITE.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Linux, Windows',
      description:
        'A local-first, open-source visual canvas for orchestrating Claude Code agents into multi-agent workflows.',
      url: SITE.url,
      image: `${SITE.url}/hero.png`,
      screenshot: `${SITE.url}/hero.png`,
      publisher: { '@id': ORG_ID },
      sameAs: [SITE.github],
      license: 'https://opensource.org/licenses/MIT',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'HowTo',
      name: 'Install RondoFlow',
      description: 'Get RondoFlow running locally in three steps.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Clone the repo',
          text: 'git clone https://github.com/arzzen/rondoflow.git && cd rondoflow',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Set it up',
          text: 'npm run setup',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Start it',
          text: 'npm run dev',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    ...VIDEO,
  ],
}

export function JsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DATA) }} />
  )
}
