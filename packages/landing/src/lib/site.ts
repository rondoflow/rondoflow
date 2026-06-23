// Single source for outbound links and a few page-level constants. `docs` points
// at the public documentation subdomain (docs.rondoflow.app); the docs app is also
// served at <app-host>/docs (proxied) for the bundled in-app deployment.
export const SITE = {
  name: 'RondoFlow',
  tagline: 'Visual orchestration for Claude Code agents',
  repo: 'rondoflow/rondoflow',
  url: 'https://rondoflow.app',
  github: 'https://github.com/rondoflow/rondoflow',
  license: 'https://github.com/rondoflow/rondoflow/blob/master/LICENSE',
  docs: 'https://docs.rondoflow.app',

  // Community + project links. All point into the single GitHub repo for now;
  // swap to a dedicated blog/roadmap host if one is ever stood up.
  discussions: 'https://github.com/rondoflow/rondoflow/discussions',
  issues: 'https://github.com/rondoflow/rondoflow/issues/new/choose',
  changelog: 'https://github.com/rondoflow/rondoflow/releases',
  roadmap: 'https://github.com/rondoflow/rondoflow/milestones',
  contributing: 'https://github.com/rondoflow/rondoflow/blob/master/CONTRIBUTING.md',

  // Product demo video. Drop the recording into `public/` (e.g. public/demo.mp4)
  // and point `demoVideo` at it to light up the "Watch the demo" button in the
  // hero and the VideoObject structured data. Leave it empty to hide both.
  demoVideo: '/demo.webm' as string,
  demoPoster: '/demo-poster.png',
  demoTitle: 'RondoFlow product demo',
  demoDescription:
    'A short walkthrough: drag agents onto the canvas, wire them into a workflow, and run a multi-agent pipeline on your own machine.',
  demoUploadDate: '2026-06-22',
} as const

export type SiteLinks = typeof SITE

// Prefilled "suggest a catalog item" GitHub issue - opens the new-issue form
// with the `catalog` label flag and a short template ready to fill in.
const CATALOG_ISSUE_BODY = `<!-- Suggest a new item for the RondoFlow catalog -->

**Type:** agent / skill / workspace / facilitator / canvas-template

**Name:**

**What it does:**

**Why it belongs in the catalog:**

**Links or references (optional):**
`

export const CATALOG_ISSUE_URL =
  `${SITE.github}/issues/new` +
  `?labels=${encodeURIComponent('catalog')}` +
  `&title=${encodeURIComponent('Catalog: ')}` +
  `&body=${encodeURIComponent(CATALOG_ISSUE_BODY)}`
