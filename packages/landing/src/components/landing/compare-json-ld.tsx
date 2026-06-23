import { COMPETITORS } from '@/lib/comparison'
import { SITE } from '@/lib/site'

// Structured data for the /compare page: a breadcrumb trail and an ItemList of
// the tools being compared (RondoFlow + competitors) - the page's strongest GEO
// asset for "X vs Y" answer-engine queries.
const DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: `${SITE.url}/compare/` },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'RondoFlow vs Langflow, Flowise, Hiveflow.ai & Relay.app',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE.name, url: SITE.url },
        ...COMPETITORS.map((tool, i) => ({
          '@type': 'ListItem',
          position: i + 2,
          name: tool.name,
          url: tool.url,
        })),
      ],
    },
  ],
}

export function CompareJsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DATA) }} />
  )
}
